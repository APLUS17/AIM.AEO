// Static blog engine: Markdown posts in content/blog become pages under blog/.
// Pure functions, no dependencies. scripts/build-blog.mjs does the file work.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORDS_PER_MINUTE = 220;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const safeHref = (href) => /^(https?:\/\/|\/|#|mailto:)/i.test(href);

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ---------- Posts ----------

// Source format: a `---` front matter block (title, description, date, category, tags, author), then Markdown.
export function parsePost(source, filename) {
  const match = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing front matter block`);

  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z_]+)\s*:\s*(.*?)\s*$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  for (const key of ['title', 'description', 'date']) {
    if (!meta[key]) throw new Error(`${filename}: front matter needs "${key}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${filename}: date must be YYYY-MM-DD`);

  const body = match[2].trim();
  const slug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${filename}: file name must be lowercase letters, numbers and dashes`);

  return {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    category: meta.category || 'AEO',
    author: meta.author || 'The AiM Team',
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / WORDS_PER_MINUTE)),
    html: markdownToHtml(body)
  };
}

// A post is live once its date has arrived. Newest first.
export function selectPublished(posts, today) {
  return posts.filter((p) => p.date <= today).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

// ---------- Markdown (the subset posts need) ----------

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => (safeHref(href) ? `<a class="el-link" href="${href}">${label}</a>` : label));
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

const isTableRule = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line || '');
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const code = [];
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) code.push(lines[i]);
      i++;
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = Math.max(2, heading[1].length); // the page title is the only h1
      const text = heading[2].trim();
      out.push(`<h${level} id="${slugify(text)}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (line.startsWith('>')) {
      const quote = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) quote.push(lines[i].replace(/^>\s?/, ''));
      out.push(`<blockquote>${quote.map((q) => `<p>${inline(q)}</p>`).join('')}</blockquote>`);
      continue;
    }

    if (line.includes('|') && isTableRule(lines[i + 1])) {
      const head = cells(line);
      const rows = [];
      for (i += 2; i < lines.length && lines[i].includes('|'); i++) rows.push(cells(lines[i]));
      out.push(
        `<div class="post-table"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      );
      continue;
    }

    const list = line.match(/^(\s*)([-*]|\d+\.)\s+/);
    if (list) {
      const ordered = /\d/.test(list[2]);
      const items = [];
      for (; i < lines.length; i++) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (m && /\d/.test(m[1]) === ordered) items.push(m[2]);
        else if (/^\s{2,}\S/.test(lines[i]) && items.length) items[items.length - 1] += ` ${lines[i].trim()}`;
        else break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    for (; i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|```)/.test(lines[i]); i++) para.push(lines[i].trim());
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

// ---------- Pages ----------

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400&display=swap';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%2713%27 fill=%27white%27 stroke=%27%23202020%27 stroke-width=%272.5%27/%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%275%27 fill=%27%23ff682c%27/%3E%3C/svg%3E";

function shell({ title, description, path, type = 'website', jsonLd, siteUrl, body }) {
  const base = (siteUrl || '').replace(/\/+$/, '');
  const url = base ? `${base}${path}` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}"/>
  ${url ? `<link rel="canonical" href="${esc(url)}"/>\n  <meta property="og:url" content="${esc(url)}"/>` : ''}
  <meta property="og:type" content="${type}"/>
  <meta property="og:site_name" content="AiM"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta name="twitter:card" content="summary"/>
  <meta name="theme-color" content="#ffffff"/>
  <link rel="icon" href="${FAVICON}"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="${FONTS}" rel="stylesheet"/>
  <link rel="stylesheet" href="/design-system/tokens.css"/>
  <link rel="stylesheet" href="/design-system/components/bundle.css"/>
  <link rel="stylesheet" href="/site.css"/>
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body class="el-root">

  <header class="site-header">
    <div class="container">
      <nav class="el-nav" aria-label="Main navigation">
        <a class="el-nav__brand" href="/">AiM</a>
        <div class="el-nav__pill">
          <a class="el-nav__item" href="/#how-it-works">How It Works</a>
          <a class="el-nav__item" href="/#the-3-pillars">The 3 Pillars</a>
          <a class="el-nav__item" href="/blog/" aria-current="page">Blog</a>
          <a class="el-nav__item" href="/ai-search-grader.html">Free AI Grader</a>
        </div>
        <div class="el-nav__end">
          <a class="el-btn el-btn--primary" href="/ai-search-grader.html">Grade my brand →</a>
        </div>
      </nav>
    </div>
  </header>

  <main>
