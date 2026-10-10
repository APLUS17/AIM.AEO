// Turns per-answer judgments into the five scored dimensions (100 points total).
// Pure and deterministic: same judgments in, same score out.

const LEVEL_VALUE = { none: 0, low: 1 / 3, medium: 2 / 3, high: 1 };
const SENTIMENT_VALUE = { very_negative: 0, negative: 0.25, neutral: 0.5, positive: 0.75, very_positive: 1 };
const RECOGNITION_VALUE = { none: 0, vague: 0.5, specific: 1 };
const ROLE_POINTS = { leader: 6, challenger: 4, niche: 2, unknown: 0 };
const INNOVATION_POINTS = { innovator: 4, disruptor: 3, traditionalist: 1, unknown: 0 };
const RANK_BONUS = { 1: 3, 2: 2, 3: 1 };

// Share of category mentions that earns the full share-of-voice base points.
const FULL_SHARE = 0.25;

const mean = values => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const round1 = n => Math.round(n * 10) / 10;

function majority(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = 'unknown';
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

export function gradeBand(total) {
  if (total >= 80) return 'Strong';
  if (total >= 60) return 'Solid';
  if (total >= 40) return 'Needs work';
  return 'At risk';
}

// results: [{ engineId, engineLabel, promptKind: 'discovery'|'branded', judgment }]
export function computeScore(results, company = '') {
  const mentioned = results.filter(r => r.judgment.mentioned);
  const branded = results.filter(r => r.promptKind === 'branded');
  const discovery = results.filter(r => r.promptKind === 'discovery');

  // 1. Sentiment (40): tone across answers that mention the brand.
  const sentiment = mean(mentioned.map(r => SENTIMENT_VALUE[r.judgment.sentiment] ?? 0.5)) * 40;

  // 2. Presence quality (20): depth, source authority, data richness where mentioned.
  const presence =
    mean(
      mentioned.map(
        r =>
          (LEVEL_VALUE[r.judgment.depth] ?? 0) * 0.5 +
          (LEVEL_VALUE[r.judgment.source_quality] ?? 0) * 0.25 +
          (LEVEL_VALUE[r.judgment.data_richness] ?? 0) * 0.25
      )
    ) * 20;

  // 3. Brand recognition (20): how well each engine knows the brand when asked by name.
  const recognition = mean(branded.map(r => RECOGNITION_VALUE[r.judgment.recognition] ?? 0)) * 20;

  // 4. Share of voice (10): share of brand mentions in unbranded answers, plus a rank bonus.
  const target = company.trim().toLowerCase();
  let ownMentions = 0;
  let totalMentions = 0;
  for (const r of discovery) {
    const others = new Set(
      r.judgment.competitors.map(c => c.trim().toLowerCase()).filter(c => c && c !== target)
    );
    if (r.judgment.mentioned) ownMentions += 1;
    totalMentions += (r.judgment.mentioned ? 1 : 0) + others.size;
  }
  const share = totalMentions ? ownMentions / totalMentions : 0;
  const rankBonus = mean(
    discovery.map(r => (r.judgment.mentioned ? RANK_BONUS[r.judgment.rank] ?? 0 : 0))
  );
  const shareOfVoice = Math.min(share / FULL_SHARE, 1) * 7 + rankBonus;

  // 5. Market position (10): most common category role and innovation label.
  const role = majority(mentioned.map(r => r.judgment.category_role).filter(v => v !== 'unknown'));
  const innovation = majority(mentioned.map(r => r.judgment.innovation).filter(v => v !== 'unknown'));
  const market = ROLE_POINTS[role] + INNOVATION_POINTS[innovation];

  const dimensions = [
    { id: 'sentiment', name: 'Sentiment', points: round1(sentiment), max: 40 },
    { id: 'presence', name: 'Presence quality', points: round1(presence), max: 20 },
    { id: 'recognition', name: 'Brand recognition', points: round1(recognition), max: 20 },
    { id: 'share_of_voice', name: 'Share of voice', points: round1(shareOfVoice), max: 10 },
    { id: 'market', name: 'Market position', points: round1(market), max: 10 }
  ];
  const total = Math.round(dimensions.reduce((sum, d) => sum + d.points, 0));

  // Per-engine mention rate across all prompts.
  const engineIds = [...new Set(results.map(r => r.engineId))];
  const engines = engineIds.map(id => {
    const rows = results.filter(r => r.engineId === id);
    return {
      id,
      label: rows[0].engineLabel,
      mentionRate: Math.round((rows.filter(r => r.judgment.mentioned).length / rows.length) * 100)
    };
  });

  // Competitors most often named across all answers.
  const competitorCounts = new Map();
  for (const r of results) {
    for (const name of new Set(r.judgment.competitors.map(c => c.trim()).filter(Boolean))) {
      if (name.toLowerCase() === target) continue;
      competitorCounts.set(name, (competitorCounts.get(name) ?? 0) + 1);
    }
  }
  const topCompetitors = [...competitorCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([name, mentions]) => ({ name, mentions }));

  return {
    total,
    band: gradeBand(total),
    dimensions,
    engines,
    topCompetitors,
    shareOfVoicePct: Math.round(share * 100),
    categoryRole: role,
    innovation
  };
}
