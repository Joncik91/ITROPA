/**
 * Framework-agnostic request handling shared by the Vercel functions in /api
 * and the Vite dev-server middleware (vite-plugin-dev-api.ts).
 *
 * Files under api/_lib are not exposed as routes by Vercel (underscore prefix).
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
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

// ============ AUTH ============

export const SESSION_COOKIE = 'itropa_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function appPassword(): string | undefined {
  const pw = process.env.APP_PASSWORD?.trim();
  return pw ? pw : undefined;
}

/** Signing key is derived from the password, so changing the password revokes every session. */
function sign(payload: string, password: string): string {
  return createHmac('sha256', `itropa-session:${password}`).update(payload).digest('base64url');
}

/** Constant-time string comparison; hashing first equalises lengths so length is not leaked. */
function safeEqual(a: string, b: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function createSessionToken(password: string, now = Date.now()): string {
  const exp = String(Math.floor(now / 1000) + SESSION_TTL_SECONDS);
  return `${exp}.${sign(exp, password)}`;
}

export function verifySessionToken(token: string | undefined, password: string, now = Date.now()): boolean {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < now) return false;
  return safeEqual(sig, sign(exp, password));
}

function headerValue(headers: CoreRequest['headers'], name: string): string | undefined {
  const v = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

export function readCookie(headers: CoreRequest['headers'], name: string): string | undefined {
  const raw = headerValue(headers, 'cookie');
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

function isSecureRequest(headers: CoreRequest['headers']): boolean {
  return headerValue(headers, 'x-forwarded-proto') === 'https';
}

function sessionCookie(value: string, maxAge: number, secure: boolean): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function isAuthorized(req: CoreRequest): boolean {
  const password = appPassword();
  if (!password) return true;
  return verifySessionToken(readCookie(req.headers, SESSION_COOKIE), password);
}

export function handleAuth(req: CoreRequest): CoreResponse {
  const password = appPassword();

  if (req.method === 'GET') {
    return json(200, { required: !!password, authenticated: isAuthorized(req) });
  }

  if (req.method === 'DELETE') {
    return json(200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0, isSecureRequest(req.headers)) });
  }

  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, { Allow: 'GET, POST, DELETE' });

  if (!password) return json(200, { ok: true });

  const submitted = typeof (req.body as { password?: unknown } | null)?.password === 'string'
    ? ((req.body as { password: string }).password).trim()
    : '';
  if (!submitted || !safeEqual(submitted, password)) {
    return json(401, { error: 'Invalid password' });
  }

  const token = createSessionToken(password);
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie(token, SESSION_TTL_SECONDS, isSecureRequest(req.headers)) });
}

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

export function modelName(): string {
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

function classifyUpstreamError(error: unknown): CoreResponse {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;

  if (status === 429 || /quota|rate.?limit|resource.?exhausted|\b429\b/i.test(message)) {
    return json(429, { error: 'AI quota exceeded. Wait a minute and retry.', code: 'quota' }, { 'Retry-After': '30' });
  }
  if (error instanceof Error && (error.name === 'AbortError' || /timed? ?out|aborted/i.test(message))) {
    return json(504, { error: 'The AI model took too long to respond.', code: 'timeout' });
  }
  if (/API[_ ]?KEY|api key not valid|permission denied/i.test(message)) {
    return json(500, { error: 'The server\'s Gemini API key was rejected. Check GEMINI_API_KEY.', code: 'config' });
  }
  if (status === 404 || /models\/.*not found|is not found/i.test(message)) {
    return json(502, { error: `Model "${modelName()}" is not available.`, code: 'model' });
  }
  if (/SAFETY|blocked/i.test(message)) {
    return json(422, { error: 'The AI declined to answer this prompt.', code: 'blocked' });
  }
  return json(502, { error: 'The AI provider returned an error.', code: 'upstream' });
}

export async function handleGenerate(req: CoreRequest, defaultTemperature: number): Promise<CoreResponse> {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });
  if (!isAuthorized(req)) return json(401, { error: 'Authentication required', code: 'auth' });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return json(500, { error: 'GEMINI_API_KEY is not configured on the server', code: 'config' });

  const parsed = validateGenerateBody(req.body, defaultTemperature);
  if (!parsed.ok) return json(400, { error: parsed.error, code: 'invalid' });

  const model = modelName();
  try {
    const client = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model }, { timeout: UPSTREAM_TIMEOUT_MS });
    const result = await client.generateContent({
      contents: [{ role: 'user', parts: [{ text: parsed.value.prompt }] }],
      generationConfig: generationConfigFor(model, parsed.value),
    });
    const response = result.response;
    const text = response.text();
    if (!text.trim()) return json(502, { error: 'The AI returned an empty response.', code: 'empty' });

    const finishReason = response.candidates?.[0]?.finishReason;
    return json(200, { text, truncated: finishReason === 'MAX_TOKENS' });
  } catch (error) {
    console.error('[gemini] upstream error:', error);
    return classifyUpstreamError(error);
  }
}