${body}
  </main>

  <footer class="site-footer band--ash">
    <div class="container">
      <div class="footer-flex">
        <a class="el-nav__brand" href="/">AiM</a>
        <ul class="footer-links">
          <li><a class="el-link--utility" href="/#how-it-works">How It Works</a></li>
          <li><a class="el-link--utility" href="/#the-3-pillars">The 3 Pillars</a></li>
          <li><a class="el-link--utility" href="/blog/">Blog</a></li>
          <li><a class="el-link--utility" href="/ai-search-grader.html">AI Grader</a></li>
        </ul>
        <div class="small">© 2026 AiM. All rights reserved.</div>
      </div>
    </div>
  </footer>

  <script>
    const header = document.querySelector('.site-header');
    const syncHeader = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  </script>
</body>
</html>
`;
}

const postUrl = (post) => `/blog/${post.slug}.html`;
const meta = (post) => `${esc(post.category)} · ${formatDate(post.date)} · ${post.minutes} min read`;

function postCard(post) {
  return `        <article class="el-data post-card">
          <a class="post-card__link" href="${postUrl(post)}">
            <div class="overline">${meta(post)}</div>
            <h2 class="card-title">${esc(post.title)}</h2>
            <p class="copy">${esc(post.description)}</p>
            <span class="post-card__more">Read the post →</span>
          </a>
        </article>`;
}

export function renderIndex(posts, { siteUrl } = {}) {
  const cards = posts.length
    ? `      <div class="grid-2">\n${posts.map(postCard).join('\n')}\n      </div>`
    : `      <div class="el-data post-empty">
        <h2 class="card-title">The first posts are on their way.</h2>
        <p class="copy">New AEO articles land on weekdays. In the meantime, see how AI talks about your brand today.</p>
        <div><a class="el-btn el-btn--primary" href="/ai-search-grader.html">Grade my brand free →</a></div>
      </div>`;

  return shell({
    title: 'AEO Blog | AiM',
    description: 'Short, practical articles on answer engine optimization: how to get recommended by ChatGPT, Claude, and Perplexity.',
    path: '/blog/',
    siteUrl,
    body: `  <section class="band">
    <div class="container">
      <div class="section-intro">
        <div class="overline">The AiM blog</div>
        <h1 class="section-title">How to get recommended when people ask AI.</h1>
        <p class="copy">Short, practical articles on answer engine optimization (AEO). New posts on weekdays.</p>
      </div>
${cards}
    </div>
  </section>`
  });
}

export function renderPost(post, related = [], { siteUrl } = {}) {
  const base = (siteUrl || '').replace(/\/+$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'AiM' },
    publisher: { '@type': 'Organization', name: 'AiM' },
    ...(base && { mainEntityOfPage: `${base}${postUrl(post)}` }),
    ...(post.tags.length && { keywords: post.tags.join(', ') })
  };

  const tags = post.tags.length
    ? `<ul class="post-tags" aria-label="Tags">${post.tags.map((t) => `<li><span class="el-tag el-tag--outline">${esc(t)}</span></li>`).join('')}</ul>`
    : '';

  const relatedBlock = related.length
    ? `  <section class="band">
    <div class="container">
      <h2 class="section-title post-related__title">Keep reading.</h2>
      <div class="grid-3">
${related.map(postCard).join('\n')}
      </div>
    </div>
  </section>`
    : '';

  return shell({
    title: `${post.title} | AiM`,
    description: post.description,
    path: postUrl(post),
    type: 'article',
    jsonLd,
    siteUrl,
    body: `  <article class="band post">
    <div class="container">
      <div class="post-wrap">
        <a class="el-link--utility" href="/blog/">← All posts</a>
        <div class="overline post-meta">${meta(post)}</div>
        <h1 class="post-title">${esc(post.title)}</h1>
        <p class="post-deck">${esc(post.description)}</p>
        <div class="post-body">
${post.html}
        </div>
        ${tags}
      </div>
    </div>
  </article>

  <section class="band band--ash">
    <div class="container">
      <div class="el-feature el-feature--compact cta-card">
        <h2 class="section-title">See what AI says about your brand.</h2>
        <p class="el-feature__body">The free grader asks ChatGPT, Claude, and Perplexity about you and scores their answers out of 100.</p>
        <div class="btn-row btn-row--center">
          <a class="el-btn el-btn--primary" href="/ai-search-grader.html">Grade my brand free →</a>
        </div>
      </div>
    </div>
  </section>

${relatedBlock}`
  });
}
