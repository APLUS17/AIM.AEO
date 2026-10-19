import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyChanges, bodyOf, markPublished, renderCsv, seedDocs, withWeeks } from '../lib/plan.js';

const plan = JSON.parse(readFileSync(new URL('../plan/posts.json', import.meta.url), 'utf8')).posts;
// Tests run on the plan as it stood before anything published, plus one fixed headline-only post (PX), so they
// do not change as posts go live or get drafted.
const posts = [
  ...plan.map((p) => (p.kind === 'scheduled' && p.status === 'live' ? { ...p, status: 'approved', publishedOn: undefined } : p)),
  { id: 'PX', kind: 'scheduled', date: '2027-02-01', type: 'Test', title: 'Fixture', sub: 'Fixture sub', status: 'planned', file: null, research: 'queued', covers: [], data: [], judgment: [], ask: [], note: '', answers: {} }
];
const io = { read: (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8') };
const today = '2026-10-18';

test('posts.json has live posts, 46 scheduled posts, and no two scheduled posts on one day', () => {
  assert.equal(posts.filter((p) => p.kind === 'scheduled').length, 47, '46 planned posts plus the PX fixture');
  assert.ok(posts.filter((p) => p.kind === 'live').length >= 7);
  const dates = posts.filter((p) => p.kind === 'scheduled').map((p) => p.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.ok(withWeeks(posts).every((p) => p.week !== undefined));
});

test('every approved post has a draft file with a matching front matter status', () => {
  for (const p of posts.filter((x) => x.kind === 'scheduled' && (x.status === 'approved' || x.status === 'live'))) {
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
  assert.throws(() => applyChanges(posts, { PX: { status: 'approved' } }, io, today), /no draft/);
  assert.throws(() => applyChanges(posts, { P01: { date: '2026-10-24' } }, io, today), /weekday/);
  assert.throws(() => applyChanges(posts, { P01: { title: '  ' } }, io, today), /empty/);
  assert.throws(() => applyChanges(posts, { P01: { status: 'bogus' } }, io, today), /unknown status/);
  assert.throws(() => applyChanges(posts, { L01: { status: 'hold' } }, io, today), /live/);
});

test('applyChanges warns when two posts land on one day', () => {
  const r = applyChanges(posts, { PX: { date: '2026-10-19' } }, io, today);
  assert.ok(r.warnings.some((w) => /both on 2026-10-19/.test(w)));
});

test('renderCsv has one row per scheduled post plus a header', () => {
  assert.equal(renderCsv(posts).trim().split('\n').length, 48);
});

test('markPublished marks only approved posts that are due, and week numbers do not shift', () => {
  const r = markPublished(posts, ['P01', 'P02', 'PX', 'P99'], '2026-10-19');
  assert.deepEqual(r.marked, ['P01']);
  assert.match(r.skipped.find((s) => s.id === 'P02').reason, /not yet due/);
  assert.match(r.skipped.find((s) => s.id === 'PX').reason, /not approved/);
  assert.match(r.skipped.find((s) => s.id === 'P99').reason, /unknown/);
  const p01 = r.posts.find((p) => p.id === 'P01');
  assert.equal(p01.status, 'live');
  assert.equal(p01.publishedOn, '2026-10-19');
  assert.equal(withWeeks(r.posts).find((p) => p.id === 'P02').week, 1);
  assert.equal(posts.find((p) => p.id === 'P01').status, 'approved', 'input is not changed');
});

test('a post that is live cannot be moved or have its status changed', () => {
  const live = markPublished(posts, ['P01'], '2026-10-19').posts;
  assert.throws(() => applyChanges(live, { P01: { status: 'hold' } }, io, today), /is live/);
  assert.throws(() => applyChanges(live, { P01: { date: '2026-10-20' } }, io, today), /is live/);
});
