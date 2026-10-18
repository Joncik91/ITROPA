import { geminiClient } from '../gemini-client';
import { buildAppConceptPrompt } from '../prompts/app-concept-prompts';
import { normalizeAppConcepts } from '../../../utils/ai-normalizers';
import type { IndustryExpression, DeepDiveDetails, AppConcept } from '../../../types';

/**
 * Operations for generating app concepts
 */
export class AppConceptOperation {
  async generateConcepts(industry: IndustryExpression, deepDive?: DeepDiveDetails): Promise<AppConcept[]> {
    const concepts = normalizeAppConcepts(await geminiClient.callAPI(buildAppConceptPrompt(industry, deepDive), 5000));
    if (concepts.length === 0) throw new Error('The AI returned no app concepts.');
    return concepts;
  }
}
