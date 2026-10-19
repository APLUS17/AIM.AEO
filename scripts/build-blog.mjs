// Builds the blog: content/blog/*.md -> blog/index.html + blog/<slug>.html.
// Only non-draft posts dated today (US Eastern) or earlier are published, so a future `date:` schedules a post
// and `status: draft` holds one back until it is approved.
// Run it daily (and after edits) and commit blog/.
//   BLOG_TODAY=2026-10-16 npm run blog   preview a given day
//   BLOG_CONTENT_DIR / BLOG_OUT_DIR       override the folders (used by tests)
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePost, selectPublished, renderIndex, renderPost, todayInEastern } from '../lib/blog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.resolve(root, process.env.BLOG_CONTENT_DIR || 'content/blog');
const outDir = path.resolve(root, process.env.BLOG_OUT_DIR || 'blog');
const today = process.env.BLOG_TODAY || todayInEastern();
const siteUrl = process.env.SITE_URL || '';

const files = (await readdir(contentDir).catch(() => [])).filter((f) => f.endsWith('.md')).sort();
const posts = [];
for (const file of files) posts.push(parsePost(await readFile(path.join(contentDir, file), 'utf8'), file));

const slugs = new Set();
for (const post of posts) {
  if (slugs.has(post.slug)) throw new Error(`Duplicate slug "${post.slug}"`);
  slugs.add(post.slug);
}

const live = selectPublished(posts, today);

// Rebuild from scratch so unpublished or deleted posts never linger.
await mkdir(outDir, { recursive: true });
for (const f of await readdir(outDir)) if (f.endsWith('.html')) await rm(path.join(outDir, f));

await writeFile(path.join(outDir, 'index.html'), renderIndex(live, { siteUrl }));
for (const post of live) {
  const related = live.filter((p) => p.slug !== post.slug).slice(0, 3);
  await writeFile(path.join(outDir, `${post.slug}.html`), renderPost(post, related, { siteUrl }));
}

const drafts = posts.filter((p) => p.status === 'draft');
const scheduled = posts.filter((p) => p.status !== 'draft' && p.date > today).sort((a, b) => a.date.localeCompare(b.date));
console.log(`Blog built for ${today}: ${live.length} live, ${scheduled.length} scheduled, ${drafts.length} drafts (never published until status changes).`);
for (const p of scheduled) console.log(`  ${p.date}  ${p.slug}`);
