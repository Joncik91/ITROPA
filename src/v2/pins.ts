import { db } from '../services/db/db-client';
import { needKey } from '../utils/need-model';
import { v2db } from './store';

/** A saved industry or app idea. It keeps a short copy of its text; the copy is not refreshed if the industry changes later. */
export interface PinRecord {
  key: string;
  kind: 'industry' | 'concept';
  needName: string;
  industryId: string;
  label: string;
  text: string;
  createdAt: number;
}

export type NewPin = Omit<PinRecord, 'key' | 'createdAt'> & { conceptName?: string };

/** industry pins are keyed by industry id, concept pins by industry id plus concept name. */
export const pinKey = (p: Pick<NewPin, 'kind' | 'needName' | 'industryId' | 'conceptName'>): string =>
  [p.kind, needKey(p.needName), p.industryId, p.kind === 'concept' ? p.conceptName ?? '' : ''].join('\u0000');

export const isPinned = async (key: string): Promise<boolean> => !!(await v2db.pins.get(key));

/** Adds the pin, or removes it when already there. Returns whether it is pinned afterwards. */
export function togglePin(p: NewPin): Promise<boolean> {
  const key = pinKey(p);
  const { conceptName: _c, ...rest } = p;
  // One transaction, so two quick taps cancel out instead of both reading "not pinned".
  return v2db.transaction('rw', v2db.pins, async () => {
    if (await v2db.pins.get(key)) {
      await v2db.pins.delete(key);
      return false;
    }
    await v2db.pins.put({ ...rest, key, text: p.text.slice(0, 280), createdAt: Date.now() });
    return true;
  });
}

/** Newest first; a pin whose need is no longer saved is left out instead of failing. */
export const livePins = (pins: PinRecord[], savedNeedNames: string[]): PinRecord[] => {
  const saved = new Set(savedNeedNames.filter((n) => typeof n === 'string').map(needKey));
  return pins.filter((p) => saved.has(needKey(p.needName))).sort((a, b) => b.createdAt - a.createdAt);
};

export async function loadPins(): Promise<PinRecord[]> {
  const [pins, needs] = await Promise.all([v2db.pins.toArray(), db.needs.toArray()]);
  return livePins(pins, needs.map((n) => n.name));
}
