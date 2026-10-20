import { geminiClient } from '../gemini-client';
import { buildFetchPriorArtPrompt, buildGenerateNeedPrompt } from '../prompts/need-prompts';
import { normalizeNeed, normalizePriorArt } from '../../../utils/need-model';
import type { Need, PriorArt } from '../../../types';

/**
 * Operations for fetching prior art and generating needs
 */
export class NeedOperation {
  async fetchPriorArt(need: string, userDescription?: string): Promise<PriorArt> {
    const prompt = buildFetchPriorArtPrompt(need, userDescription);
    return normalizePriorArt(await geminiClient.callAPI(prompt, 6000));
  }

  /** Prior art is attached client-side rather than echoed back by the model (saves output tokens). */
  async generateNeed(needName: string, priorArt: PriorArt, userDescription?: string): Promise<Need> {
    const prompt = buildGenerateNeedPrompt(needName, priorArt, userDescription);
    return normalizeNeed(await geminiClient.callAPI(prompt, 6000), needName, priorArt);
  }
}
