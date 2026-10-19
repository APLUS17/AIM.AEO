# AiM AEO site + AI Search Grader

- `index.html`: main landing page
- `ai-search-grader.html`: free AI Search Grader page
- `blog/`: generated blog pages (see Blog below; don't edit by hand)
- `content/blog/`: blog posts as Markdown
- `api/grade.js`: grading endpoint (Vercel serverless function)
- `lib/`: grading pipeline (prompts → engines → judge → scoring → email)

## Blog

Posts are Markdown files in `content/blog/`, named `YYYY-MM-DD-your-slug.md`:

```
---
title: Can AI crawlers read your site?
description: One or two sentences. Shown under the title and on the post card.
date: 2026-10-15
category: Guides            # optional, default "AEO"
tags: AEO, crawlers         # optional
---
Body in Markdown: ## and ### headings, lists, > quotes, tables, code blocks, links.
```

- `npm run blog` builds `content/blog/` into `blog/index.html` and `blog/<slug>.html`.
- A post goes live when its `date` arrives: the build skips anything dated in the future, so a future date schedules it.
- **Publishing is automatic.** `.github/workflows/publish-blog.yml` runs on weekdays at 9:00 am US Eastern (it follows daylight saving; GitHub can start it hours late) and whenever `content/blog/` changes on `main`. It tests, builds, and commits `blog/` to `main`; Vercel deploys that push. Never edit `blog/` by hand. You can also run it from the Actions tab ("Run workflow"). A post with bad front matter fails the run (you get GitHub's failure email) and nothing is published.
- If `main` is protected, allow `github-actions[bot]` to push to it, or the commit step will fail.
- Optional: add a repository variable `SITE_URL` (Settings > Secrets and variables > Actions > Variables) to put canonical URLs on every page.
- **Approval gate:** a post with `status: draft` in its front matter is never published, whatever its date. Change it to `approved` to release it. A post with no `status` publishes on its date.
- **Pattern check:** `npm run blog:lint` checks every post that can publish (unresolved placeholders, broken or not-yet-live links, missing Sources section when a percentage appears, length, structure). The publish workflow runs it first, and errors block publishing. `placeholders: intended` in the front matter marks a post that deliberately shows [bracketed] template wording.
- **Studies:** `node scripts/run-batch.mjs --brands data/brands.csv --pilot 3` grades many brands with the grader's pipeline for the data posts. It needs all three API keys, refuses sample mode, never emails anyone, and writes every raw answer plus the models used to `data/runs/<date>/`.
- A post goes live on its `date:` in US Eastern time. Preview another day with `BLOG_TODAY=2026-10-16 npm run blog`. `npm run dev` serves it at `/blog/`.
- Set `SITE_URL` when building to add canonical URLs to the pages. Every post carries `Article` schema.

## Blog plan

`plan/pattern.md` is the post pattern (templates, rules, definition of done). `plan/schedule.md` and `plan/schedule.csv` are the 90-day schedule, one row per post with its template, CTA, proof element and what it needs before writing. These files are kept off the public site by `.vercelignore`, which also hides `content/` (so future-dated drafts are not readable early).

## Design system: Ember Ledger

The site is built on the Ember Ledger design system, pulled from Claude Design (see
`design-system/SOURCE.md` for the project and what was copied).

- `design-system/tokens.json` → `npm run tokens` → `design-system/tokens.css` (custom properties + `.ts-*` type classes)
- `design-system/components/bundle.css`: the `el-*` component classes (buttons, nav pill, tags, feature and data cards, hero)
- `site.css`: page layout only, token values only. No raw hex, gradients or divider lines. It adds one soft depth layer (`--lift-1`, `--lift-2`, `--sink`) on top of the flat system; set them to `none` for the original flat look (see `design-system/SOURCE.md`)
- `design-system/README.md` has the rules: ember is an accent never a fill, buttons are square, sections alternate white and ash bands

To update the design: re-pull the files from the Claude Design project, run `npm run tokens`, and re-check both pages.
The grader report email (`lib/email.js`) inlines the same palette because email clients can't read CSS variables.

## How the grader works

1. The form posts company, website URL and email to `/api/grade`. The grader reads the site (SSRF-guarded, `lib/safe-fetch.js`) and has Claude work out what the company sells, its industry and market (`lib/profile.js`).
2. The API answers `202` right away and keeps working in the background.
3. Five buyer questions go to ChatGPT, Claude and Perplexity (2 unbranded, 3 that name the brand).
4. Claude grades every answer against a fixed rubric (mentioned? rank, tone, depth, sources, competitors).
5. Scores roll up into five dimensions, 100 points total:
   Sentiment 40 · Presence quality 20 · Brand recognition 20 · Share of voice 10 · Market position 10.
6. The report is emailed to the requester, and a lead notification goes to `OWNER_EMAIL`.

Without `ANTHROPIC_API_KEY` the grader runs in **sample-data mode**: everything works end to end,
but scores are made up and every email is clearly labelled `[Sample data]`.

## Go live on Vercel

1. Import this repo in Vercel (no build step needed).
2. In Project → Settings → Environment Variables, add the keys from `.env.example`:
   - `ANTHROPIC_API_KEY` (required for real grades), `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`
   - `RESEND_API_KEY`, `FROM_EMAIL` (on a domain verified in Resend), `OWNER_EMAIL`, `SITE_URL`
3. Redeploy. Any engine without a key is skipped and the report says so.

**Cost:** roughly 31 model calls per grade (15 engine answers, 15 gradings, 1 summary).
Set `JUDGE_MODEL=claude-haiku-5-5` to cut grading cost.

**Abuse:** a honeypot field and a per-IP limit (5/hour) are built in. The limit is per warm
instance only; add a shared store such as Vercel KV for a hard cap before promoting the page widely.

## Local development

```bash
npm install
cp .env.example .env.local   # optional: add keys
npm run dev                  # http://localhost:3000/ai-search-grader.html
npm test
```
