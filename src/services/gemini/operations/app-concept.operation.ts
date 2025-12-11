import { geminiClient } from '../gemini-client';
import { buildAppConceptPrompt } from '../prompts/app-concept-prompts';
import type { IndustryExpression, DeepDiveDetails, AppConcept } from '../../../types';

/**
 * Operations for generating app concepts
 */
export class AppConceptOperation {
  /**
   * Generate app concepts for an industry
   */
  async generateConcepts(
    industry: IndustryExpression,
    deepDive?: DeepDiveDetails
  ): Promise<AppConcept[]> {
    const prompt = buildAppConceptPrompt(industry, deepDive);

    // Longer timeout for complex generation (5 seconds)
    const result = await geminiClient.callAPI(prompt, 5000);

    // Handle response format - may be wrapped in { concepts: [...] } or be array directly
    if (result && result.concepts && Array.isArray(result.concepts)) {
      return result.concepts;
    }

    if (Array.isArray(result)) {
      return result;
    }

    throw new Error('Invalid response format from app concept generation');
  }
}
