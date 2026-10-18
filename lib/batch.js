// Helpers for scripts/run-batch.mjs, which grades many brands for the data posts.
// Pure functions so they can be tested without any API keys.

export const REQUIRED_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY'];

// A study must never run on sample data or on a partial set of engines by accident.
export function assertReady(env, { allowPartial = false } = {}) {
  if (env.GRADER_MODE === 'mock') {
    throw new Error('GRADER_MODE=mock produces made-up scores. Unset it before running a study.');
  }
  const missing = (allowPartial ? ['ANTHROPIC_API_KEY'] : REQUIRED_KEYS).filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(', ')}. Without all three engines a study would silently skip one. ` +
        'Add the keys as environment secrets, or pass --allow-partial and say so in the post.'
    );
  }
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brand';
}

// Parses CSV with a header row. Required columns: company, url. Optional: product, industry, location.
export function parseBrands(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const text = csv.replace(/\r\n/g, '\n');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) throw new Error('The brands file is empty.');
  const cols = header.map((h) => h.trim().toLowerCase());
  for (const need of ['company', 'url']) {
    if (!cols.includes(need)) throw new Error(`The brands file needs a "${need}" column.`);
  }
  const seen = new Set();
  return body.map((cells, n) => {
    const rec = Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]));
    if (!rec.company || !rec.url) throw new Error(`Row ${n + 2}: company and url are both required.`);
    const slug = slugify(rec.company);
    if (seen.has(slug)) throw new Error(`Row ${n + 2}: "${rec.company}" appears twice.`);
    seen.add(slug);
    // The grader's email field is never used here; nothing is sent to anyone.
    const input = { company: rec.company, url: rec.url, email: 'research@example.invalid' };
    for (const k of ['product', 'industry', 'location']) if (rec[k]) input[k] = rec[k];
    return { slug, input };
  });
}

export const SUMMARY_HEADER = [
  'company', 'url', 'total', 'band', 'sentiment', 'presence', 'recognition', 'share_of_voice', 'market',
  'engines', 'checks_attempted', 'checks_succeeded', 'failures', 'generated_at'
];

// One flat row per brand, for the summary CSV.
export function summaryRow(report) {
  const pts = Object.fromEntries(report.score.dimensions.map((d) => [d.id, d.points]));
  return [
    report.input.company, report.input.url, report.score.total, report.score.band,
    pts.sentiment, pts.presence, pts.recognition, pts.share_of_voice, pts.market,
    report.engines.join('+'), report.checks.attempted, report.checks.succeeded, report.failures.length, report.generatedAt
  ];
}

export function toCsv(rows) {
  const cell = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
}
