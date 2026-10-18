// The blog plan: render the plan files, seed the Content Desk dashboard, and apply its edits back to the blog.
//
//   node scripts/plan.mjs render                         rewrite schedule.md, schedule.csv, approvals.md, briefs/, emails/
//   node scripts/plan.mjs seed [out.json]                write the dashboard's documents (default plan/dashboard-seed.json)
//   node scripts/plan.mjs apply <changes.json> [--dry]   apply dashboard edits to content/blog and plan/posts.json
//
// changes.json looks like { "P01": { "status": "hold", "date": "2026-10-21", "title": "...", "body": "..." } }.
// apply changes nothing if any edit is invalid. After it, run `npm run blog:lint` and `npm test`.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyChanges, bodyOf, renderApprovals, renderBrief, renderCsv, renderEmail, renderScheduleMd, seedDocs, sortPosts, withWeeks
} from '../lib/plan.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const planDir = path.join(root, 'plan');
const postsFile = path.join(planDir, 'posts.json');
const load = () => JSON.parse(readFileSync(postsFile, 'utf8'));
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  writeFileSync(path.join(root, rel), text);
};

function render(posts) {
  write('plan/schedule.md', renderScheduleMd(posts));
  write('plan/schedule.csv', renderCsv(posts));
  write('plan/approvals.md', renderApprovals(posts));
  const weeks = [...new Set(withWeeks(posts).filter((p) => p.kind === 'scheduled').map((p) => p.week))].sort((a, b) => a - b);
  for (const w of weeks) {
    const n = String(w).padStart(2, '0');
    write(`plan/briefs/week-${n}.md`, renderBrief(w, posts));
    write(`plan/emails/week-${n}.md`, renderEmail(w, posts));
  }
  console.log(`Rendered ${posts.filter((p) => p.kind === 'scheduled').length} scheduled posts across ${weeks.length} weeks.`);
}

const [cmd, arg] = process.argv.slice(2);
const flags = process.argv.slice(2);

if (cmd === 'render') {
  render(load().posts);
} else if (cmd === 'seed') {
  const docs = seedDocs(load().posts, (file) => bodyOf(read(file)));
  const out = arg || 'plan/dashboard-seed.json';
  write(out, JSON.stringify(docs, null, 2) + '\n');
  console.log(`Wrote ${docs.length} documents to ${out}.`);
} else if (cmd === 'apply' && arg) {
  const changes = JSON.parse(readFileSync(path.resolve(arg), 'utf8'));
  const data = load();
  let result;
  try {
    result = applyChanges(data.posts, changes, { read }, process.env.PLAN_TODAY);
  } catch (error) {
    console.error(`Nothing changed: ${error.message}`);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn(`warning: ${w}`);
  console.log(`${Object.keys(changes).length} post(s) edited: ${result.writes.length} file(s) written, ${result.removes.length} removed.`);
  if (flags.includes('--dry')) process.exit(0);
  for (const { path: p, content } of result.writes) write(p, content);
  for (const p of result.removes) if (existsSync(path.join(root, p))) rmSync(path.join(root, p));
  write('plan/posts.json', JSON.stringify({ ...data, posts: sortPosts(result.posts) }, null, 2) + '\n');
  render(result.posts);
} else {
  console.error('Usage: node scripts/plan.mjs render | seed [out.json] | apply <changes.json> [--dry]');
  process.exit(2);
}
