import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePost, markdownToHtml, selectPublished, renderIndex, renderPost, formatDate } from '../lib/blog.js';

const source = `---
title: Can AI read your site?
description: A quick check of what AI crawlers can see.
date: 2026-10-15
tags: AEO, crawlers
---
Intro with **bold**, *italic*, \`code\` and a [link](https://example.com).

## Step one

1. First
2. Second

| Old | New |
|---|---|
| SEO | AEO |
`;

test('parsePost reads front matter, derives the slug and read time', () => {
  const post = parsePost(source, '2026-10-15-can-ai-read-your-site.md');
  assert.equal(post.slug, 'can-ai-read-your-site');
  assert.equal(post.date, '2026-10-15');
  assert.equal(post.category, 'AEO');
  assert.deepEqual(post.tags, ['AEO', 'crawlers']);
  assert.equal(post.minutes, 1);
});

test('parsePost rejects missing fields and bad dates', () => {
  assert.throws(() => parsePost('no front matter', 'a.md'), /front matter/);
  assert.throws(() => parsePost('---\ntitle: x\n---\nbody', 'a.md'), /description/);
  assert.throws(() => parsePost('---\ntitle: x\ndescription: y\ndate: 10/15/2026\n---\nbody', 'a.md'), /YYYY-MM-DD/);
});

test('markdownToHtml renders the supported subset', () => {
  const html = markdownToHtml(source.split('---\n')[2]);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<h2 id="step-one">Step one<\/h2>/);
  assert.match(html, /<ol><li>First<\/li><li>Second<\/li><\/ol>/);
  assert.match(html, /<th scope="col">Old<\/th>/);
});

test('markdownToHtml escapes HTML and drops unsafe links', () => {
  const html = markdownToHtml('<script>alert(1)</script> [x](javascript:alert(1)) [ok](/blog/)');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('javascript:'));
  assert.match(html, /href="\/blog\/"/);
});

test('selectPublished hides future posts and sorts newest first', () => {
  const posts = [
    { slug: 'b', date: '2026-10-16' },
    { slug: 'a', date: '2026-10-15' },
    { slug: 'c', date: '2026-10-20' }
  ];
  assert.deepEqual(selectPublished(posts, '2026-10-16').map((p) => p.slug), ['b', 'a']);
  assert.deepEqual(selectPublished(posts, '2026-10-14'), []);
});

test('pages render, with an empty state and Article schema', () => {
  assert.match(renderIndex([]), /first posts are on their way/);
  const post = parsePost(source, '2026-10-15-can-ai-read-your-site.md');
  assert.match(renderIndex([post]), /href="\/blog\/can-ai-read-your-site\.html"/);
  const page = renderPost(post, [], { siteUrl: 'https://example.com/' });
  assert.match(page, /"@type":"Article"/);
  assert.match(page, /rel="canonical" href="https:\/\/example\.com\/blog\/can-ai-read-your-site\.html"/);
  assert.equal(formatDate('2026-10-15'), 'Oct 15, 2026');
});
