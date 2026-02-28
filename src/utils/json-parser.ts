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
 * Repair truncated JSON by closing any open structures.
 * Walks the string tracking brackets/braces and string state,
 * trims to the last complete value, then closes open structures.
 */
function repairTruncatedJSON(str: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let lastSafePos = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') {
      inString = !inString;
      if (!inString) lastSafePos = i + 1;
      continue;
    }
    if (inString) continue;
    if (ch === '{' || ch === '[') {
      stack.push(ch);
    } else if (ch === '}' || ch === ']') {
      stack.pop();
      lastSafePos = i + 1;
    }
  }

  if (stack.length === 0) return str;

  let result = str.substring(0, lastSafePos).trimEnd().replace(/,\s*$/, '');
  for (let i = stack.length - 1; i >= 0; i--) {
    result += stack[i] === '{' ? '}' : ']';
  }
  return result;
}

/**
 * Extract and parse JSON from AI-generated text responses.
 *
 * Handles:
 * - Markdown code blocks (```json ... ```)
 * - Text before/after JSON
 * - Trailing commas in arrays/objects
 * - Truncated responses (closes open brackets/braces)
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
    // Fix trailing commas before closing brackets/braces
    const fixedStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(fixedStr);
    } catch {
      // Try to repair truncated JSON
      try {
        const repairedStr = repairTruncatedJSON(fixedStr).replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(repairedStr);
      } catch {
        if (logErrors) {
          console.error("Failed to parse JSON:", jsonStr.substring(0, errorLogLimit));
        }
        throw new Error(`JSON Parse Error: ${e.message}`);
      }
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
