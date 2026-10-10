// Sample data for running the full pipeline without API keys.
// Deterministic per company name so tests and previews are repeatable.
// Reports built from this are always labelled as sample data.

function seededRandom(seedText) {
  let h = 2166136261;
  for (const ch of seedText) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const SAMPLE_COMPETITORS = ['Northwind', 'Contoso', 'Fabrikam', 'Globex', 'Initech', 'Umbrella Co'];

export function mockAnswer(input, prompt, engine) {
  const rand = seededRandom(`${input.company}|${prompt.id}|${engine.id}|answer`);
  const others = SAMPLE_COMPETITORS.filter(() => rand() > 0.5).slice(0, 3);
  const mentions = prompt.kind === 'branded' || rand() > 0.45;
  const names = mentions ? [input.company, ...others] : others;
  return {
    text: `[Sample answer from ${engine.label}] For ${input.product}, buyers often look at ${names.join(', ') || 'several providers'}.`,
    citations: engine.id === 'perplexity' ? ['https://example.com/review'] : []
  };
}

export function mockJudge(input, prompt, engine) {
  const rand = seededRandom(`${input.company}|${prompt.id}|${engine.id}|judge`);
  const mentioned = prompt.kind === 'branded' || rand() > 0.45;
  return {
    mentioned,
    recognition: mentioned ? pick(rand, ['vague', 'specific', 'specific']) : 'none',
    rank: mentioned && prompt.kind === 'discovery' ? 1 + Math.floor(rand() * 4) : 0,
    sentiment: mentioned ? pick(rand, ['neutral', 'positive', 'positive', 'very_positive', 'negative']) : 'neutral',
    depth: mentioned ? pick(rand, ['low', 'medium', 'high']) : 'none',
    source_quality: mentioned ? pick(rand, ['low', 'medium', 'high']) : 'none',
    data_richness: mentioned ? pick(rand, ['low', 'medium', 'high']) : 'none',
    category_role: mentioned ? pick(rand, ['leader', 'challenger', 'niche']) : 'unknown',
    innovation: mentioned ? pick(rand, ['innovator', 'disruptor', 'traditionalist']) : 'unknown',
    competitors: SAMPLE_COMPETITORS.filter(() => rand() > 0.55).slice(0, 3),
    evidence: ''
  };
}

export function mockSummary(input, score) {
  const weakest = [...score.dimensions].sort((a, b) => a.points / a.max - b.points / b.max)[0];
  const strongest = [...score.dimensions].sort((a, b) => b.points / b.max - a.points / a.max)[0];
  return {
    summary: `This is sample data, not a real check. ${input.company} scored ${score.total}/100 (${score.band}). ` +
      `The strongest area is ${strongest.name.toLowerCase()} and the weakest is ${weakest.name.toLowerCase()}.`,
    strengths: [`${strongest.name}: ${strongest.points}/${strongest.max}`],
    growth_areas: [`${weakest.name}: ${weakest.points}/${weakest.max}`]
  };
}
