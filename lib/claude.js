import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5';
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const REQUEST_TIMEOUT_MS = 60_000;

export function getClaudeClient(apiKey) {
  return new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 2 });
}

// One Claude request with server-side refusal fallbacks turned on.
// If the account or model rejects the fallback beta (400), retry once without it.
// Returns the concatenated text of the response; throws on a refusal from the whole chain.
export async function claudeText(client, params) {
  let response;
  try {
    response = await client.beta.messages.create({
      ...params,
      betas: [FALLBACK_BETA],
      fallbacks: 'default'
    });
  } catch (err) {
    if (!(err instanceof Anthropic.BadRequestError)) throw err;
    response = await client.messages.create(params);
  }

  if (response.stop_reason === 'refusal') {
    const category = response.stop_details?.category ?? 'unknown';
    throw new Error(`Claude declined the request (category: ${category})`);
  }

  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

// Claude request constrained to a JSON schema; returns the parsed object.
export async function claudeJson(client, params, schema) {
  const text = await claudeText(client, {
    ...params,
    output_config: { ...(params.output_config ?? {}), format: { type: 'json_schema', schema } }
  });
  return JSON.parse(text);
}
