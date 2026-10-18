import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePost, selectPublished } from '../lib/blog.js';
import { lintPost } from '../lib/lint.js';

const post = (extra = '', status = '') =>
  `---\ntitle: A post\ndescription: A deck.\ndate: 2026-10-26\n${status}---\n${extra}`;

test('status: draft is never published, whatever the date', () => {
  const draft = parsePost(post('Body.', 'status: draft\n'), '2026-10-26-a.md');
  const live = parsePost(post('Body.', 'status: approved\n'), '2026-10-26-b.md');
  const legacy = parsePost(post('Body.'), '2026-10-26-c.md');
  assert.equal(draft.status, 'draft');
  assert.equal(legacy.status, 'published');
  assert.deepEqual(selectPublished([draft, live, legacy], '2027-01-01').map((p) => p.slug), ['b', 'c']);
  assert.throws(() => parsePost(post('Body.', 'status: maybe\n'), 'x.md'), /status must be/);
});

test('lint flags placeholders, bad links, and missing sources, but ignores code and real links', () => {
  const body = [
    'Intro with [number] left in, and a [real link](/blog/exists.html) and a [broken](/blog/missing.html).',
    '',
    '```',
    'Allow: [not a placeholder in code]',
    '```',
    '',
    'We saw 40% more.'
  ].join('\n');
  const p = parsePost(post(body), '2026-10-26-a.md');
  const issues = lintPost(p, body, new Map([['a', { date: '2026-10-26', status: 'published' }], ['exists', { date: '2026-10-01', status: 'published' }]]), { today: '2026-10-26' });
  const rules = issues.map((i) => `${i.level}:${i.rule}`);
  assert.ok(rules.includes('error:placeholder'));
  assert.ok(rules.includes('error:link'));
  assert.ok(rules.includes('warn:sources'));
  assert.equal(issues.filter((i) => i.rule === 'placeholder').length, 1);
});

test('lint passes a clean post with sources and a pull quote', () => {
  const words = Array(520).fill('word').join(' ');
  const body = `## One\n\n${words}\n\n## Two\n\n> A quotable line.\n\nSaw 8% fewer clicks.\n\n## Sources\n\n- [Pew](https://example.com)`;
  const p = parsePost(post(body), '2026-10-26-a.md');
  assert.deepEqual(lintPost(p, body, new Map([['a', { date: '2026-10-26', status: 'published' }]]), { today: '2026-10-26' }), []);
});

test('placeholders: intended skips the bracket rule but TODO still fails', () => {
  const body = 'Ask: "What is the best [category] for [buyer]?" and also TODO.';
  const p = parsePost(`---\ntitle: A post\ndescription: A deck.\ndate: 2026-10-26\nplaceholders: intended\n---\n${body}`, '2026-10-26-a.md');
  const issues = lintPost(p, body, new Map([['a', { date: '2026-10-26', status: 'published' }]]), { today: '2026-10-26' });
  assert.equal(issues.filter((i) => i.rule === 'placeholder').length, 1);
  assert.match(issues.find((i) => i.rule === 'placeholder').message, /TODO/);
});

test('links must point at a post that is live by the time this one is', () => {
  const run = (postDate, targetDate, targetStatus, today) => {
    const body = 'See [it](/blog/t.html).';
    const p = parsePost(`---\ntitle: A post\ndescription: A deck.\ndate: ${postDate}\n---\n${body}`, `${postDate}-a.md`);
    return lintPost(p, body, new Map([['t', { date: targetDate, status: targetStatus }]]), { today }).filter((i) => i.rule === 'link');
  };
  assert.equal(run('2026-10-12', '2026-10-13', 'published', '2026-10-18').length, 0); // already live, target live now
  assert.equal(run('2026-10-27', '2026-10-26', 'published', '2026-10-18').length, 0); // future post, target earlier
  assert.equal(run('2026-10-26', '2026-10-27', 'published', '2026-10-18').length, 1); // future post, target later
  assert.equal(run('2026-10-27', '2026-10-26', 'draft', '2026-10-18').length, 1); // target is a draft
});
