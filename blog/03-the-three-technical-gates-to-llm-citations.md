# The 3 Technical Gates to LLM Citations

> **Category:** Technical AEO  
> **Target Audience:** Developers, Technical Marketers, Web Architects  
> **Key Concept:** Machine-Readable Schema & Topical Authority

---

When an AI crawler (like OpenAI's `GPTBot`, Anthropic's `ClaudeBot`, or Perplexity's indexer) visits your website, it does not view your sleek CSS animations or your interactive hero video.

It parses text tokens and structured code under strict latency and token budget constraints.

If your site is not architected for machine consumption, your brand gets skipped. Here are the three technical gates that determine whether an LLM cites your brand or ignores it.

---

### Gate 1: Nested JSON-LD Schema (The Machine Language)

Traditional SEO used basic OpenGraph tags so Twitter and Facebook could display a link preview. 

AEO requires deeply **nested Schema.org markup** using JSON-LD. This allows an AI crawler to immediately ingest your organization's ontology without hallucinating.

#### What Must Be Defined in Your Schema:
* `@type`: `LocalBusiness`, `Corporation`, or `ProfessionalService`
* `name`: Exact, legal entity name
* `areaServed`: Geo-coordinates, city polygons, or postal code arrays
* `hasOfferCatalog`: Explicit service names, descriptions, and price tiers
* `knowsAbout`: Specific technical specialties and industry entities
* `sameAs`: Authoritative verification links (Wikidata, Crunchbase, state licensing registries, LinkedIn, BBB)

When an LLM searches its internal knowledge graph for a verified entity, your `sameAs` and `knowsAbout` properties provide the mathematical confidence required to name your brand.

---

### Gate 2: Question-First, Quotable Hierarchy

Most corporate websites are written backwards:
* **The Legacy Layout:** 800 words of background narrative $\rightarrow$ A vague bulleted list $\rightarrow$ A phone number.
* **The AEO Layout:** Direct question $\rightarrow$ Clear 1–2 sentence factual answer $\rightarrow$ Supporting data/proof $\rightarrow$ Technical specifications.

#### Why This Matters for Large Language Models:
LLMs are trained to answer questions. When their retrieval pipeline searches the web for context (RAG — Retrieval-Augmented Generation), they look for text chunks that cleanly answer the prompt.

If a page has an `<h2>` that reads:
> *"How long does commercial roof replacement take in Ohio?"*

Followed immediately by:
> *"A standard 10,000 sq ft commercial flat roof replacement in Ohio takes 3 to 5 business days, weather permitting."*

That sentence is formatted perfectly for direct extraction. The AI can lift it, attribute it to your domain, and hyperlink to your site.

---

### Gate 3: Semantic Consensus & Citation Footprint

AI engines don't trust self-reported data without cross-verification. 

If your website claims: *"We are the #1 rated dental surgery in Cincinnati,"* but no external entity confirms this, the AI treats the claim as marketing fluff and drops it.

To achieve **semantic consensus**, your technical footprint must align across:
1. **Industry Licensing Databases:** Validating operational compliance.
2. **First-Party Customer Review Systems:** Google Business Profile, Yelp, Better Business Bureau.
3. **Conversational Sentiment Repositories:** Reddit threads, community forums, and verified user discussions.

When the LLM runs a consensus check, every signal points to the exact same entity with the exact same phone number, address, and specialty.

---

### The Verdict

AEO is not magic. It is deterministic data engineering applied to conversational search. 

Make your data obvious, make your answers extractable, and connect your entity to external proof.

---

*Grade your website's technical AI readiness right now. [Run the AI Search Grader](../../ai-search-grader.html).*
