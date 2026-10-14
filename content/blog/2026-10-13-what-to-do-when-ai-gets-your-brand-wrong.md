---
title: What to do when AI gets your brand wrong
description: Wrong prices, old features, a competitor named instead of you. Trace the error to its source and fix it there.
date: 2026-10-13
category: Guides
tags: AEO, brand accuracy, structured data, schema
---
You ask ChatGPT about your product and it quotes last year's pricing. Or it describes a feature you retired, or recommends a competitor for a job you do better.

Wrong answers often trace back to a source: an old page, a stale listing, a conflicting number in two places. That is good news, because a source can be fixed. Here is the order we work in.

## Six steps

### 1. Write down the exact error

Record the question, the engine, the date, and the sentence that is wrong. Without this you can't tell later whether your fix worked.

### 2. Find where it could come from

Some engines show their sources. Perplexity lists citations, and ChatGPT shows links when it searches the web. You can also ask the engine where it got a claim. Then check the usual suspects:

- Your own old pricing, feature and about pages
- Old blog posts and press releases that are still live
- Review sites, directories and marketplace listings
- Comparison articles written by other people

### 3. Fix the sources you control

Update, redirect or remove anything out of date. Then make one page that states the plain facts: what you sell, who it is for, what it costs, the main features, and the date the page was last updated. Keep it in normal text on the page, not inside an image or a script.

### 4. Make the facts machine-readable

Structured data tells crawlers what each fact is. For most companies the useful types are `Organization`, `Product` and `FAQPage` from schema.org. A small example:

```
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your product",
  "description": "What it does and who it is for.",
  "offers": { "@type": "Offer", "price": "99.00", "priceCurrency": "USD" }
}
```

The markup must match what a visitor can read on the page. If the two disagree, you have created a new conflict instead of fixing one.

### 5. Fix the sources you don't control

Update your profiles on directories and review sites. For articles written by others, ask the author for a correction and send them the updated facts. It is slower than editing your own site, and it often matters most.

### 6. Re-test the same question

Ask the same question on the same engines after a couple of weeks. Engines that search the live web can reflect changes sooner than models that rely mostly on what they were trained on. Nobody can promise a date, so keep checking and keep the notes.

## What not to do

> Fix the source, not the symptom.

- **Don't hide text for crawlers.** Content that visitors can't see is a risk, and it won't hold up.
- **Don't mass-post the same claim everywhere.** One accurate page that other sources can point to beats fifty copies.
- **Don't change facts without changing the date.** A visible "last updated" line helps people and machines trust the page.

Not sure what the AI gets wrong about you yet? The [five-question test](/blog/five-questions-to-test-your-brand-in-ai.html) will show you, and the [free AI Search Grader](/ai-search-grader.html) will score it.
