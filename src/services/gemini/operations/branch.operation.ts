import { geminiClient } from '../gemini-client';
import { buildBranchIndustryPrompt } from '../prompts/branch-prompts';
import { normalizeExpressions } from '../../../utils/need-model';
import type { IndustryExpression } from '../../../types';

/**
 * Operations for branching industries
 */
export class BranchOperation {
  /** Generate sub-industries branching from a parent industry (fresh, unique IDs). */
  async branchIndustry(parent: IndustryExpression): Promise<IndustryExpression[]> {
    const children = normalizeExpressions(await geminiClient.callAPI(buildBranchIndustryPrompt(parent), 2500));
    if (children.length === 0) throw new Error('The AI returned no sub-industries.');
    return children;
  }
}
