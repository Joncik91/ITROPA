/**
 * Runs several analytical-framework prompts in parallel against the AI.
 * Concurrency is bounded by the API client; partial failures are tolerated,
 * total failure is reported as an error rather than an empty "success".
 */

import { normalizeFrameworkResults } from './ai-normalizers';

export interface FrameworkDefinition<T extends string = string> {
  /** Unique identifier for this framework */
  type: T;
  /** The prompt to send to the AI */
  prompt: string;
}

export interface FrameworkAnalysisOptions {
  /** Maximum tokens for AI response (default: 3000) */
  maxTokens?: number;
  /** Number of retry attempts (default: 1) */
  retries?: number;
}

export async function runFrameworkAnalysis<TResult, TType extends string = string>(
  frameworks: FrameworkDefinition<TType>[],
  apiCall: (prompt: string, maxTokens: number, retries: number) => Promise<unknown>,
  options: FrameworkAnalysisOptions = {}
): Promise<TResult[]> {
  const { maxTokens = 3000, retries = 1 } = options;

  const settled = await Promise.allSettled(frameworks.map(({ prompt }) => apiCall(prompt, maxTokens, retries)));

  const failures = settled.flatMap((r, i) => (r.status === 'rejected' ? [{ type: frameworks[i].type, error: r.reason }] : []));
  for (const f of failures) console.warn(`Framework "${f.type}" failed:`, f.error);

  const results = normalizeFrameworkResults<TResult>(
    settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])),
  );
  if (results.length === 0 && frameworks.length > 0) {
    const first = failures[0]?.error;
    throw first instanceof Error ? first : new Error('All analyses failed.');
  }
  return results;
}
