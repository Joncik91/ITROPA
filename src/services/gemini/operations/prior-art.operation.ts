import { geminiClient } from '../gemini-client';
import { buildPriorArtFrameworks } from '../prompts/prior-art-prompts';
import { runFrameworkAnalysis } from '../../../utils/framework-analyzer';

/**
 * Operations for prior art analysis
 */
export class PriorArtOperation {
  /**
   * Analyze prior art using 5 strategic frameworks
   */
  async analyzePriorArt(needName: string, priorArt: any): Promise<any[]> {
    const frameworks = buildPriorArtFrameworks(needName, priorArt);

    // Generate all 5 prior art analyses in parallel using shared utility
    return runFrameworkAnalysis(
      frameworks,
      (prompt, maxTokens, retries) => geminiClient.callAPI(prompt, maxTokens, retries),
      { maxTokens: 3500 }
    );
  }
}
