// Pattern check for blog posts: the automatable part of the "definition of done" in plan/pattern.md.
// Pure functions. scripts/lint-blog.mjs runs it over content/blog/ and fails on errors.

const KNOWN_PAGES = new Set(['/', '/blog/', '/ai-search-grader.html']);

const stripCode = (md) => md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

// Returns [{ level: 'error' | 'warn', rule, message }].
// `post` is the output of parsePost; `body` is the Markdown after the front matter.
// `known` is a Map of slug -> { date, status } for every post (drafts too); `today` is YYYY-MM-DD.
export function lintPost(post, body, known, { today } = {}) {
  const issues = [];
  const add = (level, rule, message) => issues.push({ level, rule, message });
  const text = stripCode(body);

  // Placeholders: [number], [N], TODO, TBD. Markdown links, [text](url), are fine. A post that deliberately shows
  // [bracketed] template wording opts out of the bracket rule with `placeholders: intended` (TODO and TBD always fail).
  if (post.placeholders !== 'intended') {
    for (const m of text.matchAll(/\[([^\]\n]{0,60})\](?!\()/g)) add('error', 'placeholder', `Unresolved placeholder "[${m[1]}]"`);
  }
  for (const m of text.matchAll(/\b(TODO|TBD|FIXME|lorem ipsum)\b/gi)) add('error', 'placeholder', `Leftover "${m[1]}"`);

  // Internal links must point at a real post or a known page.
  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1].split('#')[0];
    const blog = href.match(/^\/blog\/([a-z0-9-]+)\.html$/);
    if (blog) {
      const target = known.get(blog[1]);
      // The target must be live by the time this post is: a draft never is, and a later-dated post is not yet.
      const liveBy = today && post.date <= today ? today : post.date;
      // A draft may link to other drafts (they are approved together); the same link is an error once the post can publish.
      const timing = post.status === 'draft' ? 'warn' : 'error';
      if (!target) add('error', 'link', `Link to a post that does not exist: ${href}`);
      else if (target.status === 'draft') add(timing, 'link', `Link to a draft that is not published: ${href}`);
      else if (target.date > liveBy) add(timing, 'link', `Link to a post that goes live later (${target.date}): ${href}`);
    } else if (!KNOWN_PAGES.has(href)) {
      add('warn', 'link', `Internal link to an unknown page: ${href}`);
    }
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 450) add('warn', 'length', `Only ${words} words (pattern: 500 to 900; playbooks to 1,100)`);
  if (words > 1150) add('warn', 'length', `${words} words (pattern: 500 to 900; playbooks to 1,100)`);

  if ((text.match(/^##\s/gm) || []).length < 2) add('warn', 'structure', 'Fewer than two H2 sections');
  if (!/^>\s/m.test(text)) add('warn', 'structure', 'No pull quote (blockquote)');
  if (post.description.length > 200) add('warn', 'deck', `Deck is ${post.description.length} characters (aim for 160 or fewer)`);
  if (post.title.length > 90) add('warn', 'title', `Title is ${post.title.length} characters (aim for 70 or fewer)`);

  // Any percentage needs its sources listed at the end.
  if (/\d\s?%/.test(text) && !/^#{2,3}\s+Sources/im.test(text)) {
    add('warn', 'sources', 'Contains a percentage but has no "Sources" section');
  }
  return issues;
}
