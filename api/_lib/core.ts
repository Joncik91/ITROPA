/**
 * Framework-agnostic request handling shared by the Vercel functions in /api
 * and the Vite dev-server middleware (vite-plugin-dev-api.ts).
 *
 * Files under api/_lib are not exposed as routes by Vercel (underscore prefix).
 */
import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai';

export interface CoreRequest {
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface CoreResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string | string[]>;
}

const json = (status: number, body: unknown, headers?: CoreResponse['headers']): CoreResponse => ({ status, body, headers });

// ============ GENERATION ============

export const LIMITS = {
  maxPromptChars: 60_000,
  minTokens: 256,
  maxTokens: 8192,
  minTemperature: 0,
  maxTemperature: 1.5,
} as const;

export interface GenerateParams {
  prompt: string;
  maxTokens: number;
  temperature: number;
}

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function validateGenerateBody(body: unknown, defaultTemperature: number): Validation<GenerateParams> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Request body must be a JSON object' };
  const { prompt, maxTokens, temperature } = body as Record<string, unknown>;

  if (typeof prompt !== 'string' || !prompt.trim()) return { ok: false, error: 'Prompt is required' };
  if (prompt.length > LIMITS.maxPromptChars) {
    return { ok: false, error: `Prompt exceeds ${LIMITS.maxPromptChars} characters` };
  }

  const tokens = typeof maxTokens === 'number' && Number.isFinite(maxTokens) ? maxTokens : 4000;
  const temp = typeof temperature === 'number' && Number.isFinite(temperature) ? temperature : defaultTemperature;

  return {
    ok: true,
    value: {
      prompt,
      maxTokens: Math.round(clamp(tokens, LIMITS.minTokens, LIMITS.maxTokens)),
      temperature: clamp(temp, LIMITS.minTemperature, LIMITS.maxTemperature),
    },
  };
}

const UPSTREAM_TIMEOUT_MS = 55_000;

export type Provider = 'gemini' | 'anthropic';

/** AI_PROVIDER wins; otherwise Anthropic, unless only a Gemini key is configured. */
export function providerName(): Provider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === 'gemini' || explicit === 'anthropic') return explicit;
  if (!process.env.ANTHROPIC_API_KEY?.trim() && process.env.GEMINI_API_KEY?.trim()) return 'gemini';
  return 'anthropic';
}

export function modelName(): string {
  if (providerName() === 'anthropic') return process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-5-5';
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
}

/**
 * Gemini models support native JSON output; Gemma does not. 2.5-series models also spend
 * "thinking" tokens out of maxOutputTokens, which truncated responses mid-JSON — disable it.
 */
function generationConfigFor(model: string, params: GenerateParams): GenerationConfig {
  const config: GenerationConfig & { thinkingConfig?: { thinkingBudget: number } } = {
    maxOutputTokens: params.maxTokens,
    temperature: params.temperature,
  };
  if (model.startsWith('gemini-')) config.responseMimeType = 'application/json';
  if (/^gemini-2\.5-flash/.test(model)) config.thinkingConfig = { thinkingBudget: 0 };
  return config;
}

interface GenerateResult {
  text: string;
  truncated: boolean;
}

async function generateWithGemini(apiKey: string, model: string, params: GenerateParams): Promise<GenerateResult> {
  const client = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model }, { timeout: UPSTREAM_TIMEOUT_MS });
  const result = await client.generateContent({
    contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
    generationConfig: generationConfigFor(model, params),
  });
  const response = result.response;
  return { text: response.text(), truncated: response.candidates?.[0]?.finishReason === 'MAX_TOKENS' };
}

/** Anthropic Messages API over fetch (no SDK dependency). Temperature is capped at 1.0 by the API. */
async function generateWithAnthropic(apiKey: string, model: string, params: GenerateParams): Promise<GenerateResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: params.maxTokens,
      temperature: Math.min(params.temperature, 1),
      messages: [{ role: 'user', content: params.prompt }],
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => ({}))) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
    error?: { type?: string; message?: string };
  };
  if (!res.ok) {
    const err = new Error(data.error?.message || `Anthropic API error ${res.status}`) as Error & { status?: number; type?: string };
    err.status = res.status;
    err.type = data.error?.type;
    throw err;
  }
  const text = (data.content ?? []).map((b) => (b.type === 'text' ? b.text ?? '' : '')).join('');
  return { text, truncated: data.stop_reason === 'max_tokens' };
}

function classifyUpstreamError(error: unknown): CoreResponse {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;

  if (status === 429 || status === 529 || /quota|rate.?limit|overloaded|resource.?exhausted|\b429\b/i.test(message)) {
    return json(429, { error: 'AI quota exceeded. Wait a minute and retry.', code: 'quota' }, { 'Retry-After': '30' });
  }
  if (error instanceof Error && (error.name === 'AbortError' || /timed? ?out|aborted/i.test(message))) {
    return json(504, { error: 'The AI model took too long to respond.', code: 'timeout' });
  }
  if (status === 401 || status === 403 || /API[_ ]?KEY|api key not valid|permission denied|authentication/i.test(message)) {
    const keyVar = providerName() === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY';
    return json(500, { error: `The server's AI API key was rejected. Check ${keyVar}.`, code: 'config' });
  }
  if (status === 404 || /models\/.*not found|is not found|not_found/i.test(message)) {
    return json(502, { error: `Model "${modelName()}" is not available.`, code: 'model' });
  }
  if (/SAFETY|blocked|refus/i.test(message)) {
    return json(422, { error: 'The AI declined to answer this prompt.', code: 'blocked' });
  }
  return json(502, { error: 'The AI provider returned an error.', code: 'upstream' });
}

export async function handleGenerate(req: CoreRequest, defaultTemperature: number): Promise<CoreResponse> {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });

  const provider = providerName();
  const keyVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY';
  const apiKey = process.env[keyVar]?.trim();
  if (!apiKey) return json(500, { error: `${keyVar} is not configured on the server`, code: 'config' });

  const parsed = validateGenerateBody(req.body, defaultTemperature);
  if (!parsed.ok) return json(400, { error: parsed.error, code: 'invalid' });

  const model = modelName();
  try {
    const { text, truncated } = await (provider === 'anthropic' ? generateWithAnthropic : generateWithGemini)(apiKey, model, parsed.value);
    if (!text.trim()) return json(502, { error: 'The AI returned an empty response.', code: 'empty' });
    return json(200, { text, truncated });
  } catch (error) {
    console.error(`[${provider}] upstream error:`, error);
    return classifyUpstreamError(error);
  }
}
