import { geminiClient } from '../services/gemini/gemini-client';
import { buildGenerateNeedPrompt } from '../services/gemini/prompts/need-prompts';
import { DBService } from '../services/db/db.service';
import { hasPriorArt, normalizeNeed } from '../utils/need-model';
import type { Need } from '../types';
import { loadPriorArt, once } from './journey';
import { NEED_TOKENS } from './tokens';

type Listener = (text: string) => void;
const listeners = new Map<string, Set<Listener>>();
const latest = new Map<string, string>();

/** Tells the screen which step of how many the loading is on. Returns the current text if a load is already running. */
export function watchProgress(needName: string, fn: Listener): () => void {
  const set = listeners.get(needName) ?? new Set<Listener>();
  listeners.set(needName, set.add(fn));
  const current = latest.get(needName);
  if (current) fn(current);
  return () => { set.delete(fn); };
}

const report = (needName: string, text: string) => {
  latest.set(needName, text);
  listeners.get(needName)?.forEach((fn) => fn(text));
};

/**
 * The saved need when there is one (V1 or V2 made it, same table); otherwise one fresh call built
 * on the saved prior art. Nothing is saved unless the answer holds at least one future industry.
 */
export const loadNeed = (needName: string, description?: string): Promise<Need> =>
  once(`need:${needName}`, () => loadNeedOnce(needName, description));

async function loadNeedOnce(needName: string, description?: string): Promise<Need> {
  const saved = await DBService.findNeedByName(needName);
  if (saved) return saved;
  try {
    // The total is the number of calls actually needed: prior art is only fetched when it is not stored.
    const cached = await DBService.getSearchCache(needName);
    const total = cached && hasPriorArt(cached.priorArt) ? 1 : 2;
    if (total === 2) report(needName, 'Step 1 of 2: reading the field');
    const priorArt = await loadPriorArt(needName);
    report(needName, `Step ${total} of ${total}: imagining industries`);
    return await generate(needName, description, priorArt);
  } finally {
    latest.delete(needName);
  }
}

async function generate(needName: string, description: string | undefined, priorArt: Awaited<ReturnType<typeof loadPriorArt>>): Promise<Need> {
  const raw = await geminiClient.callAPI(buildGenerateNeedPrompt(needName, priorArt, description), NEED_TOKENS);
  // Saved under the typed name: the model may rename it, and the lookup above is by that name.
  const need = { ...normalizeNeed(raw, needName, priorArt), name: needName };
  await DBService.saveNeed(need);
  return need;
}
