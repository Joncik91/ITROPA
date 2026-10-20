import { geminiClient } from '../services/gemini/gemini-client';
import { buildGenerateNeedPrompt } from '../services/gemini/prompts/need-prompts';
import { DBService } from '../services/db/db.service';
import { normalizeNeed } from '../utils/need-model';
import type { Need } from '../types';
import { loadPriorArt, once } from './journey';
import { NEED_TOKENS } from './tokens';

/**
 * The saved need when there is one (V1 or V2 made it, same table); otherwise one fresh call built
 * on the saved prior art. Nothing is saved unless the answer holds at least one future industry.
 */
export const loadNeed = (needName: string, description?: string): Promise<Need> =>
  once(`need:${needName}`, () => loadNeedOnce(needName, description));

async function loadNeedOnce(needName: string, description?: string): Promise<Need> {
  const saved = await DBService.findNeedByName(needName);
  if (saved) return saved;
  const priorArt = await loadPriorArt(needName);
  const raw = await geminiClient.callAPI(buildGenerateNeedPrompt(needName, priorArt, description), NEED_TOKENS);
  // Saved under the typed name: the model may rename it, and the lookup above is by that name.
  const need = { ...normalizeNeed(raw, needName, priorArt), name: needName };
  await DBService.saveNeed(need);
  return need;
}
