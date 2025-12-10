import { geminiClient } from '../gemini-client';
import { buildFetchPriorArtPrompt, buildGenerateNeedPrompt } from '../prompts/need-prompts';
import type { Need, PriorArt } from '../../../types';

/**
 * Operations for fetching prior art and generating needs
 */
export class NeedOperation {
  /**
   * Fetch prior art for a given need
   */
  async fetchPriorArt(need: string, userDescription?: string): Promise<PriorArt> {
    const prompt = buildFetchPriorArtPrompt(need, userDescription);
    return geminiClient.callAPI(prompt, 3000);
  }

  /**
   * Generate a complete need with future predictions
   */
  async generateNeed(needName: string, priorArt: PriorArt, userDescription?: string): Promise<Need> {
    const prompt = buildGenerateNeedPrompt(needName, priorArt, userDescription);
    return geminiClient.callAPI(prompt, 6000);
  }
}
