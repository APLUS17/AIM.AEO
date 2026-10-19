# plan/

Private working files for the blog. `.vercelignore` keeps this folder off the public site.

| File | What it is |
|---|---|
| `pattern.md` | The approved post pattern (v1) and the proposed v1.1 amendments |
| `approvals.md` | **Start here.** Every headline and subheadline, with research and draft status, for you to approve or change |
| `schedule.md`, `schedule.csv` | The 46-post schedule: date, template, CTA, proof element, what each post needs |
| `briefs/week-NN.md` | Per week: what each post covers, what you will learn, the stats found with their sources, what is our judgment, questions for you |
| `emails/week-NN.md` | The pre-publish email text for a week (weeks 1 and 2 now; later weeks are written after their research) |
| `ledger/` | Claim-by-claim checks: your five Oct 14 articles, and what OneWave actually cites |
| `assets/` | The free template and snippet pack, with `VERIFIED.md` |

## How approval works

1. Before each week I research its posts and write `briefs/week-NN.md` and `emails/week-NN.md`.
2. You get the email text (from your scheduled email), read the topic, the headline, the subheadline and the data, and reply APPROVE or send changes.
3. A post stays `status: draft` in `content/blog/` until you approve. Then I change it to `status: approved`.
4. The daily workflow publishes approved posts on their date. Drafts never publish, whatever their date.
5. `npm run blog:lint` and the workflow's pattern check block a post with an unresolved placeholder, a broken link, or a link to a post that is not live yet.

## Regenerating

The schedule, approvals and briefs are generated from one data file, so a date change is one edit and a re-run.

## Content Desk (interactive dashboard)

`plan/posts.json` is the source of truth for every live and scheduled post. The Content Desk artifact holds a copy in its database, where posts can be approved, moved, edited and annotated. Edits there do not publish. To sync:

1. Read the desk's `posts` collection and write each post whose fields differ from its `repo` snapshot into a changes file: `{ "P03": { "status": "headline_ok", "date": "2026-10-29", "note": "..." } }`.
2. `node scripts/plan.mjs apply changes.json` (add `--dry` to preview). It renames and rewrites `content/blog/*.md` and `plan/posts.json`, then re-renders the schedule, briefs and emails.
3. `npm test` and `npm run blog:lint`, commit, merge. Then update each synced desk document's `repo` snapshot so it shows as synced.

`node scripts/plan.mjs seed` writes the documents used to load the desk.

## After every publish (standing rule)

Whenever a post goes live, the Content Desk must show it as Live, in the same session if possible.

1. Confirm the page is up on the site, then run `node scripts/plan.mjs published` (it checks every approved post that is due and marks only those that return 200 on the live site). Pass ids to limit it: `node scripts/plan.mjs published P02`.
2. Update each post's desk document: `status: "live"`, `publishedOn`, `repo.status: "live"`, and one history line. A live post is never edited or moved in the desk.
3. Commit the regenerated plan files to the working branch. They are private, so no PR is needed on their own.
4. At the start of any session, check whether a post went live since the last one and do steps 1 to 3 before other work.

The daily 19:30 UTC check also tries to do step 2 for the day's post if its session has the artifact tool. That is not proven until it has run once.
