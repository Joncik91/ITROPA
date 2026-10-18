import { geminiClient } from '../gemini-client';
import { buildDeepDivePrompt } from '../prompts/deep-dive-prompts';
import { normalizeDeepDive } from '../../../utils/ai-normalizers';
import type { IndustryExpression, DeepDiveDetails } from '../../../types';

/**
 * Operations for deep dive business analysis
 */
export class DeepDiveOperation {
  async deepDive(industry: IndustryExpression): Promise<DeepDiveDetails> {
    return normalizeDeepDive(await geminiClient.callAPI(buildDeepDivePrompt(industry), 3500));
  }
}
