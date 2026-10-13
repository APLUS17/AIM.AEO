import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { gradeBrand } from '../lib/report.js';
import { renderReportEmail } from '../lib/email.js';
import { processGrade } from '../api/grade.js';
import { profileBrand, extractPageText } from '../lib/profile.js';
import { isPrivateAddress, fetchHtml } from '../lib/safe-fetch.js';
import handler from '../api/grade.js';

// What the form sends, and the same brand once the profile step has filled in what it sells.
const input = { company: 'Acme', url: 'https://acme.test', email: 'owner@acme.test' };
const profiled = { ...input, product: 'CRM software', industry: 'Technology', location: 'United States' };
const quiet = { error() {}, warn() {}, info() {} };
const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

const JUDGMENT = {
  mentioned: true, recognition: 'specific', rank: 2, sentiment: 'positive', depth: 'medium',
  source_quality: 'medium', data_richness: 'high', category_role: 'challenger', innovation: 'innovator',
  competitors: ['Globex'], evidence: 'Acme is praised for onboarding.'
};

function anthropicMessage(text) {
  return {
    id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5',
    content: [{ type: 'text', text }], stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 }
  };
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Fake the three engines, the judge, and Resend at the network layer.
function installFakeNetwork({ rejectFallbackBeta = false } = {}) {
  const calls = { anthropic: [], openai: 0, perplexity: 0, resend: [] };
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url instanceof Request ? url.url : url);
    const body = init.body ? JSON.parse(init.body) : {};
    const headers = new Headers(init.headers);

    if (href.startsWith('https://api.anthropic.com/v1/messages')) {
      const beta = headers.get('anthropic-beta') ?? '';
      calls.anthropic.push({ beta, body, key: headers.get('x-api-key') });
      if (rejectFallbackBeta && body.fallbacks) {
        return json({ type: 'error', error: { type: 'invalid_request_error', message: 'fallbacks not supported' } }, 400);
      }
      const format = body.output_config?.format;
      if (format?.schema?.required?.includes('growth_areas')) {
        return json(anthropicMessage(JSON.stringify({ summary: 'Solid start.', strengths: ['Good sentiment'], growth_areas: ['Get cited more'] })));
      }
      if (format?.schema?.required?.includes('industry')) {
        return json(anthropicMessage(JSON.stringify({ product: 'crm software', industry: 'software', location: 'United States' })));
      }
      if (format) return json(anthropicMessage(JSON.stringify(JUDGMENT)));
      return json(anthropicMessage('Acme and Globex are popular choices.'));
    }
    if (href === 'https://api.openai.com/v1/chat/completions') {
      calls.openai += 1;
      return json({ choices: [{ message: { content: 'Try Acme or Globex.' } }] });
    }
    if (href === 'https://api.perplexity.ai/chat/completions') {
      calls.perplexity += 1;
      return json({ choices: [{ message: { content: 'Acme [1]' } }], citations: ['https://g2.com/acme'] });
    }
    if (href === 'https://api.resend.com/emails') {
      calls.resend.push({ body, auth: headers.get('authorization') });
      return json({ id: 'email_test' });
    }
    throw new Error(`Unexpected fetch: ${href}`);
  };
  return calls;
}

const liveEnv = {
  ANTHROPIC_API_KEY: 'sk-ant-test', OPENAI_API_KEY: 'sk-openai-test', PERPLEXITY_API_KEY: 'pplx-test',
  RESEND_API_KEY: 're_test', FROM_EMAIL: 'Grader <grader@brand.test>', OWNER_EMAIL: 'me@brand.test', SITE_URL: 'https://brand.test'
};

