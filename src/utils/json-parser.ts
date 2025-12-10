/**
 * Shared JSON parsing utility for AI-generated responses.
 * Handles common issues with AI output like markdown code blocks,
 * trailing commas, and extraneous text.
 */

export interface ParseOptions {
  /** Log errors to console (default: true) */
  logErrors?: boolean;
  /** Maximum characters to log on error (default: 500) */
  errorLogLimit?: number;
}

/**
 * Extract and parse JSON from AI-generated text responses.
 *
 * Handles:
 * - Markdown code blocks (```json ... ```)
 * - Text before/after JSON
 * - Trailing commas in arrays/objects
 *
 * @param text - Raw text response from AI
 * @param options - Parsing options
 * @returns Parsed JSON object or array
 * @throws Error with details if parsing fails
 */
export function extractJSON<T = any>(text: string, options: ParseOptions = {}): T {
  const { logErrors = true, errorLogLimit = 500 } = options;

  // Remove markdown code blocks
  let jsonStr = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  // Find the first and last braces/brackets
  const firstBrace = jsonStr.search(/[\[{]/);
  const lastBrace = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));

  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e: any) {
    // Try to fix common JSON issues
    // Remove trailing commas before closing brackets/braces
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(jsonStr);
    } catch (e2) {
      if (logErrors) {
        console.error("Failed to parse JSON:", jsonStr.substring(0, errorLogLimit));
      }
      throw new Error(`JSON Parse Error: ${e.message}`);
    }
  }
}

/**
 * Safely attempt to parse JSON, returning null on failure instead of throwing.
 *
 * @param text - Raw text response from AI
 * @param options - Parsing options
 * @returns Parsed JSON object/array or null if parsing fails
 */
export function tryExtractJSON<T = any>(text: string, options: ParseOptions = {}): T | null {
  try {
    return extractJSON<T>(text, { ...options, logErrors: false });
  } catch {
    return null;
  }
}
