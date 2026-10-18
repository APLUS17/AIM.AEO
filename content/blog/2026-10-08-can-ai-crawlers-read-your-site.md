---
title: Can AI crawlers read your site? A 15-minute check
description: Before you fix content or add markup, check that ChatGPT, Claude, and Perplexity can reach your pages at all. Five checks, no special tools.
date: 2026-10-08
category: Guides
tags: AEO, AI crawlers, robots.txt, technical
---
Most AEO advice starts with content. Start one step earlier. If an AI system can't fetch your pages, nothing you write on them will ever show up in an answer.

This check takes about 15 minutes and needs a browser and a terminal. You are looking for three problems: bots that are blocked, bots that are challenged, and pages that arrive empty.

## Know who is knocking

AI companies run more than one crawler, and each has a different job. These are the names the companies publish. Confirm them against each company's documentation before you write rules, because they change.

| Company | Bot | What it does |
|---|---|---|
| OpenAI | `GPTBot` | Collects content that may be used to train models |
| OpenAI | `OAI-SearchBot` | Builds the index behind ChatGPT search results |
| OpenAI | `ChatGPT-User` | Fetches a page when a person asks ChatGPT to look at it. OpenAI says robots.txt rules may not apply |
| Anthropic | `ClaudeBot` | Collects content that may be used for training |
| Anthropic | `Claude-SearchBot` | Indexes pages for Claude's search results |
| Anthropic | `Claude-User` | Fetches a page when a person asks Claude to |
| Perplexity | `PerplexityBot` | Builds Perplexity's search index |
| Perplexity | `Perplexity-User` | Fetches a page when a person asks Perplexity to. Perplexity says it generally ignores robots.txt |
| Google | `Google-Extended` | A robots.txt token, not a separate crawler. It controls whether Google uses your content for Gemini training and grounding. Google says it does not affect Search |

The split matters. Search bots decide whether you can be cited in an answer. Training bots are a separate decision about your content being used to build models. You can say yes to one and no to the other.

User-triggered fetchers are a third case. They act when a person asks, and two of the vendors say robots.txt may not govern them. Blocking them is a firewall decision, not a robots.txt one.

## The five checks

### 1. Read your robots.txt

Open yoursite.com/robots.txt. Look for `User-agent: *` followed by `Disallow: /`, and for a Disallow under any bot in the table. A blanket block, often left over from a staging site, is the most common cause.

### 2. Allow the search bots on purpose

A minimal version:

```
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

Whether to also allow the training bots is a business decision. Make it deliberately, not by default. Check each vendor's page for how its user-triggered fetcher treats robots.txt, because the answers differ.

### 3. Check your firewall and CDN

Bot protection can serve a challenge page or a 403 to crawlers even when robots.txt says yes. Look in your CDN or firewall dashboard for blocked or challenged requests from these user agents. A quick spot check from a terminal:

```
curl -sI -A "PerplexityBot" https://yoursite.com/
```

You want a `200`. Treat this as a hint, not proof. Some firewalls verify bots by IP address, so a request from your laptop can behave differently from the real crawler.

### 4. Look at the raw HTML

Many AI crawlers don't run JavaScript the way a browser does. In a December 2024 study of crawler traffic on its network, Vercel found that OpenAI's and Anthropic's crawlers fetched JavaScript files but did not run them, while Google's Gemini and Apple's AppleBot did render JavaScript. Crawler behaviour changes, so treat that as a snapshot. If your pricing or product text is built in the browser, some crawlers may see an empty shell. Check:

```
curl -s https://yoursite.com/pricing | grep -i "per month"
```

Swap in a phrase that appears on the page. No match means the text isn't in the raw HTML. Server-rendering or pre-rendering the page fixes it.

### 5. Check status codes, redirects and noindex

Your key pages should return a `200`, should not chain through several redirects, and should not carry a `noindex` tag. Open the page source and search for "noindex".

## What good looks like

> If a bot can't fetch the page, the page doesn't exist as far as the answer is concerned.

When you finish, you should be able to say three things. The search bots are allowed. The firewall lets them through. The facts you care about sit in the raw HTML. Fix those first. Content and structured data come next, and the rest of this series covers them.

Want to see what ChatGPT, Claude, and Perplexity say about your brand right now? Run the [free AI Search Grader](/ai-search-grader.html).

## Sources

Last checked October 18, 2026. Crawler names and behaviour change, so confirm against the vendor pages before you write rules.

- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic: Does Anthropic crawl data from the web?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)
- [Google: Google's common crawlers (Google-Extended)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Vercel: The rise of the AI crawler (December 17, 2024)](https://vercel.com/blog/the-rise-of-the-ai-crawler)
