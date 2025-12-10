import { geminiClient } from '../gemini-client';
import { buildCrossPollinatePrompt } from '../prompts/cross-pollinate-prompts';
import type { IndustryExpression } from '../../../types';

/**
 * Operations for cross-pollination
 */
export class CrossPollinateOperation {
  /**
   * Cross-pollinate two industries to generate hybrid innovations
   */
  async crossPollinate(a: IndustryExpression, b: IndustryExpression): Promise<IndustryExpression[]> {
    const prompt = buildCrossPollinatePrompt(a, b);
    return geminiClient.callAPI(prompt, 4000);
  }
}
