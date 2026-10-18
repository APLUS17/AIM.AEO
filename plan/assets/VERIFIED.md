# Verification of the free assets (run 2026-10-18)

Run `python3 plan/assets/make_and_verify.py <schemaorg-current-https.jsonld>` to reproduce.

- **PASS** Spreadsheet formulas recalculate to the hand-counted expectations (15 sample answers, 3 engines)
- **PASS** robots.txt files: search bots allowed; training opt-out blocks GPTBot, ClaudeBot, Google-Extended
- **PASS** JSON-LD (organization, product, faqpage, localbusiness) parses, uses real schema.org types, and only valid properties

JSON-LD: validated against the current schema.org vocabulary file.

Sample questions the template generated: What is the best invoicing tool for a five-person agency? | What are the top invoicing tool options for teams that bill in several currencies? | What is Acme and who is it for? | Is Acme worth it compared with Rival? | How much does Acme cost and what is included?

## Not automated (needs a person)

- Paste each JSON-LD file into Google's Rich Results Test and the schema.org validator. Google's tool cannot be driven from here.
- Open the spreadsheet once in Excel or Google Sheets and confirm the drop-down lists show.
- The robots.txt rules were tested with Python's parser. Crawlers can differ in edge cases, and the user-triggered fetchers may ignore robots.txt entirely.
