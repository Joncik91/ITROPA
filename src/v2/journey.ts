import { DBService } from '../services/db/db.service';
import { hasPriorArt } from '../utils/need-model';
import type { PriorArt } from '../types';
import { deleteFieldRead, getFieldRead, saveFieldRead } from './store';
import { runFieldRead, type FieldRead } from './field-read';
import { fetchPriorArt } from './prior-art';

const inflight = new Map<string, Promise<unknown>>();

/** Joins a call already running for the same key, so a double render (React StrictMode) pays once. */
function once<T>(key: string, run: () => Promise<T>): Promise<T> {
  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;
  const p = run().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** Saved prior art when there is any; otherwise one fresh call, saved only if it holds something. */
export const loadPriorArt = (needName: string, description?: string): Promise<PriorArt> =>
  once(`prior:${needName}:${description ?? ''}`, () => loadPriorArtOnce(needName, description));

async function loadPriorArtOnce(needName: string, description?: string): Promise<PriorArt> {
  if (!description) {
    const cached = await DBService.getSearchCache(needName);
    if (cached && hasPriorArt(cached.priorArt)) return cached.priorArt;
  }
  const priorArt = await fetchPriorArt(needName, description);
  if (!hasPriorArt(priorArt)) throw new Error('No prior art came back for this need. Try again, or add a few words about what you mean.');
  await DBService.saveSearchCache(needName, priorArt);
  // The field read was built from the old prior art; drop it so it is rebuilt from this one.
  await deleteFieldRead(needName);
  return priorArt;
}

/** Saved field read when there is one; otherwise one fresh call, saved only when usable. */
export const loadFieldRead = (needName: string, priorArt: PriorArt): Promise<FieldRead> =>
  once(`field:${needName}`, () => loadFieldReadOnce(needName, priorArt));

async function loadFieldReadOnce(needName: string, priorArt: PriorArt): Promise<FieldRead> {
  const cached = await getFieldRead(needName);
  if (cached) return cached;
  const fresh = await runFieldRead(needName, priorArt);
  await saveFieldRead(needName, fresh);
  return fresh;
}
