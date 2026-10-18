# AiM blog pattern spec (v1 APPROVED Oct 18, 2026; v1.1 amendments PROPOSED below)

Sections 1 to 8 are the approved v1 pattern. Section 10 lists amendments proposed after a second look at OneWave's real posts; they apply only once approved.

Sources: OneWave's blog (verified), the AiM site-copy and design-system voice rules, and our seven live posts.

---

## 1. Universal anatomy (every post, every type)

1. **Title.** Sentence case. Concrete. Uses the phrase a buyer would actually type or say. Aim for 70 characters or fewer.
2. **Deck** (the front matter `description`). One or two sentences that state the outcome or the answer. It is also the meta description and the Facebook/LinkedIn link text.
3. **Answer first.** The first two sentences give the answer or name the problem. No warm-up.
4. **Headings written as the question or the action.** "How much does it cost?" beats "Pricing overview". Each section opens with its answer.
5. **Exactly one proof element.** A table, a worked example, a test result, or a checklist. Never an unsupported statistic.
6. **One pull quote.** A single blockquote line that works if quoted alone.
7. **Close with a next step.** "What to do this week" or equivalent, then ONE primary CTA set by the cluster, plus one or two links to sibling posts.
8. **Length.** 500 to 900 words. Industry playbooks may run to 1,100. (OneWave runs about 2,000 to 2,800. We stay short on purpose.)
9. **Voice.** Short declarative sentences. "We" to "you". No exclamation marks, no emoji, no hype. Sentence-case headings.
10. **Byline.** "The AiM Team" until there is a named author (see decisions).

## 2. Funnel rules

