// Runs the pattern check over content/blog/. Exit code 1 if any post that can publish has an error.
//   npm run blog:lint            lint posts that can publish (everything except status: draft)
//   npm run blog:lint -- --all   lint drafts too (warnings only for drafts; errors still shown)
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePost, todayInEastern } from '../lib/blog.js';
import { lintPost } from '../lib/lint.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.resolve(root, process.env.BLOG_CONTENT_DIR || 'content/blog');
const includeDrafts = process.argv.includes('--all');

const files = (await readdir(contentDir).catch(() => [])).filter((f) => f.endsWith('.md')).sort();
const loaded = [];
for (const file of files) {
  const source = await readFile(path.join(contentDir, file), 'utf8');
  loaded.push({ file, post: parsePost(source, file), body: source.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, '') });
}
const known = new Map(loaded.map((l) => [l.post.slug, { date: l.post.date, status: l.post.status }]));
const today = process.env.BLOG_TODAY || todayInEastern();

let errors = 0;
let warnings = 0;
for (const { file, post, body } of loaded) {
  if (post.status === 'draft' && !includeDrafts) continue;
  const issues = lintPost(post, body, known, { today });
  if (!issues.length) continue;
  console.log(`${file} (${post.status})`);
  for (const i of issues) {
    console.log(`  ${i.level === 'error' ? 'ERROR' : 'warn '}  [${i.rule}] ${i.message}`);
    if (i.level === 'error') errors++;
    else warnings++;
  }
}
console.log(`Checked ${loaded.filter((l) => includeDrafts || l.post.status !== 'draft').length} posts: ${errors} errors, ${warnings} warnings.`);
process.exit(errors ? 1 : 0);