test('mock mode runs end to end without keys and labels the output', async () => {
  const report = await gradeBrand(profiled, {}, quiet);
  assert.equal(report.mode, 'mock');
  assert.equal(report.checks.attempted, 15); // 5 prompts x 3 engines
  assert.equal(report.checks.succeeded, 15);
  assert.ok(report.score.total >= 0 && report.score.total <= 100);

  const again = await gradeBrand(profiled, {}, quiet);
  assert.equal(again.score.total, report.score.total, 'mock scores are deterministic');

  const email = renderReportEmail(report, {});
  assert.match(email.subject, /^\[Sample data\]/);
  assert.match(email.html, /Sample data/);
});

test('live mode queries all three engines, judges every answer, and summarizes', async () => {
  const calls = installFakeNetwork();
  const report = await gradeBrand(profiled, liveEnv, quiet);

  assert.equal(report.mode, 'live');
  assert.deepEqual(report.engines, ['ChatGPT', 'Claude', 'Perplexity']);
  assert.equal(calls.openai, 5);
  assert.equal(calls.perplexity, 5);
  // 5 Claude answers + 15 judgments + 1 summary
  assert.equal(calls.anthropic.length, 21);
  assert.ok(calls.anthropic.every(c => c.beta.includes('server-side-fallback-2026-07-01')));
  assert.ok(calls.anthropic.every(c => c.body.fallbacks === 'default'));
  assert.ok(calls.anthropic.every(c => c.body.model === 'claude-opus-5-5'));

  const perplexityRow = report.results.find(r => r.engineId === 'perplexity');
  assert.deepEqual(perplexityRow.answer.citations, ['https://g2.com/acme']);
  assert.equal(report.interpretation.summary, 'Solid start.');
  assert.equal(report.score.total, 82);
});

test('Claude calls retry without fallbacks when the beta is rejected', async () => {
  const calls = installFakeNetwork({ rejectFallbackBeta: true });
  const report = await gradeBrand(profiled, { ANTHROPIC_API_KEY: 'sk-ant-test' }, quiet);
  assert.equal(report.mode, 'live');
  assert.deepEqual(report.skippedEngines, ['ChatGPT', 'Perplexity']);
  assert.equal(report.checks.succeeded, 5);
  assert.ok(calls.anthropic.some(c => !c.body.fallbacks), 'retried without fallbacks');
});

test('engine failures are tolerated up to half; beyond that the grade fails', async () => {
  installFakeNetwork();
  const wrapped = globalThis.fetch;
  globalThis.fetch = async (url, init) =>
    String(url).includes('openai.com') ? new Response('boom', { status: 500 }) : wrapped(url, init);
  const report = await gradeBrand(profiled, liveEnv, quiet);
  assert.equal(report.checks.succeeded, 10);
  assert.equal(report.failures.length, 5);

  globalThis.fetch = async () => new Response('down', { status: 503 });
  await assert.rejects(gradeBrand(profiled, { ...liveEnv }, quiet), /checks succeeded/);
});

test('processGrade emails the report to the requester and the lead to the owner', async () => {
  const calls = installFakeNetwork();
  const { emailed } = await processGrade(profiled, liveEnv, quiet);
  assert.equal(emailed, true);
  assert.equal(calls.resend.length, 2);

  const [report, lead] = calls.resend;
  assert.deepEqual(report.body.to, ['owner@acme.test']);
  assert.equal(report.body.from, 'Grader <grader@brand.test>');
  assert.match(report.body.subject, /Acme scored 82\/100/);
  assert.match(report.body.html, /https:\/\/brand\.test/);
  assert.equal(report.auth, 'Bearer re_test');
  assert.deepEqual(lead.body.to, ['me@brand.test']);
  assert.equal(lead.body.reply_to, 'owner@acme.test');
});

