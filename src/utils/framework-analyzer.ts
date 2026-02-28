/**
 * Generic framework analyzer for running multiple analytical frameworks in parallel.
 * Follows Open/Closed Principle - extend by adding new framework definitions, not modifying code.
 */

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
  /** Custom error handler */
  onError?: (type: string, error: Error) => void;
}

/**
 * Run multiple analytical frameworks in parallel against an AI API.
 *
 * @param frameworks - Array of framework definitions with type and prompt
 * @param apiCall - Function to call the AI API
 * @param options - Configuration options
 * @returns Array of successful analysis results (failures are filtered out)
 *
 * @example
 * ```ts
 * const results = await runFrameworkAnalysis(
 *   [
 *     { type: 'functional', prompt: '...' },
 *     { type: 'structural', prompt: '...' },
 *   ],
 *   (prompt, maxTokens) => apiClient.callGemini(prompt, maxTokens),
 *   { maxTokens: 3000 }
 * );
 * ```
 */
export async function runFrameworkAnalysis<TResult, TType extends string = string>(
  frameworks: FrameworkDefinition<TType>[],
  apiCall: (prompt: string, maxTokens: number, retries: number) => Promise<TResult>,
  options: FrameworkAnalysisOptions = {}
): Promise<TResult[]> {
  const {
    maxTokens = 3000,
    retries = 1,
    onError = (type, err) => console.error(`Failed to generate ${type} analysis:`, err)
  } = options;

  const analyses = await Promise.all(
    frameworks.map(({ type, prompt }) =>
      apiCall(prompt, maxTokens, retries).catch((err: Error) => {
        onError(type, err);
        return null;
      })
    )
  );

  return analyses.filter((analysis) => analysis !== null) as TResult[];
}

/**
 * Create a framework definition with type inference.
 * Helper function for better TypeScript support when defining frameworks.
 */
export function defineFramework<T extends string>(
  type: T,
  prompt: string
): FrameworkDefinition<T> {
  return { type, prompt };
}

/**
 * Builder class for constructing framework analyses with fluent API.
 * Useful when dynamically building framework definitions.
 */
export class FrameworkAnalysisBuilder<TResult> {
  private frameworks: FrameworkDefinition[] = [];
  private options: FrameworkAnalysisOptions = {};

  addFramework(type: string, prompt: string): this {
    this.frameworks.push({ type, prompt });
    return this;
  }

  withMaxTokens(maxTokens: number): this {
    this.options.maxTokens = maxTokens;
    return this;
  }

  withRetries(retries: number): this {
    this.options.retries = retries;
    return this;
  }

  withErrorHandler(handler: (type: string, error: Error) => void): this {
    this.options.onError = handler;
    return this;
  }

  async execute(
    apiCall: (prompt: string, maxTokens: number, retries: number) => Promise<TResult>
  ): Promise<TResult[]> {
    return runFrameworkAnalysis<TResult>(this.frameworks, apiCall, this.options);
  }
}
