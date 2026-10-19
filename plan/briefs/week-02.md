# Week 2 briefs (2026-10-26 to 2026-10-29)

## P07 · Mon 2026-10-26 · Comparison

**Headline:** Schema vs llms.txt vs plain good copy: where to spend your first hour

**Subheadline:** Google says you do not need special AI files or markup. Here is what the evidence shows, and what to do first.

**Status:** Approved. **Pattern:** Comparison. Proof element: Effort / evidence / risk table. Next step for the reader: free AI Search Grader.

**What it covers**

- A table comparing page copy, schema and llms.txt on effort, evidence and risk.
- A one-hour plan in order.
- Why copy comes first.

**What you will learn:** Google's own position on special AI files and markup, and why plain page text comes first.

**Data and stats I found (checked at the original publisher)**

- Google: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." Also: "You don't need to create new machine readable files, AI text files, or markup", and "no special schema.org structured data that you need to add". SEO best practices remain relevant.
  - Source: [Google Search Central, AI features and your website (updated 2025-12-10)](https://developers.google.com/search/docs/appearance/ai-features) (Primary). Retrieved 2026-10-18.
- Vercel (December 17, 2024): "none of the major AI crawlers currently render JavaScript." OpenAI's and Anthropic's crawlers fetched JavaScript files (11.50% and 23.84% of requests) but did not run them. Google's Gemini and Apple's AppleBot did render JavaScript.
  - Source: [Vercel blog, The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) (Primary). Retrieved 2026-10-18.
  - Caveat: A December 2024 snapshot from Vercel's own network and nextjs.org. Crawler behaviour changes. Vercel's labels are "ChatGPT" and "Claude", which may not map exactly to GPTBot and ClaudeBot.
- SE Ranking, about 300,000 domains: 10.13% had an llms.txt file (9.88% low traffic, 10.54% mid, 8.27% high). "There's no correlation between AI citations and LLMs.txt." Removing it from their model improved the model's accuracy.
  - Source: [SE Ranking blog (page dated 2026-10-15)](https://seranking.com/blog/llms-txt/) (Primary). Retrieved 2026-10-18.
  - Caveat: Authors say results are context-dependent and may be outdated within weeks. Secondary coverage dates the study November 2025; the date on the page is unresolved.
- llms.txt was proposed by Jeremy Howard, published September 3, 2024. The site says the AI labs publish llms.txt for their own developer docs (it names OpenAI, Anthropic and Gemini). It does not say their products read other sites' files.
  - Source: [llmstxt.org](https://llmstxt.org/) (Primary). Retrieved 2026-10-18.

_Used in the draft: all four._

**What is our judgment, not sourced fact**

- The ordering (copy, then markup, then llms.txt) is our reading of the evidence.
- Crawler behaviour and study findings are snapshots; the post says so.

**Questions for you**

- Is "copy first" the position you want AiM to take publicly?

**Draft:** written and approved, in `content/blog/2026-10-26-schema-vs-llms-txt-vs-good-copy.md`

## P08 · Tue 2026-10-27 · Comparison

**Headline:** Which AI engine should you check first? A buyer-led way to choose

**Subheadline:** Usage and referral data point different ways. Start with where your own buyers ask.

**Status:** Approved. **Pattern:** Comparison. Proof element: Decision table by buyer behaviour. Next step for the reader: free AI Search Grader.

**What it covers**

- How many people use AI chatbots, and which ones.
- Where AI-referred visitors actually come from.
- A three-step buyer-led way to choose which engine to test first.

**What you will learn:** Who really uses these tools, where AI visitors come from, and why "the biggest engine" depends on who you measure.

**Data and stats I found (checked at the original publisher)**

- Pew: 44% of US adults have used ChatGPT (34% in 2025, 23% in 2024, 18% in 2023). 49% use any AI chatbot (33% in 2024). 24% use chatbots daily.
  - Source: [Pew Research Center, Americans and AI 2026 (2026-06-17)](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026/) (Primary). Retrieved 2026-10-18.
  - Caveat: 5,119 US adults, February 17 to 23, 2026. The question wording changed in 2026 to cover other chatbots, so the jump is not perfectly comparable.
- SE Ranking, 101,574 websites, January 2025 to April 2026: AI platforms sent 0.32% of all website traffic (0.24% in 2025, 0.02% in 2024). Share of AI referrals: ChatGPT 74.78%, Gemini 11.56%, Perplexity 7.23%, Copilot 3.51%, Claude 2.62%. ChatGPT's referrals grew 27% while its share fell from 79.74%. Claude grew 320%, Gemini 231%.
  - Source: [SE Ranking AI traffic study (2026-06-18)](https://seranking.com/blog/ai-traffic-research-study/) (Primary). Retrieved 2026-10-18.
  - Caveat: Authors say it may not reflect every site, industry or region. Its list of tracked platforms does not include Google's AI Overviews. Other studies report different shares (secondary coverage only, not opened).

_Used in the draft: both._

**What is our judgment, not sourced fact**

- The rule of thumb for when you have no data yet is our judgment and is labelled as such.

**Questions for you**

- Is it fine to point readers at their own analytics and customers before our grader?

**Draft:** written and approved, in `content/blog/2026-10-27-which-ai-engine-to-check-first.md`

## P03 · Wed 2026-10-28 · Test

**Headline:** We ran our own five-question test: AiM was named 0 times in 10 searches

**Subheadline:** One search engine, five questions, each asked twice. What came back, what changed between runs, and what one test cannot tell you.

**Status:** Approved. **Pattern:** Test. Proof element: Results table: named / pages shared between runs / what came back, per question. Next step for the reader: free AI Search Grader.

**What it covers**

- The five questions from our guide, run on AiM itself with one search engine.
- A results table for 10 searches, two per question.
- What changed between runs, and what we are not claiming.

**What you will learn:** How to run the five-question test on your own brand, and why one run is an anecdote.

**Data and stats I found (checked at the original publisher)**

- AiM was named in 0 of 10 searches. The four searches that did not name us returned agency lists and pricing guides; the six that did returned other companies with similar names (aeoagency.org, i-am.agency, Aimeos, Vercel AI Gateway) and said nothing was found about AiM.
  - Source: [Our own test, October 18, 2026 (log: plan/ledger/p03-test-log.md)]() (Own test). Retrieved 2026-10-18.
  - Caveat: One engine (the Claude Code web search tool), one day, two runs per question. Not ChatGPT, the Claude app or Perplexity. Questions 3 to 5 included our domain.
- Between the two runs of each question: 3 of 15 distinct pages shared (Q1), 0 of 18 (Q2), 9 of 9 (Q3), 0 of 18 (Q4), 9 of 9 (Q5).
  - Source: [Our own test log]() (Own test). Retrieved 2026-10-18.
  - Caveat: Counts compare returned URLs only. We did not open the pages.
- In all four runs of the two category questions, the written answer said the results were mostly vendor-written or sales pages.
  - Source: [Our own test log]() (Own test). Retrieved 2026-10-18.
  - Caveat: This is the search tool's written summary, a model's reading of the results.

_Used in the draft: Own test only._

**What is our judgment, not sourced fact**

- Route chosen by you on Oct 18: web search only. The post says so in its first section and does not mention ChatGPT, Claude or Perplexity results.
- Subject is AiM itself, so nothing is said about another business.
- The headline says 'named 0 times', which is what we measured. It makes no claim about why.

**Questions for you**

- The post says AiM 'had been publishing for ten days' when we ran the test. Is it right to publish our own zero result?
- Do you want us to re-run this monthly (P44 would use it)?

**Draft:** written and approved, in `content/blog/2026-10-28-we-ran-our-own-five-question-test.md`

## P04 · Thu 2026-10-29 · Yours

**Headline:** AI doesn't rank you, it shortlists you

**Subheadline:** A search page shows ten links. An AI answer names a handful of options, and fewer people click through. What that changes about being chosen.

**Status:** Approved. **Pattern:** Yours. Proof element: Search page vs AI answer table, with Pew click data. Next step for the reader: free AI Search Grader.

**What it covers**

- Your Oct 14 article, rewritten: a search page gives ten links, an AI answer names a few.
- Pew click data on AI summaries, with its limits.
- Three things we think decide who is named, labelled as our view.

**What you will learn:** How being named in an answer differs from ranking, and what to check this week.

**Data and stats I found (checked at the original publisher)**

- Pew: with an AI summary, people clicked a regular result link in 8% of visits, against 15% with no summary; 1% clicked a link inside the summary; 26% of visits with a summary ended the session, against 16% without.
  - Source: [Pew Research Center short read, 2025-07-22](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) (Primary). Retrieved 2026-10-18.
  - Caveat: 900 US adults, 68,879 Google searches, March 2025. Observational. Google only.
- Google: "The best practices for SEO continue to be relevant"; AEO and GEO are not separate from SEO. It defines query fan-out as "A set of concurrent, related queries generated by the model."
  - Source: [Google Search Central, Optimizing your website for generative AI features (updated 2026-07-10)](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (Primary). Retrieved 2026-10-18.
  - Caveat: About Google's features only. The post does not claim other engines work this way.
- Vercel: OpenAI's and Anthropic's crawlers fetched JavaScript files but did not run them (December 2024).
  - Source: [Vercel blog, The rise of the AI crawler (2024-12-17)](https://vercel.com/blog/the-rise-of-the-ai-crawler) (Primary). Retrieved 2026-10-18.
  - Caveat: December 2024 snapshot from Vercel's own network. Crawler behaviour changes.
- Our own test (P03): the written answers to the 'best AEO agency' question named about five firms each, and searches for AiM returned similarly named companies.
  - Source: [Our own test, October 18, 2026]() (Own test). Retrieved 2026-10-18.
  - Caveat: One engine, one day, two runs.

_Used in the draft: Pew, Google, Vercel, own test._

**What is our judgment, not sourced fact**

- Headline changed from 'selects you' to 'shortlists you': our own test shows answers name several options, so 'selects one answer' overstated it.
- Cut from your original: 'confidence score drops to zero', 'computation budgets', 'LLMs do not count keywords', and 'invisible inside ChatGPT despite #1' (none sourced). The three gates stay, as our view and tied to our own test.
- This post links to P03 (Oct 28). If you approve P04 without P03, the checks will block it.

**Questions for you**

- The original adapted a third-party article. Do you have its URL? I could not find it, so I rewrote this from sourced material instead of the original's wording.
- Are you comfortable with the shorter headline replacing 'selects you'?

**Draft:** written and approved, in `content/blog/2026-10-29-ai-doesnt-rank-you-it-shortlists-you.md`

