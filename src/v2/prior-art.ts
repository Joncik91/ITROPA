import { geminiClient } from '../services/gemini/gemini-client';
import { buildFetchPriorArtPrompt } from '../services/gemini/prompts/need-prompts';
import { normalizePriorArt } from '../utils/need-model';
import type { PriorArt } from '../types';

/**
 * Four categories of 3-4 detailed items need about 3.5k output tokens or more; the V1 call asks
 * for 3000 and the model's answer is cut off mid-JSON (measured 20 Oct 2026 against the live API).
 */
export const PRIOR_ART_TOKENS = 6000;

export async function fetchPriorArt(needName: string, description?: string): Promise<PriorArt> {
  return normalizePriorArt(await geminiClient.callAPI(buildFetchPriorArtPrompt(needName, description), PRIOR_ART_TOKENS));
}
