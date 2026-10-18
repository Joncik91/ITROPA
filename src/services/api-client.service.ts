/**
 * Client for the server-side AI endpoints (/api/gemini, /api/ai-assistant).
 *
 * - The Gemini key never reaches the browser; the same endpoints are served by
 *   Vercel in production and by the Vite dev middleware locally.
 * - Requests are capped in flight so 5-framework fan-outs don't trip rate limits.
 * - Only transient failures (network, 429, 5xx) are retried, with jittered backoff.
 */

import { extractJSON } from '../utils/json-parser';

export type ApiErrorCode =
  | 'quota' | 'timeout' | 'network' | 'invalid' | 'config'
  | 'model' | 'blocked' | 'empty' | 'parse' | 'upstream' | 'unknown';

export class ApiError extends Error {
  constructor(message: string, readonly code: ApiErrorCode, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }

  get retryable(): boolean {
    return ['quota', 'timeout', 'network', 'upstream', 'empty', 'parse'].includes(this.code);
  }
}

const REQUEST_TIMEOUT_MS = 70_000;
const MAX_CONCURRENT = 4;

// ============ Concurrency limiter ============

let active = 0;
const waiting: Array<() => void> = [];

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    // The releasing task hands its slot over directly, so `active` never dips below
    // the cap in between and a newcomer cannot jump the queue.
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    active++;
  }
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function backoffDelay(attempt: number, error: ApiError): number {
  const base = error.code === 'quota' ? 8000 : 1500;
  return base * 2 ** attempt + Math.random() * 500;
}

async function postOnce(endpoint: string, body: object): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // The timeout covers the whole exchange, including a body that stalls mid-stream.
  let response: Response;
  let payload: { text?: unknown; error?: unknown; code?: unknown } = {};
  try {
    response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const raw = await response.text();
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      /* Error pages from proxies/CDNs may not be JSON; the status below still applies. */
    }
  } catch {
    if (controller.signal.aborted) throw new ApiError('The request timed out.', 'timeout');
    throw new ApiError('Network error — check your connection.', 'network');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : `Request failed (HTTP ${response.status})`;
    const code: ApiErrorCode =
      typeof payload.code === 'string' ? (payload.code as ApiErrorCode)
      : response.status === 429 ? 'quota'
      : response.status === 504 ? 'timeout'
      : response.status >= 500 ? 'upstream'
      : 'unknown';
    throw new ApiError(message, code, response.status);
  }

  if (typeof payload.text !== 'string' || !payload.text.trim()) {
    throw new ApiError('The AI returned an empty response.', 'empty', response.status);
  }
  return payload.text;
}

export interface CallOptions {
  maxTokens?: number;
  retries?: number;
}

async function call<T>(endpoint: string, prompt: string, temperature: number, opts: CallOptions = {}): Promise<T> {
  const { maxTokens = 4000, retries = 1 } = opts;

  for (let attempt = 0; ; attempt++) {
    try {
      const text = await withSlot(() => postOnce(endpoint, { prompt, maxTokens, temperature }));
      try {
        return extractJSON<T>(text);
      } catch (e) {
        throw new ApiError(`The AI returned malformed JSON (${(e as Error).message}).`, 'parse');
      }
    } catch (e) {
      const error = e instanceof ApiError ? e : new ApiError(String((e as Error)?.message ?? e), 'unknown');
      if (!error.retryable || attempt >= retries) throw error;
      await sleep(backoffDelay(attempt, error));
    }
  }
}

export const apiClient = {
  /** Main content generation. Returns parsed JSON. */
  callGemini<T = unknown>(prompt: string, maxTokens = 4000, retries = 1): Promise<T> {
    return call<T>('gemini', prompt, 0.9, { maxTokens, retries });
  },

  /** Assistant suggestions. Returns parsed JSON. */
  callAIAssistant<T = unknown>(prompt: string, maxTokens = 3000, retries = 1): Promise<T> {
    return call<T>('ai-assistant', prompt, 0.7, { maxTokens, retries });
  },
};
