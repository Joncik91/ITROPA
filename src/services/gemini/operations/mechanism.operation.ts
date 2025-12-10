import { geminiClient } from '../gemini-client';
import { buildMechanismFrameworks } from '../prompts/mechanism-prompts';
import { runFrameworkAnalysis } from '../../../utils/framework-analyzer';
import type { IndustryExpression, MechanismDetails } from '../../../types';

/**
 * Operations for extracting mechanisms
 */
export class MechanismOperation {
  /**
   * Extract mechanism analysis using 5 analytical frameworks
   */
  async extractMechanism(industry: IndustryExpression): Promise<MechanismDetails[]> {
    const frameworks = buildMechanismFrameworks(industry);

    // Generate all 5 mechanism analyses in parallel using shared utility
    return runFrameworkAnalysis<MechanismDetails>(
      frameworks,
      (prompt, maxTokens, retries) => geminiClient.callAPI(prompt, maxTokens, retries),
      { maxTokens: 3000 }
    );
  }
}
