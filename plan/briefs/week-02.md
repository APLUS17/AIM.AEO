# Week 2 briefs (2026-10-26 to 2026-10-29)

## P07 · Mon 2026-10-26 · Comparison

**Headline:** Schema vs llms.txt vs plain good copy: where to spend your first hour

**Subheadline:** Google says you do not need special AI files or markup. Here is what the evidence shows, and what to do first.

**Pattern:** Comparison. Proof element: Effort / evidence / risk table. Next step for the reader: free AI Search Grader.

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

**Draft:** written, APPROVED on 2026-10-18, status: approved, in `content/blog/2026-10-26-schema-vs-llms-txt-vs-good-copy.md`

## P08 · Tue 2026-10-27 · Comparison

**Headline:** Which AI engine should you check first? A buyer-led way to choose

**Subheadline:** Usage and referral data point different ways. Start with where your own buyers ask.

**Pattern:** Comparison. Proof element: Decision table by buyer behaviour. Next step for the reader: free AI Search Grader.

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

**Draft:** written, APPROVED on 2026-10-18, status: approved, in `content/blog/2026-10-27-which-ai-engine-to-check-first.md`

## P03 · Wed 2026-10-28 · Test

**Headline:** We asked ChatGPT, Claude, and Perplexity the same five questions: how their sources differed

**Subheadline:** How the answers and the sources differed between engines, how we tested, and what we cannot conclude from the results.

**Pattern:** Test. Proof element: Results table: mentioned / position / sources, per engine. Next step for the reader: free AI Search Grader.

**What it covers**

- The same five questions on ChatGPT, Claude and Perplexity.
- A results table: mentioned, position, sources.
- Method, date and the limits of what we can say.

**What you will learn:** How different engines answer the same buyer question, measured, not guessed.

**Data and stats:** none used in this post.

**What is our judgment, not sourced fact**

- Not blocked on keys. Nothing is claimed until the test is run.
- Two no-key routes: you run the free template on the three apps (what buyers actually see), or I run a web-search-only version (one engine, which the post must say).
- If anyone later runs it through the developer APIs, those models are not the same as the consumer apps, and the post must say so.

**Questions for you**

- Which route: you run the three apps by hand (best), or web-search only?
- Which subject should the test use: AiM itself, or a business you choose?

**Draft:** not started

## P04 · Thu 2026-10-29 · Yours

**Headline:** Why AI doesn't rank you, it selects you

**Subheadline:** A search page shows ten links. An AI answer names a few options. What that changes about how a business gets chosen.

**Pattern:** Yours. Proof element: The article's own comparison table. Next step for the reader: free AI Search Grader.

**What it covers**

- Your Oct 14 article "Why AI doesn't rank you, it selects you", converted to the pattern.
- Search shows ten links; AI answers name a few options.

**What you will learn:** How being chosen differs from being ranked.

**Data and stats:** none used in this post.

**What is our judgment, not sourced fact**

- Blocked: needs the originality check against the third-party article your README cites, and a source for every claim in it.

**Questions for you**

- Do you have the URL of the original article it was adapted from?

**Draft:** not started

