import { waitUntil } from '@vercel/functions';
import { validateInput } from '../lib/validate.js';
import { gradeBrand } from '../lib/report.js';
import { renderReportEmail, renderLeadEmail, sendEmail, canSendEmail } from '../lib/email.js';

// Best-effort per-IP limit. Serverless instances don't share memory, so this only slows
// a single abuser on a warm instance; use a shared store (e.g. Vercel KV) for a hard limit.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

// Grades the brand, then emails the report to the requester and the lead to the owner.
export async function processGrade(input, env, log = console) {
  const report = await gradeBrand(input, env, log);

  if (!canSendEmail(env)) {
    log.warn?.('[grader] RESEND_API_KEY / FROM_EMAIL not set; report not emailed.');
    log.info?.(`[grader] ${input.company}: ${report.score.total}/100 (${report.mode})`);
    return { report, emailed: false };
  }

  const reportEmail = renderReportEmail(report, { siteUrl: env.SITE_URL });
  await sendEmail({ to: input.email, ...reportEmail, replyTo: env.OWNER_EMAIL }, env);

  if (env.OWNER_EMAIL) {
    try {
      await sendEmail({ to: env.OWNER_EMAIL, ...renderLeadEmail(report), replyTo: input.email }, env);
    } catch (error) {
      log.error?.(`[grader] lead email failed: ${error.message}`);
    }
  }
  return { report, emailed: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON' });
  }

  // Honeypot: real users never fill the hidden "website" field. Pretend success for bots.
  if (body && typeof body.website === 'string' && body.website.trim()) {
    return send(res, 202, { ok: true });
  }

  const checked = validateInput(body);
  if (!checked.ok) return send(res, 400, { error: 'Invalid input', fields: checked.errors });

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return send(res, 429, { error: 'Too many requests. Try again in an hour.' });
  }

  const job = processGrade(checked.value, process.env).catch(error => {
    console.error(`[grader] grade failed for ${checked.value.company}: ${error.message}`);
  });

  // Respond right away; Vercel keeps the function alive until the job finishes.
  waitUntil(job);
  return send(res, 202, { ok: true });
}
