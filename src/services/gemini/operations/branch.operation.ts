import { geminiClient } from '../gemini-client';
import { buildBranchIndustryPrompt } from '../prompts/branch-prompts';
import type { IndustryExpression } from '../../../types';

/**
 * Operations for branching industries
 */
export class BranchOperation {
  /**
   * Generate sub-industries branching from a parent industry
   */
  async branchIndustry(parent: IndustryExpression): Promise<IndustryExpression[]> {
    const prompt = buildBranchIndustryPrompt(parent);
    return geminiClient.callAPI(prompt, 2500);
  }
}
