import { geminiClient } from '../gemini-client';
import { buildChainFrameworks } from '../prompts/chain-prompts';
import { runFrameworkAnalysis } from '../../../utils/framework-analyzer';
import type { IndustryExpression } from '../../../types';

/**
 * Operations for inspiration chain analysis
 */
export class ChainOperation {
  /**
   * Analyze inspiration chain using 5 frameworks
   */
  async analyzeInspirationChain(expression: IndustryExpression, allExpressions: IndustryExpression[]): Promise<any[]> {
    const frameworks = buildChainFrameworks(expression, allExpressions);

    // Generate all 5 chain analyses in parallel using shared utility
    return runFrameworkAnalysis(
      frameworks,
      (prompt, maxTokens, retries) => geminiClient.callAPI(prompt, maxTokens, retries),
      { maxTokens: 3500 }
    );
  }
}