- Every post has ONE primary CTA, never more than two total.
- Codes: **G** = free AI Search Grader. **G+B** = grader plus a booking link (the link doesn't exist yet).
- Cluster to CTA: Visibility, Position and Sentiment posts end in **G**. Monitor posts and the trust and plan posts end in **G+B**.
- Second link in every post goes to the next post in its cluster, so a reader always has somewhere to go.
- Assets are never gated. The grader is the only thing behind an email.

## 3. Taxonomy (how posts are labelled)

| Field | Values |
|---|---|
| type (`category`) | Comparison, Industry, Guide, Test, Trust, Asset |
| pillar | Visibility, Position, Sentiment, Monitor |
| step | 1 Map & Audit, 2 Structure & Feed, 3 Monitor & Defend |
| tags | industry or role, plus topic terms |

## 4. The six templates

### T1. Comparison ("X vs Y")
- **Buyer moment:** choosing between two options.
- **Title formula:** "X vs Y: the decision it settles".
- **Skeleton:** (1) The verdict in two sentences: choose X if..., choose Y if.... (2) Comparison table, five criteria. (3) Where X wins. (4) Where Y wins. (5) How we'd decide: three questions. (6) Next step.
- **Proof element:** the comparison table, built from real use or a test we ran.
- **Rules:** state the date of any test. Don't copy spec sheets. Be fair to named products and claim nothing about them we can't support. If we can't test it, describe the category instead of the product.
- **CTA:** G.

### T2. Industry playbook ("AEO for [industry]: the playbook")
- **Buyer moment:** an owner who wants this written for their field.
- **Skeleton (identical every time):** (1) Why buyers in this field now ask AI. (2) The five questions to test, in that industry's own words. (3) What to check for errors in this field (framed as checks, not claims). (4) Five fixes, numbered. (5) An example facts block: the plain facts to publish (services, area, price range, hours), labelled as an example. (6) Re-test in 30 days.
- **Proof element:** the example facts block.
- **Rules:** same headings across all ten so the series reads as a system. No ROI numbers until we have measured them.
- **CTA:** G.

### T3. Guide, plan or role playbook
- **Buyer moment:** "how do I do this?" or "what should my role do?"
- **Title formula:** "How to...", "The 30-day plan for...", "AEO for [role]".
- **Skeleton:** (1) Who it's for and how long it takes. (2) Steps or weeks, each with one deliverable. (3) What done looks like. (4) Where doing it yourself gets hard (honest handoff). (5) Next step.
- **Proof element:** the checklist or timeline.
- **Rules:** give away the real method. Never hold back steps to force a sale.
- **CTA:** G, or G+B for the 30 and 90-day plans.

### T4. Test, data or news ("We tested...")
- **Buyer moment:** "what is actually true?" or "what just changed?"
- **Skeleton:** (1) What we asked: method, date, engines. (2) What we saw: a table. (3) What it means: three takeaways. (4) What we don't know: the limits. (5) What to do.
- **Proof element:** the results table, from a real run.
- **Rules:** publish the method. State the sample size. No cherry-picking. News posts go out within five days of the event or not at all. If nothing newsworthy happens, a flex slot becomes a short field note.
- **CTA:** G.

### T5. Trust ("Who should not...", "Why projects stall...", "How to choose...", "What it can't do")
- **Buyer moment:** a skeptical buyer deciding whether to trust anyone.
- **Skeleton:** (1) The direct claim, in the title. (2) The criteria, each with a reason. (3) When to do it yourself. (4) When hiring is worth it. (5) The honest limits.
- **Proof element:** the criteria list.
- **Rules:** it must be able to tell a reader "not us". That is what makes it credible.
- **CTA:** G+B, soft.

### T6. Free asset
- **Buyer moment:** "give me something I can use today."
- **Skeleton:** (1) What it is and who it's for. (2) The asset, inline or as a download. (3) How to use it in three steps. (4) How to read the results. (5) When to get help.
- **Proof element:** the asset itself.
- **Rules:** works with no email gate. Must be tested before it is published.
- **CTA:** G.

## 5. Definition of done (a post ships only when all ten are true)

1. Title, deck and meta description are written. The deck is under about 160 characters where possible.
2. The first two sentences answer or name the problem.
3. There is exactly one proof element.
4. Every number has a source or a test we ran. Examples are labelled as examples.
5. Every vendor, bot or product name was checked against its current official docs.
6. No placeholders. Search the text for "[", "TODO", "N" and "number". (The Oct 14 post shipped with "[number]". This check is there for that reason.)
7. Every link resolves.
8. One primary CTA, and a link to the next post in the cluster.
9. It has a pull quote, and a "what to do" close.
10. It was read once on a phone for line breaks and table width.

## 6. Distribution (one pass per post, Friday work)

- One Facebook post and one LinkedIn post per article: a hook line, two lines of value, then the link. Same pattern as `facebook-posts.md`.
- Never post a link to a page that hasn't passed the definition of done.

## 7. How the seven live posts map to the pattern

| Live post | Template it follows | Gap against the pattern |
|---|---|---|
| Can AI crawlers read your site? | T3 Guide | None significant |
| AEO vs SEO | T1 Comparison (explainer form) | No clear verdict line up top |
| Five questions to test your brand | T3 Guide | None significant |
| What to do when AI gets your brand wrong | T3 Guide | None significant |
| Write pages AI can quote | T3 Guide | Placeholder "[number]" still live |
| llms.txt: do you need one | T1/T3 hybrid | Claims need a vendor-doc check |
| A 60-minute weekly AEO routine | T3 Guide | None significant |

## 8. Worked skeleton: how T1 would look for P01 (outline only, not the post)

Title: AEO vs GEO vs SEO: which term to use, and does it matter?
- Verdict: use "AEO" with buyers, mention "GEO" so you match what they search, and keep "SEO" for the Google work. The labels overlap more than they differ.
- Table (5 rows): what each term names, who uses it, what it targets, what you do, how you measure.
- Where AEO wins: when the buyer asks a full question and wants one name.
- Where SEO wins: when the buyer still wants a list to compare.
- How we'd decide: three questions about where your buyers ask.
- Next step: run the five-question test, then the grader.
- Pull quote: "The labels matter less than whether the answer names you."

---

## 9. Approved decisions (v1)

1. Length: short, 500 to 900 words (industry playbooks up to 1,100).
2. Byline: "The AiM Team" until a real named author is willing to be on posts.
3. Gating: assets free and ungated; the grader is the only email gate.
4. Templates: the six above.

## 10. PROPOSED v1.1 amendments (from a second check of five real OneWave posts, Oct 18)

Posts read: Claude Code vs Codex, AI for Auto Dealerships, How to Train Your Team on Claude, Who Should NOT Hire an AI Consultancy, and the Jev benchmark.

What OneWave actually does:
- **Openers are specific and first-person, not number-led.** "Last week we trained a 35-person finance team on Claude, and the risk that could have sunk day one was the sign-ins." "We run an AI consultancy, and we regularly tell people not to hire us." Only the benchmark post opens with tested numbers, and none names an audience.
- **Most posts have no table.** One of five has a table (a simple feature grid, not cost/setup/ROI). The benchmark uses charts. The plan, playbook and trust posts use prose, bullets and numbered sections.
- **An honest-limits section appears in three of five:** "What we are not claiming", "What we deliberately leave out", "What not to automate (yet)".
- **A DIY-or-partner section sits near 80%** in the plan post: it admits a free DIY route exists, then says where a partner earns its fee.
- **A Sources section at the end** with 7 to 10 links in the comparison and plan posts. (Their industry post leaves several stats unsourced. We do not copy that.)
- **Conversion stack:** a persistent header "Book a call" and "Let's build" on every page; soft in-body links to free resources and open-source tools; ONE end-of-post form ("Want this applied to your own stack?" with a "What are you trying to do?" selector and email, button "Send it to me"); "Book a free 30-minute call" and a Calendly link under it; a newsletter; a footer "Book a free call".
- **No downloadable checklist or prompt pack in any of the five.** The only real giveaways are open-source tools (skills library, the Crest app, Jev skills).

Proposed amendments to our pattern:
1. **Opener:** lead with a specific, true event or an honest admission. Use numbers in the opener only when we ran the test. Never invent an event or a figure.
2. **Limits block:** add "What we are not claiming" to Test, Guide/plan and Industry templates.
3. **Sources section** at the end of any post that cites outside facts. Every statistic links to its primary source or is cut.
4. **Handoff section** (about 80%) in Guide/plan and Trust: say honestly what DIY gets you and where help is worth paying for. One link.
5. **Conversion stack for AiM:** persistent header CTA (exists: "Grade my brand"), soft in-body link to the grader or a free asset, ONE end-of-post segmented ask, newsletter, footer CTA. The segmented form and booking link are infrastructure (parked).

Deliberately NOT adopted from the pasted "4-block template":
- Hooks with exact test numbers as a rule. The example hook ("audited 40 sites... 78%...") is invented-looking; our rule is no figure we did not measure.
- A cost / setup time / maintenance / ROI table in the top 30% of every post. It appears in none of the five posts.
- A mid-page "grab the raw prompts" gate. Not observed.
- "We deploy this in 14 days" and a "15-minute build call". Not observed, and a delivery timeframe is a business decision we have not made. OneWave's real claims are looser ("results in weeks", "30-day pilot").
