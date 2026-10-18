// Grades many brands with the same pipeline as the AI Search Grader, for the data posts (P03, P39 to P41, P44).
// It never emails anyone and never notifies leads. It refuses to run on sample data or without all three engines.
//
//   node scripts/run-batch.mjs --brands data/brands.csv --pilot 3     try the first 3 brands and look at the output
//   node scripts/run-batch.mjs --brands data/brands.csv               run every brand (skips ones already done)
//   node scripts/run-batch.mjs --brands data/brands.csv --dry         show what would run, make no calls
//
// Keys come from the environment (ANTHROPIC_API_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY); .env.local is read if present.
// Output goes to data/runs/<date>/: one JSON per brand (every raw answer and judgment), summary.csv, and run-meta.json,
// which records the models and settings so a post can disclose its method.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    const value = m?.[2].replace(/^["']|["']$/g, '');
    if (m && value && !(m[1] in process.env)) process.env[m[1]] = value;
  }
}

const { assertReady, parseBrands, summaryRow, SUMMARY_HEADER, toCsv } = await import('../lib/batch.js');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);

const brandsFile = opt('brands');
if (!brandsFile) {
  console.error('Usage: node scripts/run-batch.mjs --brands <file.csv> [--pilot N] [--dry] [--allow-partial] [--out dir]');
  process.exit(2);
}

const env = process.env;
const brands = parseBrands(await readFile(path.resolve(root, brandsFile), 'utf8'));
const pilot = Number(opt('pilot')) || brands.length;
const todo = brands.slice(0, pilot);
const runs = Math.min(Math.max(parseInt(env.RUNS_PER_PROMPT, 10) || 1, 1), 3);
const checksPerBrand = 5 * 3 * runs; // 5 questions x 3 engines x runs per prompt

console.log(`${todo.length} brand(s), ${runs} run(s) per question: ${checksPerBrand} engine answers and ${checksPerBrand} judgments per brand, plus one profile and one summary call each.`);
if (flag('dry')) process.exit(0);

try {
  assertReady(env, { allowPartial: flag('allow-partial') });
} catch (error) {
  console.error(`Not running: ${error.message}`);
  process.exit(1);
}

// Loaded only after the guards pass, so a refusal never depends on the grader's dependencies being installed.
const { gradeBrand } = await import('../lib/report.js');
const { judgeModel } = await import('../lib/judge.js');
const { DEFAULT_CLAUDE_MODEL } = await import('../lib/claude.js');

const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(root, opt('out') || path.join('data', 'runs', stamp));
await mkdir(outDir, { recursive: true });

const meta = {
  date: stamp,
  runsPerPrompt: runs,
  models: {
    chatgpt: env.OPENAI_MODEL || 'gpt-5-mini',
    claude: env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
    perplexity: env.PERPLEXITY_MODEL || 'sonar',
    judge: judgeModel(env)
  },
  notes: [
    'These are API models. They are not the same as the ChatGPT and Claude apps buyers use.',
    'ChatGPT and Claude are called without a web-search tool; Perplexity (sonar) searches the live web.',
    'The judge is a Claude model, and Claude is also one of the engines being judged.'
  ]
};
await writeFile(path.join(outDir, 'run-meta.json'), JSON.stringify(meta, null, 2));

const exists = (p) => access(p).then(() => true, () => false);
const rows = [SUMMARY_HEADER];
let done = 0;
for (const { slug, input } of todo) {
  const file = path.join(outDir, `${slug}.json`);
  let report;
  if (await exists(file)) {
    report = JSON.parse(await readFile(file, 'utf8'));
    console.log(`skip  ${input.company} (already done)`);
  } else {
    try {
      report = await gradeBrand(input, env, { error: console.error, warn() {}, info() {} });
      await writeFile(file, JSON.stringify(report, null, 2));
      console.log(`done  ${input.company}: ${report.score.total}/100 (${report.checks.succeeded}/${report.checks.attempted} checks)`);
    } catch (error) {
      console.error(`FAIL  ${input.company}: ${error.message}`);
      continue;
    }
  }
  rows.push(summaryRow(report));
  done++;
}
await writeFile(path.join(outDir, 'summary.csv'), toCsv(rows));
console.log(`Finished ${done} of ${todo.length}. Output: ${path.relative(root, outDir)}`);
process.exit(done === todo.length ? 0 : 1);
