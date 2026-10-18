---
title: "Schema vs llms.txt vs plain good copy: where to spend your first hour"
description: Google says you do not need special AI files or markup. Here is what the evidence shows, and what to do first.
date: 2026-11-04
status: draft
category: Comparison
tags: AEO, schema, llms.txt, structured data, copywriting
---
You have one hour and three things people tell you to do: write clearer page copy, add schema markup, or create an llms.txt file. The evidence points to an order. Clear copy first, then crawl access and markup that matches your page. The llms.txt file comes last.

## The comparison

| Option | Effort | What the evidence says | Risk |
|---|---|---|---|
| Plain, clear copy in the page HTML | Low to medium | Google says SEO best practices remain relevant to its AI features. Vercel's December 2024 study found OpenAI's and Anthropic's crawlers did not run JavaScript, so text built in the browser can be missed | Low |
| Structured data (schema) | Low to medium | Google says there is "no special schema.org structured data that you need to add" for its AI features, and that markup should match the visible text | Markup that disagrees with the page creates a new conflict |
| llms.txt | Low | Google says you do not need AI text files. SE Ranking found about 10% of nearly 300,000 domains had one, with no correlation to AI citations | Low, but mostly a time cost |

Crawler behaviour changes, and these findings are snapshots. The sources are at the end.

## Your first hour

1. **Minutes 0 to 20: read the page like a crawler does.** Fetch the raw HTML and check that your price, services and key facts are in it. The commands are in [Can AI crawlers read your site?](/blog/can-ai-crawlers-read-your-site.html)
2. **Minutes 20 to 40: fix the first screen.** Put the answer in the first two sentences, and use plain, specific words. The checklist is in [Write pages AI can quote](/blog/write-pages-ai-can-quote.html)
3. **Minutes 40 to 50: make any markup match.** If you use schema, check each field against what a visitor can read on the page. Remove anything that does not match.
4. **Minutes 50 to 60: llms.txt, only if it fits.** It is worth the time mainly for a documentation-heavy site. [llms.txt: what it is and whether you need one](/blog/llms-txt-do-you-need-one.html) explains when.

## Why this order

Copy comes first because it is the thing every engine reads, and it helps people too. Markup comes second because Google's own guidance says it is not required for AI features, but it must agree with the page when you use it. llms.txt comes last because the evidence for it is the thinnest.

> Fix the page before you describe the page.

Not sure where your pages stand? The [free AI Search Grader](/ai-search-grader.html) shows what ChatGPT, Claude, and Perplexity say about you today.

## Sources

Checked October 18, 2026.

- [Google Search Central: AI features and your website (updated December 10, 2025)](https://developers.google.com/search/docs/appearance/ai-features)
- [Vercel: The rise of the AI crawler (December 17, 2024)](https://vercel.com/blog/the-rise-of-the-ai-crawler)
- [SE Ranking: llms.txt and AI citations, nearly 300,000 domains](https://seranking.com/blog/llms-txt/)
- [llmstxt.org: the proposal (September 3, 2024)](https://llmstxt.org/)
