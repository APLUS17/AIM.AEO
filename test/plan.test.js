import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyChanges, bodyOf, renderCsv, seedDocs, withWeeks } from '../lib/plan.js';

const { posts } = JSON.parse(readFileSync(new URL('../plan/posts.json', import.meta.url), 'utf8'));
const io = { read: (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8') };
const today = '2026-10-18';

test('posts.json has live posts, 46 scheduled posts, and no two scheduled posts on one day', () => {
  assert.equal(posts.filter((p) => p.kind === 'scheduled').length, 46);
  assert.ok(posts.filter((p) => p.kind === 'live').length >= 7);
  const dates = posts.filter((p) => p.kind === 'scheduled').map((p) => p.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.ok(withWeeks(posts).every((p) => p.week !== undefined));
});

test('every approved post has a draft file with a matching front matter status', () => {
  for (const p of posts.filter((x) => x.status === 'approved')) {
    assert.ok(p.file, `${p.id} needs a file`);
    assert.match(io.read(p.file), /^status: approved$/m);
  }
});

test('seedDocs gives each post a repo snapshot equal to its editable fields', () => {
  const docs = seedDocs(posts, (f) => bodyOf(io.read(f)));
  assert.equal(docs.length, posts.length);
  for (const d of docs) assert.equal(d.repo.title, d.title);
  assert.ok(docs.find((d) => d.id === 'P01').body.length > 500);
});

test('applyChanges moves, renames and rewrites a draft, and leaves the input untouched', () => {
  const before = JSON.stringify(posts);
  const r = applyChanges(posts, { P01: { date: '2026-10-23', title: 'New headline: yes', status: 'hold' } }, io, today);
  assert.equal(JSON.stringify(posts), before);
  const w = r.writes.find((x) => x.path.includes('2026-10-23'));
  assert.ok(w);
  assert.match(w.content, /^status: draft$/m);
  assert.match(w.content, /^title: "New headline: yes"$/m);
  assert.match(w.content, /^date: 2026-10-23$/m);
  assert.ok(r.removes.some((p) => p.includes('2026-10-19')));
});

test('applyChanges refuses bad edits and changes nothing', () => {
  assert.throws(() => applyChanges(posts, { P99: {} }, io, today), /Unknown/);
  assert.throws(() => applyChanges(posts, { P09: { status: 'approved' } }, io, today), /no draft/);
  assert.throws(() => applyChanges(posts, { P01: { date: '2026-10-24' } }, io, today), /weekday/);
  assert.throws(() => applyChanges(posts, { P01: { title: '  ' } }, io, today), /empty/);
  assert.throws(() => applyChanges(posts, { P01: { status: 'bogus' } }, io, today), /unknown status/);
  assert.throws(() => applyChanges(posts, { L01: { status: 'hold' } }, io, today), /live/);
});

test('applyChanges warns when two posts land on one day', () => {
  const r = applyChanges(posts, { P09: { date: '2026-10-19' } }, io, today);
  assert.ok(r.warnings.some((w) => /both on 2026-10-19/.test(w)));
});

test('renderCsv has one row per scheduled post plus a header', () => {
  assert.equal(renderCsv(posts).trim().split('\n').length, 47);
});
