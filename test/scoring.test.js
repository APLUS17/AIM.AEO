import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeScore, gradeBand } from '../lib/scoring.js';
import { validateInput } from '../lib/validate.js';

const base = {
  mentioned: true,
  recognition: 'specific',
  rank: 1,
  sentiment: 'very_positive',
  depth: 'high',
  source_quality: 'high',
  data_richness: 'high',
  category_role: 'leader',
  innovation: 'innovator',
  competitors: [],
  evidence: ''
};

const row = (promptKind, judgment, engineId = 'claude') => ({
  engineId,
  engineLabel: engineId,
  promptKind,
  judgment: { ...base, ...judgment }
});

test('perfect answers score 100', () => {
  const score = computeScore([row('discovery', {}), row('branded', {})], 'Acme');
  assert.equal(score.total, 100);
  assert.equal(score.band, 'Strong');
  assert.deepEqual(score.dimensions.map(d => d.points), [40, 20, 20, 10, 10]);
});

test('never mentioned scores 0', () => {
  const none = {
    mentioned: false, recognition: 'none', rank: 0, sentiment: 'neutral', depth: 'none',
    source_quality: 'none', data_richness: 'none', category_role: 'unknown', innovation: 'unknown',
    competitors: ['Globex', 'Initech']
  };
  const score = computeScore([row('discovery', none), row('branded', none)], 'Acme');
  assert.equal(score.total, 0);
  assert.equal(score.shareOfVoicePct, 0);
  assert.deepEqual(score.topCompetitors.map(c => c.name), ['Globex', 'Initech']);
});

test('share of voice counts each brand once per answer and ignores the target in competitors', () => {
  const score = computeScore(
    [row('discovery', { rank: 2, competitors: ['Globex', 'globex', 'Acme', 'Initech'] })],
    'Acme'
  );
  // Acme 1 of 3 distinct brands (Acme, Globex, Initech) = 33% -> min(0.33/0.25,1)*7 = 7, rank 2 bonus = 2
  assert.equal(score.shareOfVoicePct, 33);
  assert.equal(score.dimensions.find(d => d.id === 'share_of_voice').points, 9);
});

test('mention rate is reported per engine', () => {
  const score = computeScore(
    [row('branded', {}, 'chatgpt'), row('discovery', { mentioned: false }, 'chatgpt'), row('branded', {}, 'claude')],
    'Acme'
  );
  assert.deepEqual(score.engines.map(e => [e.id, e.mentionRate]), [['chatgpt', 50], ['claude', 100]]);
});

test('grade bands', () => {
  assert.equal(gradeBand(80), 'Strong');
  assert.equal(gradeBand(60), 'Solid');
  assert.equal(gradeBand(40), 'Needs work');
  assert.equal(gradeBand(39), 'At risk');
});

test('validation requires every field and a real email', () => {
  const bad = validateInput({ company: ' ', location: 'US', product: 'CRM', industry: 'Tech', email: 'nope' });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.company);
  assert.ok(bad.errors.email);

  const good = validateInput({ company: ' Acme ', location: 'US', product: 'CRM', industry: 'Tech', email: 'a@b.co' });
  assert.equal(good.ok, true);
  assert.equal(good.value.company, 'Acme');
});
