/**
 * Common prompt utilities and constants used across all Gemini operations.
 * Implements DRY principle by centralizing repeated prompt patterns.
 */

/**
 * Standard JSON instruction used in all prompts to ensure valid JSON responses
 */
export const JSON_INSTRUCTION = 'Respond with ONLY valid JSON (no markdown, no explanation):';

/**
 * Alternative phrasing for JSON instruction (used in some prompts)
 */
export const JSON_ONLY = 'Respond with ONLY a JSON object (no explanation, no markdown):';

/**
 * Alternative phrasing for array responses
 */
export const JSON_ARRAY_ONLY = 'Respond with ONLY a JSON array (no explanation, no markdown):';

/**
 * Build a context section for user-provided descriptions
 */
export function buildContextSection(userDescription: string | undefined, needName: string, defaultInterpretation: string): string {
  if (userDescription) {
    return `USER PROVIDED CONTEXT: "${userDescription}"
Use this definition to understand what they mean by "${needName}".`;
  }
  return defaultInterpretation;
}

/**
 * Build a framework analysis prompt with consistent structure
 */
export function buildFrameworkPrompt(params: {
  frameworkType: string;
  frameworkName: string;
  targetName: string;
  frameworkDescription: string;
  responseSchema: string;
  additionalContext?: string;
}): string {
  const { frameworkType, frameworkName, targetName, frameworkDescription, responseSchema, additionalContext } = params;

  return `Analyze "${targetName}" using ${frameworkName} framework.
${frameworkDescription}
${additionalContext ? `\n${additionalContext}\n` : ''}
${JSON_INSTRUCTION}
{
  "analysisType": "${frameworkType}",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Highest-level pattern abstracted from this mechanism",
${responseSchema}
}`;
}
