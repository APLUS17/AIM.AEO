// The blog plan as data. plan/posts.json is the source of truth; this module renders the plan files from it
// and applies edits made in the Content Desk dashboard back to the blog files. Pure functions, no dependencies.
// scripts/plan.mjs does the file work.

export const STATUSES = ['live', 'approved', 'review', 'planned', 'headline_ok', 'changes', 'hold'];

export const STATUS_LABEL = {
  live: 'Live',
  approved: 'Approved',
  review: 'Awaiting your approval',
  planned: 'Headline only',
  headline_ok: 'Headline approved',
  changes: 'Changes requested',
  hold: 'On hold'
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const utc = (iso) => new Date(`${iso}T00:00:00Z`);
export const dayName = (iso) => DAYS[utc(iso).getUTCDay()];

export function mondayOf(iso) {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// Scheduled posts get a week number counted from the earliest scheduled Monday. Live posts are week 0.
export function withWeeks(posts) {
  const sched = posts.filter((p) => p.kind === 'scheduled');
  const first = sched.length ? sched.map((p) => mondayOf(p.date)).sort()[0] : null;
  return posts.map((p) => ({
    ...p,
    week: p.kind === 'scheduled' ? Math.round((utc(mondayOf(p.date)) - utc(first)) / (7 * 86400000)) + 1 : 0
  }));
}

export const sortPosts = (posts) => [...posts].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
const pipe = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
const draftLabel = (p) => (p.file ? (p.status === 'live' ? 'published' : p.status === 'approved' ? 'written, approved' : 'written') : 'no');
const researchLabel = { done: 'done', queued: 'queued', blocked: 'blocked (needs your rewrite)', 'needs-keys': 'needs keys' };

// ---------- plan files ----------

export function renderApprovals(posts) {
  const L = [
    '# Approval list: headline and subheadline for every post',
    '',
    '_Generated from `plan/posts.json` by `node scripts/plan.mjs render`. Edit in the Content Desk dashboard or ask Claude; do not edit by hand._',
    '',
    'Nothing publishes without approval: a post stays `status: draft` in its file until it is approved, and drafts never publish whatever their date.',
    '',
    '| # | Goes live | Headline | Subheadline | Research | Draft | Status |',
    '|---|---|---|---|---|---|---|'
  ];
  for (const p of sortPosts(posts).filter((x) => x.kind === 'scheduled')) {
    L.push(`| ${p.id} | ${dayName(p.date)} ${p.date} | ${pipe(p.title)} | ${pipe(p.sub)} | ${researchLabel[p.research] ?? p.research} | ${draftLabel(p)} | ${STATUS_LABEL[p.status]} |`);
  }
  return L.join('\n') + '\n';
}

export function renderScheduleMd(posts) {
  const sched = sortPosts(withWeeks(posts)).filter((p) => p.kind === 'scheduled');
  const count = (s) => sched.filter((p) => p.status === s).length;
  const L = [
    '# AiM blog schedule',
    '',
    '_Generated from `plan/posts.json` by `node scripts/plan.mjs render`. Edit in the Content Desk dashboard or ask Claude; do not edit by hand._',
    '',
    `${sched.length} posts, ${sched[0].date} to ${sched[sched.length - 1].date}. Friday is for proofreading and social posts. Holiday weeks carry fewer posts.`,
    '',
    `Live ${count('live')} · approved ${count('approved')} · awaiting approval ${count('review')} · headline only ${count('planned') + count('headline_ok')} · changes requested ${count('changes')} · on hold ${count('hold')}.`,
    '',
    'Template, proof element and the rules behind every row are in `pattern.md`. CTA: G = free AI Search Grader, G+B = grader plus a link to book a free call (no price or scope; until that link exists those posts end on the grader only).',
    ''
  ];
  let week = null;
  for (const p of sched) {
    if (p.week !== week) {
      week = p.week;
      L.push(`\n## Week ${week} (from ${p.date})\n`, '| # | Date | Type | Title | Pillar / Step | CTA | Status | Proof element | Needs | Brief |', '|---|---|---|---|---|---|---|---|---|---|');
    }
    L.push(`| ${p.id} | ${dayName(p.date)} ${p.date} | ${p.type} | ${pipe(p.title)} | ${pipe(p.pillar)} | ${p.cta} | ${STATUS_LABEL[p.status]} | ${pipe(p.proof)} | ${pipe(p.needs)} | ${pipe(p.brief)} |`);
  }
  return L.join('\n') + '\n';
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function renderCsv(posts) {
  const head = ['week', 'date', 'day', 'id', 'type', 'title', 'subheadline', 'pillar_step', 'cta', 'proof', 'needs', 'brief', 'status'];
  const rows = sortPosts(withWeeks(posts)).filter((p) => p.kind === 'scheduled')
    .map((p) => [p.week, p.date, dayName(p.date), p.id, p.type, p.title, p.sub, p.pillar, p.cta, p.proof, p.needs, p.brief, p.status]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

function dataLines(p) {
  const L = [];
  for (const d of p.data) {
    L.push(`- ${d.text}`, `  - Source: [${d.source}](${d.url}) (${d.level}). Retrieved 2026-10-18.`);
    if (d.caveat) L.push(`  - Caveat: ${d.caveat}`);
  }
  return L;
}

export function renderBrief(week, posts) {
  const rs = sortPosts(withWeeks(posts)).filter((p) => p.kind === 'scheduled' && p.week === week);
  const L = [`# Week ${week} briefs (${rs[0].date} to ${rs[rs.length - 1].date})`, ''];
  for (const p of rs) {
    L.push(`## ${p.id} · ${dayName(p.date)} ${p.date} · ${p.type}`, '', `**Headline:** ${p.title}`, '', `**Subheadline:** ${p.sub}`, '',
      `**Status:** ${STATUS_LABEL[p.status]}. **Pattern:** ${p.type}. Proof element: ${p.proof}. Next step for the reader: ${p.cta === 'G+B' ? 'grader plus booking link (not built yet)' : 'free AI Search Grader'}.`, '');
    if (p.covers.length) {
      L.push('**What it covers**', '', ...p.covers.map((x) => `- ${x}`), '', `**What you will learn:** ${p.learn}`, '');
      if (p.data.length) L.push('**Data and stats I found (checked at the original publisher)**', '', ...dataLines(p), '', `_Used in the draft: ${p.used}._`, '');
      else L.push('**Data and stats:** none used in this post.', '');
      if (p.judgment.length) L.push('**What is our judgment, not sourced fact**', '', ...p.judgment.map((x) => `- ${x}`), '');
      if (p.ask.length) L.push('**Questions for you**', '', ...p.ask.map((x) => `- ${x}`), '');
    } else {
      L.push(`**Research queue (runs before this week's email):** ${p.queue}`, '', '**Data and stats:** not researched yet. Every number gets its source before the email goes out.', '');
    }
    if (p.note) L.push(`**Your note:** ${p.note}`, '');
    L.push(`**Draft:** ${p.file ? `${p.status === 'approved' ? 'written and approved' : 'written, held'}, in \`${p.file}\`` : 'not started'}`, '');
  }
  return L.join('\n') + '\n';
}

export function renderEmail(week, posts) {
  const rs = sortPosts(withWeeks(posts)).filter((p) => p.kind === 'scheduled' && p.week === week);
  const L = [`Subject: AiM blog, week of ${rs[0].date}: topics for your approval`, '',
    `These posts go live ${dayName(rs[0].date)} ${rs[0].date} to ${dayName(rs[rs.length - 1].date)} ${rs[rs.length - 1].date}. Nothing publishes until you approve it. Reply with APPROVE or tell me what to change.`, ''];
  for (const p of rs) {
    L.push(`${p.id} · ${dayName(p.date)} ${p.date} · ${STATUS_LABEL[p.status]}`, `Headline: ${p.title}`, `Subheadline: ${p.sub}`);
    if (p.covers.length) {
      L.push(`What it covers: ${p.covers.join('; ')}`, `What you will learn: ${p.learn}`);
      if (p.data.length) {
        L.push('Key data I found:');
        for (const d of p.data.slice(0, 3)) L.push(`  - ${d.text.split('. ')[0]}. (${d.source}) ${d.url}`);
      } else L.push('Data: none used.');
      if (p.ask.length) L.push(`Questions for you: ${p.ask.join(' | ')}`);
    } else L.push(`Research still to do: ${p.queue}`);
    L.push(`Draft: ${p.file ? (p.status === 'approved' ? 'written, approved' : 'written (held as a draft)') : 'not started'}`, '');
  }
  L.push('Reply APPROVE for each post you are happy with, or send changes. Anything not approved stays a draft and does not publish.');
  return L.join('\n') + '\n';
}

// ---------- front matter ----------

export function splitFile(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter');
  return { lines: m[1].split('\n'), body: m[2].replace(/^\n+/, '').replace(/\s+$/, '') };
}

const quote = (v) => (/[:#"]/.test(v) || /^[\s'\-?[\]{}!&*|>%@`]/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v);

export function setKey(lines, key, value, { quoted = false } = {}) {
  const text = `${key}: ${quoted ? quote(value) : value}`;
  const i = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (i >= 0) lines[i] = text;
  else lines.push(text);
}

export const joinFile = (lines, body) => `---\n${lines.join('\n')}\n---\n${body}\n`;

export const bodyOf = (text) => splitFile(text).body;

// ---------- dashboard seed ----------

// One document per post for the dashboard database. `repo` is the last state synced to the repo, so the
// dashboard can show which edits are still waiting for Claude.
export function seedDocs(posts, readBody) {
  return sortPosts(withWeeks(posts)).map((p) => {
    const body = p.file ? readBody(p.file) : '';
    const core = { title: p.title, sub: p.sub, date: p.date, status: p.status, body, note: p.note || '', answers: p.answers || {} };
    return { ...p, body, repo: core };
  });
}

// ---------- applying dashboard edits ----------

const slugOf = (file) => file.split('/').pop().replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
const FILE_STATUS = { live: 'approved', approved: 'approved', review: 'draft', changes: 'draft', hold: 'draft', planned: 'draft', headline_ok: 'draft' };

function validDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = utc(iso);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return false;
  return d.getUTCDay() >= 1 && d.getUTCDay() <= 5;
}

// changes: { P01: { status?, date?, title?, sub?, body?, note?, answers? } }. io: { read(path) -> string }.
// Returns { posts, writes: [{path, content}], removes: [path], warnings }. Throws on anything invalid, changing nothing.
export function applyChanges(posts, changes, io, today = new Date().toISOString().slice(0, 10)) {
  const byId = new Map(posts.map((p) => [p.id, { ...p }]));
  const writes = new Map();
  const removes = new Set();
  const warnings = [];

  for (const [id, ch] of Object.entries(changes)) {
    const p = byId.get(id);
    if (!p) throw new Error(`Unknown post ${id}`);
    const isLive = p.kind === 'live' || p.status === 'live';
    if (isLive && ch.status && ch.status !== 'live') throw new Error(`${id} is live; its status cannot change`);
    if (ch.status !== undefined && !STATUSES.includes(ch.status)) throw new Error(`${id}: unknown status "${ch.status}"`);
    if (ch.date !== undefined && !validDate(ch.date)) throw new Error(`${id}: "${ch.date}" is not a weekday date (YYYY-MM-DD)`);
    if (ch.title !== undefined && !String(ch.title).trim()) throw new Error(`${id}: the headline cannot be empty`);
    if (ch.sub !== undefined && !String(ch.sub).trim()) throw new Error(`${id}: the subheadline cannot be empty`);
    if (ch.status === 'approved' && !p.file) throw new Error(`${id} has no draft yet, so it cannot be approved for publishing`);
    if (ch.body !== undefined && !p.file) throw new Error(`${id} has no draft file, so its text cannot be edited here`);
    if (isLive && ch.date !== undefined && ch.date !== p.date) throw new Error(`${id} is live; its date cannot move`);
    if (ch.status === 'approved' && p.status !== 'approved') p.approvedOn = today;
    for (const k of ['status', 'date', 'title', 'sub', 'note', 'answers']) if (ch[k] !== undefined) p[k] = ch[k];
    byId.set(id, p);

    if (!p.file) continue;
    const { lines, body } = splitFile(io.read(p.file));
    const newBody = ch.body !== undefined ? ch.body.replace(/\s+$/, '') : body;
    if (p.kind === 'scheduled') setKey(lines, 'status', FILE_STATUS[p.status]);
    setKey(lines, 'date', p.date);
    setKey(lines, 'title', p.title, { quoted: true });
    setKey(lines, 'description', p.sub);
    const newPath = `content/blog/${p.date}-${slugOf(p.file)}.md`;
    writes.set(newPath, joinFile(lines, newBody));
    if (newPath !== p.file) removes.add(p.file);
    p.file = newPath;
  }

  for (const path of writes.keys()) removes.delete(path);

  const scheduled = [...byId.values()].filter((p) => p.kind === 'scheduled');
  const seen = new Map();
  for (const p of scheduled) {
    if (seen.has(p.date)) warnings.push(`${seen.get(p.date)} and ${p.id} are both on ${p.date}`);
    seen.set(p.date, p.id);
  }
  return { posts: withWeeks([...byId.values()]), writes: [...writes].map(([path, content]) => ({ path, content })), removes: [...removes], warnings };
}

// Marks scheduled posts as live once they are confirmed on the site. Only approved posts whose date has arrived
// can be marked; anything else is returned in `skipped` with the reason. The file keeps `status: approved`.
export function markPublished(posts, ids, today) {
  const byId = new Map(posts.map((p) => [p.id, { ...p }]));
  const marked = [];
  const skipped = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) skipped.push({ id, reason: 'unknown post' });
    else if (p.status === 'live') skipped.push({ id, reason: 'already live' });
    else if (p.status !== 'approved') skipped.push({ id, reason: `status is ${p.status}, not approved` });
    else if (p.date > today) skipped.push({ id, reason: `scheduled for ${p.date}, not yet due` });
    else {
      p.status = 'live';
      p.publishedOn = today;
      byId.set(id, p);
      marked.push(id);
    }
  }
  return { posts: posts.map((p) => byId.get(p.id)), marked, skipped };
}
