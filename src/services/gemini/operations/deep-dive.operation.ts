import { geminiClient } from '../gemini-client';
import { buildDeepDivePrompt } from '../prompts/deep-dive-prompts';
import type { IndustryExpression, DeepDiveDetails } from '../../../types';

/**
 * Operations for deep dive business analysis
 */
export class DeepDiveOperation {
  /**
   * Perform deep dive business analysis for an industry
   */
  async deepDive(industry: IndustryExpression): Promise<DeepDiveDetails> {
    const prompt = buildDeepDivePrompt(industry);
    return geminiClient.callAPI(prompt, 3000);
  }
}
