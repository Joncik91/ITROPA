import { geminiClient } from '../services/gemini/gemini-client';
import { buildFetchPriorArtPrompt } from '../services/gemini/prompts/need-prompts';
import { normalizePriorArt } from '../utils/need-model';
import type { PriorArt } from '../types';
import { PRIOR_ART_TOKENS } from './tokens';

export { PRIOR_ART_TOKENS };

export async function fetchPriorArt(needName: string, description?: string): Promise<PriorArt> {
  return normalizePriorArt(await geminiClient.callAPI(buildFetchPriorArtPrompt(needName, description), PRIOR_ART_TOKENS));
}
