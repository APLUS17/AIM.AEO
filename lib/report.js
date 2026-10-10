import { buildPrompts } from './prompts.js';
import { ENGINES, enginesWithKeys } from './engines.js';
import { judgeAnswer, summarizeReport } from './judge.js';
import { computeScore } from './scoring.js';
import { mockAnswer, mockJudge, mockSummary } from './mock.js';

const CONCURRENCY = 6;

// Live mode needs ANTHROPIC_API_KEY (Claude is also the judge). Without it, or with
// GRADER_MODE=mock, the pipeline runs on labelled sample data.
export function resolveMode(env) {
  if (env.GRADER_MODE === 'mock') return 'mock';
  return env.ANTHROPIC_API_KEY ? 'live' : 'mock';
}

async function runLimited(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      try {
        results[i] = { ok: true, value: await tasks[i]() };
      } catch (error) {
        results[i] = { ok: false, error };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// Runs every prompt on every available engine, grades each answer, and scores the brand.
export async function gradeBrand(input, env, log = console) {
  const mode = resolveMode(env);
  const engines = mode === 'mock' ? ENGINES : enginesWithKeys(env);
  const skippedEngines = ENGINES.filter(e => !engines.includes(e)).map(e => e.label);
  const runs = Math.min(Math.max(parseInt(env.RUNS_PER_PROMPT, 10) || 1, 1), 3);
  const prompts = buildPrompts(input);

  const jobs = [];
  for (const prompt of prompts) {
    for (const engine of engines) {
      for (let run = 0; run < runs; run++) {
        jobs.push({ prompt, engine, run });
      }
    }
  }

  const outcomes = await runLimited(
    jobs.map(({ prompt, engine }) => async () => {
      if (mode === 'mock') {
        return { answer: mockAnswer(input, prompt, engine), judgment: mockJudge(input, prompt, engine) };
      }
      const answer = await engine.ask(prompt.text, env);
      const judgment = await judgeAnswer({ input, prompt, engineLabel: engine.label, answer }, env);
      return { answer, judgment };
    }),
    CONCURRENCY
  );

  const results = [];
  const failures = [];
  outcomes.forEach((outcome, i) => {
    const { prompt, engine } = jobs[i];
    if (outcome.ok) {
      results.push({
        engineId: engine.id,
        engineLabel: engine.label,
        promptId: prompt.id,
        promptKind: prompt.kind,
        question: prompt.text,
        answer: outcome.value.answer,
        judgment: outcome.value.judgment
      });
    } else {
      failures.push({ engine: engine.label, prompt: prompt.id, error: String(outcome.error?.message ?? outcome.error) });
      log.error?.(`[grader] ${engine.label} / ${prompt.id} failed: ${outcome.error?.message ?? outcome.error}`);
    }
  });

  // Too many failures means the score would be misleading.
  if (results.length < Math.ceil(jobs.length / 2)) {
    const err = new Error(`Only ${results.length} of ${jobs.length} checks succeeded`);
    err.failures = failures;
    throw err;
  }

  const score = computeScore(results, input.company);

  let interpretation;
  if (mode === 'mock') {
    interpretation = mockSummary(input, score);
  } else {
    try {
      interpretation = await summarizeReport({ input, score }, env);
    } catch (error) {
      log.error?.(`[grader] summary failed: ${error.message}`);
      interpretation = mockSummary(input, score);
      interpretation.summary = `${input.company} scored ${score.total}/100 (${score.band}).`;
    }
  }

  return {
    mode,
    input,
    generatedAt: new Date().toISOString(),
    engines: engines.map(e => e.label),
    skippedEngines,
    checks: { attempted: jobs.length, succeeded: results.length },
    score,
    interpretation,
    results,
    failures
  };
}
