# plan/

Private working files for the blog. `.vercelignore` keeps this folder off the public site.

| File | What it is |
|---|---|
| `pattern.md` | The approved post pattern (v1) and the proposed v1.1 amendments |
| `approvals.md` | **Start here.** Every headline and subheadline, with research and draft status, for you to approve or change |
| `schedule.md`, `schedule.csv` | The 46-post schedule: date, template, CTA, proof element, what each post needs |
| `briefs/week-NN.md` | Per week: what each post covers, what you will learn, the stats found with their sources, what is our judgment, questions for you |
| `emails/week-NN.md` | The pre-publish email text for a week (weeks 1 and 2 now; later weeks are written after their research) |
| `ledger/` | Claim-by-claim checks: your five Oct 14 articles |
| `assets/` | The free template and snippet pack, with `VERIFIED.md` |

## How approval works

1. Before each week I research its posts and write `briefs/week-NN.md` and `emails/week-NN.md`.
2. You get the email text (from your scheduled email), read the topic, the headline, the subheadline and the data, and reply APPROVE or send changes.
3. A post stays `status: draft` in `content/blog/` until you approve. Then I change it to `status: approved`.
4. The daily workflow publishes approved posts on their date. Drafts never publish, whatever their date.
5. `npm run blog:lint` and the workflow's pattern check block a post with an unresolved placeholder, a broken link, or a link to a post that is not live yet.

## Regenerating

The schedule, approvals and briefs are generated from one data file, so a date change is one edit and a re-run.
