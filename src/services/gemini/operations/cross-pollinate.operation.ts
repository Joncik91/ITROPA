import { geminiClient } from '../gemini-client';
import { buildCrossPollinatePrompt } from '../prompts/cross-pollinate-prompts';
import { normalizeExpressions } from '../../../utils/need-model';
import type { IndustryExpression } from '../../../types';

/**
 * Operations for cross-pollination
 */
export class CrossPollinateOperation {
  /** Cross-pollinate two industries to generate hybrid innovations. */
  async crossPollinate(a: IndustryExpression, b: IndustryExpression): Promise<IndustryExpression[]> {
    const results = normalizeExpressions(await geminiClient.callAPI(buildCrossPollinatePrompt(a, b), 4000));
    if (results.length === 0) throw new Error('The AI returned no hybrid industries.');
    return results;
  }
}
