import { geminiClient } from '../gemini-client';
import { buildPatternFrameworks } from '../prompts/pattern-prompts';
import { runFrameworkAnalysis } from '../../../utils/framework-analyzer';

/**
 * Operations for pattern analysis
 */
export class PatternOperation {
  /**
   * Analyze patterns across multiple needs using 5 frameworks
   */
  async analyzePatterns(
    patternName: string,
    mechanisms: Array<{
      expressionName: string;
      needName: string;
      coreMechanism: string;
    }>
  ): Promise<any[]> {
    const frameworks = buildPatternFrameworks(patternName, mechanisms);

    // Generate all 5 pattern analyses in parallel using shared utility
    return runFrameworkAnalysis(
      frameworks,
      (prompt, maxTokens, retries) => geminiClient.callAPI(prompt, maxTokens, retries),
      { maxTokens: 3500 }
    );
  }
}