test('report email escapes user and AI text', async () => {
  const report = await gradeBrand({ ...profiled, company: '<script>x</script>' }, {}, quiet);
  const { html } = renderReportEmail(report, {});
  assert.ok(!html.includes('<script>x</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

// Minimal req/res doubles for the HTTP handler.
function call(method, body, ip = '1.1.1.1') {
  const req = { method, body, headers: { 'x-forwarded-for': ip }, socket: {} };
  return new Promise(resolve => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      end(payload) { resolve({ status: this.statusCode, body: payload ? JSON.parse(payload) : null }); }
    };
    handler(req, res);
  });
}

test('handler: rejects GET, bad input, honeypot, and rate-limits', async () => {
  assert.equal((await call('GET')).status, 405);

  const bad = await call('POST', { company: 'Acme' }, '2.2.2.2');
  assert.equal(bad.status, 400);
  assert.ok(bad.body.fields.email);

  const bot = await call('POST', { ...input, fax: 'spam.example' }, '3.3.3.3');
  assert.equal(bot.status, 202);

  const ip = '4.4.4.4';
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await call('POST', input, ip)).status);
  assert.deepEqual(statuses, [202, 202, 202, 202, 202, 429]);
});

const PAGE = `<!doctype html><html><head><title>Acme CRM</title>
<meta name="description" content="CRM software for small teams">
<style>.x{color:red}</style><script>var secret = 1;</script></head>
<body><h1>Close more deals</h1><p>Acme &amp; friends build a CRM.</p></body></html>`;

test('profile step reads the site and Claude works out what the company sells', async () => {
  const calls = installFakeNetwork();
  const fetched = [];
  const report = await gradeBrand(input, liveEnv, quiet, {
    fetchPage: async url => {
      fetched.push(url);
      return { url, html: PAGE };
    }
  });

  assert.deepEqual(fetched, ['https://acme.test']);
  assert.equal(report.input.product, 'crm software');
  assert.equal(report.input.industry, 'software');
  assert.equal(report.input.location, 'United States');
  assert.equal(report.input.profileSource, 'site');
  assert.ok(report.results.some(r => r.question.includes('crm software')));
  // 1 profile + 5 Claude answers + 15 judgments + 1 summary
  assert.equal(calls.anthropic.length, 22);
  const profileCall = calls.anthropic[0].body.messages[0].content;
  assert.match(profileCall, /Title: Acme CRM/);
  assert.match(profileCall, /CRM software for small teams/);
  assert.match(profileCall, /Acme & friends build a CRM/);
  assert.ok(!profileCall.includes('secret'), 'scripts are stripped');
});

test('profile step falls back to what Claude knows when the site cannot be read', async () => {
  const calls = installFakeNetwork();
  const profile = await profileBrand(input, liveEnv, {
    mode: 'live',
    log: quiet,
    fetchPage: async () => {
      throw new Error('boom');
    }
  });
  assert.equal(profile.profileSource, 'model');
  assert.equal(profile.product, 'crm software');
  assert.match(calls.anthropic[0].body.messages[0].content, /could not be read/);
});

test('mock mode never touches the network for the profile', async () => {
  const report = await gradeBrand(input, {}, quiet, {
    fetchPage: async () => {
      throw new Error('should not fetch in mock mode');
    }
  });
  assert.equal(report.mode, 'mock');
  assert.equal(report.input.profileSource, 'sample');
  assert.equal(report.checks.succeeded, 15);
});

test('page text extraction keeps the signal and drops scripts and styles', () => {
  const text = extractPageText(PAGE);
  assert.match(text, /Title: Acme CRM/);
  assert.match(text, /Headings: Close more deals/);
  assert.ok(!text.includes('secret') && !text.includes('color:red'));
});

test('safe fetch refuses private, loopback and metadata addresses', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a00:1', 'not-an-ip']) {
    assert.equal(isPrivateAddress(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '93.184.216.34', '2606:4700:4700::1111', '::ffff:808:808']) {
    assert.equal(isPrivateAddress(ip), false, ip);
  }

  for (const url of ['http://127.0.0.1/', 'http://localhost/', 'http://169.254.169.254/latest/meta-data/', 'http://[::1]/', 'http://acme.test:8080/', 'ftp://acme.test/', 'https://user:pw@acme.test/', 'http://printer.local/']) {
    await assert.rejects(fetchHtml(url), /Blocked|allowed|credentials/, url);
  }
});
