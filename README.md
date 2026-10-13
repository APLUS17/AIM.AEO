# AiM AEO site + AI Search Grader

- `index.html`: main landing page
- `ai-search-grader.html`: free AI Search Grader page
- `api/grade.js`: grading endpoint (Vercel serverless function)
- `lib/`: grading pipeline (prompts → engines → judge → scoring → email)

## Design system: Ember Ledger

The site is built on the Ember Ledger design system, pulled from Claude Design (see
`design-system/SOURCE.md` for the project and what was copied).

- `design-system/tokens.json` → `npm run tokens` → `design-system/tokens.css` (custom properties + `.ts-*` type classes)
- `design-system/components/bundle.css`: the `el-*` component classes (buttons, nav pill, tags, feature and data cards, hero)
- `site.css`: page layout only, token values only. No raw hex, shadows, gradients or divider lines
- `design-system/README.md` has the rules: ember is an accent never a fill, buttons are square, sections alternate white and ash bands

To update the design: re-pull the files from the Claude Design project, run `npm run tokens`, and re-check both pages.
The grader report email (`lib/email.js`) inlines the same palette because email clients can't read CSS variables.

## How the grader works

1. The form posts company, location, product, industry and email to `/api/grade`.
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
