import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertReady, parseBrands, slugify, summaryRow, SUMMARY_HEADER, toCsv } from '../lib/batch.js';

const keys = { ANTHROPIC_API_KEY: 'a', OPENAI_API_KEY: 'o', PERPLEXITY_API_KEY: 'p' };

test('a study refuses sample mode and missing engines, and passes with all three keys', () => {
  assert.throws(() => assertReady({ ...keys, GRADER_MODE: 'mock' }), /made-up/);
  assert.throws(() => assertReady({}), /Missing ANTHROPIC_API_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY/);
  assert.throws(() => assertReady({ ANTHROPIC_API_KEY: 'a' }), /Missing OPENAI_API_KEY, PERPLEXITY_API_KEY/);
  assert.doesNotThrow(() => assertReady(keys));
  assert.doesNotThrow(() => assertReady({ ANTHROPIC_API_KEY: 'a' }, { allowPartial: true }));
  assert.throws(() => assertReady({ OPENAI_API_KEY: 'o' }, { allowPartial: true }), /ANTHROPIC_API_KEY/);
});

test('parseBrands reads quoted CSV, optional columns, and rejects bad files', () => {
  const brands = parseBrands('company,url,industry\n"Acme, Inc.",https://acme.test,Software\nGlobex,https://globex.test,\n');
  assert.equal(brands.length, 2);
  assert.deepEqual(brands[0].input, { company: 'Acme, Inc.', url: 'https://acme.test', email: 'research@example.invalid', industry: 'Software' });
  assert.equal(brands[0].slug, 'acme-inc');
  assert.equal(brands[1].input.industry, undefined);
  assert.throws(() => parseBrands('company\nAcme\n'), /"url" column/);
  assert.throws(() => parseBrands('company,url\nAcme,\n'), /both required/);
  assert.throws(() => parseBrands('company,url\nAcme,https://a.test\nacme,https://b.test\n'), /twice/);
  assert.throws(() => parseBrands(''), /empty/);
  assert.equal(slugify('  Ünïcode & Co.  '), 'n-code-co');
});

test('summaryRow and toCsv flatten a report into one safe CSV row', () => {
  const report = {
    input: { company: 'Acme, Inc.', url: 'https://acme.test' },
    score: { total: 72, band: 'Solid', dimensions: [
      { id: 'sentiment', points: 30 }, { id: 'presence', points: 15 }, { id: 'recognition', points: 14 },
      { id: 'share_of_voice', points: 6 }, { id: 'market', points: 7 }] },
    engines: ['ChatGPT', 'Claude', 'Perplexity'], checks: { attempted: 15, succeeded: 15 }, failures: [], generatedAt: '2026-10-18T00:00:00Z'
  };
  const row = summaryRow(report);
  assert.equal(row.length, SUMMARY_HEADER.length);
  const csv = toCsv([SUMMARY_HEADER, row]).split('\n');
  assert.match(csv[1], /^"Acme, Inc.",https:\/\/acme.test,72,Solid,30,15,14,6,7,ChatGPT\+Claude\+Perplexity,15,15,0,/);
});
