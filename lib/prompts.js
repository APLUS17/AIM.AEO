// Buyer questions sent to each engine.
// "discovery" prompts never name the brand: they measure whether AI brings it up on its own.
// "branded" prompts name the brand: they measure what AI knows and thinks about it.

export function buildPrompts({ company, location, product, industry }) {
  const place = location ? ` in ${location}` : '';
  return [
    {
      id: 'best-options',
      kind: 'discovery',
      text: `What are the best ${product} options for businesses${place}? Name specific companies and say why.`
    },
    {
      id: 'industry-recs',
      kind: 'discovery',
      text: `I work in ${industry}. Which ${product} providers would you recommend, and how do they compare?`
    },
    {
      id: 'brand-profile',
      kind: 'branded',
      text: `What do you know about ${company}, the ${product} company? Be as specific as you can.`
    },
    {
      id: 'brand-verdict',
      kind: 'branded',
      text: `Is ${company} a good choice for ${product}? What are the main pros and cons?`
    },
    {
      id: 'brand-vs-competitors',
      kind: 'branded',
      text: `How does ${company} compare to its main competitors for ${product}${place}?`
    }
  ];
}
