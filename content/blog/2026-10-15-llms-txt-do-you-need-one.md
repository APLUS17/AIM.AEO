---
title: "llms.txt: what it is and whether you need one"
description: A proposed file that points AI tools to your best pages. What it does, what is unproven, and a cheap way to try it.
date: 2026-10-15
category: Explainers
tags: AEO, llms.txt, technical, AI crawlers
---
Sooner or later someone tells you to add an `llms.txt` file. Here is what it is, what we know about it, and how to decide.

## What it is

`llms.txt` is a plain text file in Markdown, placed at the root of your site (yoursite.com/llms.txt). It was proposed in 2024 as a convention: a short, curated map of your most useful pages, written for AI tools instead of for people.

A typical file has a title, a one or two line summary, and groups of links with a short description each:

```
# Your Company

> One or two sentences on what you sell and who it is for.

## Products
- [Product overview](https://yoursite.com/product): What it does and who it suits
- [Pricing](https://yoursite.com/pricing): Plans, limits and what is included

## Help
- [FAQ](https://yoursite.com/faq): Answers to the questions buyers ask most
```

## What is unproven

It is a proposal, not a standard. We are not aware of the major AI search engines saying they use it to decide what to cite. Check each company's current documentation before you count on it, because this changes.

Some developer tools and agents will read it if you hand them the URL, which is why documentation-heavy sites adopt it first. That is a narrower benefit than "get cited by ChatGPT".

## Do you need one?

> Treat it as a cheap experiment, not a strategy.

- **Probably worth an hour** if you have a large site, a documentation section, or many product pages.
- **Low priority** if you have a small site with a handful of clear pages. Your time does better elsewhere.
- **Never a substitute** for the basics. A file that points to pages crawlers can't reach, or pages with vague copy, fixes nothing.

## How to try it

1. Pick five to ten pages that answer the questions buyers ask: product, pricing, FAQ, comparison, docs.
2. Write a one-line description for each. Lead with what the page answers.
3. Save the file as `llms.txt` at your site root. Serve it as plain text.
4. Link to your canonical URLs only, not to redirects or tracking links.
5. Update it when pages change, and add a reminder to review it each quarter.

It is not access control. Anything you list is public, and leaving a page out does not hide it.

## What to do first

Two things matter more than this file. First, make sure the crawlers can reach your pages at all: [Can AI crawlers read your site?](/blog/can-ai-crawlers-read-your-site.html) Second, write pages an engine can quote: [Write pages AI can quote](/blog/write-pages-ai-can-quote.html)

Not sure where you stand? The [free AI Search Grader](/ai-search-grader.html) scores what ChatGPT, Claude, and Perplexity say about you today.
