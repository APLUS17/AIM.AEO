import { claudeText, getClaudeClient, DEFAULT_CLAUDE_MODEL } from './claude.js';

const REQUEST_TIMEOUT_MS = 60_000;

// Plain instruction shared by every engine, so answers are comparable.
const SYSTEM_PROMPT =
  'You are a helpful assistant answering a buyer who is researching products and companies. ' +
  'Answer the way you normally would for a member of the public, naming specific companies where relevant.';

// Each engine: { id, label, keyEnv, ask(prompt, env) => { text, citations } }
export const ENGINES = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    keyEnv: 'OPENAI_API_KEY',
    ask: (prompt, env) =>
      chatCompletion({
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL || 'gpt-5-mini',
        prompt
      })
  },
  {
    id: 'claude',
    label: 'Claude',
    keyEnv: 'ANTHROPIC_API_KEY',
    ask: async (prompt, env) => {
      const client = getClaudeClient(env.ANTHROPIC_API_KEY);
      const text = await claudeText(client, {
        model: env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
        max_tokens: 4000,
        output_config: { effort: 'low' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      });
      return { text, citations: [] };
    }
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    keyEnv: 'PERPLEXITY_API_KEY',
    ask: (prompt, env) =>
      chatCompletion({
        url: 'https://api.perplexity.ai/chat/completions',
        apiKey: env.PERPLEXITY_API_KEY,
        model: env.PERPLEXITY_MODEL || 'sonar',
        prompt
      })
  }
];

export function enginesWithKeys(env) {
  return ENGINES.filter(engine => Boolean(env[engine.keyEnv]));
}

// OpenAI and Perplexity share the Chat Completions request/response shape.
async function chatCompletion({ url, apiKey, model, prompt }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`${url} returned ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  // Perplexity returns cited URLs as `citations` (older) and/or `search_results` (newer).
  const citations = [
    ...(Array.isArray(data.citations) ? data.citations : []),
    ...(Array.isArray(data.search_results) ? data.search_results.map(r => r.url).filter(Boolean) : [])
  ];
  return { text, citations: [...new Set(citations)] };
}
