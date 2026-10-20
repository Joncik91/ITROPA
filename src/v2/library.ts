import { db, type DBNeed } from '../services/db/db-client';
import { getFutureExpressions, needKey } from '../utils/need-model';
import type { IndustryExpression } from '../types';
import { v2db } from './store';

/** One row of "Your research": what is stored for a need, by counting only. */
export interface LibraryRow {
  id: string;
  name: string;
  industries: number;
  understood: number;
  withConcepts: number;
  hasFieldRead: boolean;
  updatedAt?: number;
  /** Where tapping the row goes: Industries when it has industries (no call), else Field. */
  opensAt: 'industries' | 'field';
}

const ids = (list: IndustryExpression[]): string[] => list.flatMap((e) => [e.id, ...ids(e.children ?? [])]);

/** A damaged row (no eras) counts as having no industries instead of hiding the whole list. */
const safeIds = (n: DBNeed): string[] => {
  try { return ids(getFutureExpressions({ ...n, eras: n.eras ?? [] })); } catch { return []; }
};

interface Stored {
  needs: DBNeed[];
  mechanisms: { id: string; needId: string }[];
  deepDives: { id: string; needId: string }[];
  concepts: { id: string; needId: string; concepts?: unknown[] }[];
  fieldReadKeys: Set<string>;
}

/** Newest first; needs without a timestamp last. Two needs with the same name are one row: V2 opens a need by name and takes the one with the lowest id (findNeedByName), so the row describes that one. */
export function buildLibrary({ needs, mechanisms, deepDives, concepts, fieldReadKeys }: Stored): LibraryRow[] {
  const newestByName = new Map<string, DBNeed>();
  for (const n of needs) {
    if (typeof n.name !== 'string' || !n.name.trim()) continue;
    const key = needKey(n.name);
    const seen = newestByName.get(key);
    if (!seen || n.id < seen.id) newestByName.set(key, n);
  }
  const mech = new Set(mechanisms.map((m) => `${m.needId}\u0000${m.id}`));
  const dive = new Set(deepDives.map((d) => `${d.needId}\u0000${d.id}`));
  const conc = new Set(concepts.filter((c) => (c.concepts?.length ?? 0) > 0).map((c) => `${c.needId}\u0000${c.id}`));

  return [...newestByName.values()].map((n): LibraryRow => {
    const all = safeIds(n);
    const key = (id: string) => `${n.id}\u0000${id}`;
    return {
      id: n.id,
      name: n.name,
      industries: all.length,
      understood: all.filter((id) => mech.has(key(id)) && dive.has(key(id))).length,
      withConcepts: all.filter((id) => conc.has(key(id))).length,
      hasFieldRead: fieldReadKeys.has(needKey(n.name)),
      updatedAt: n.updatedAt,
      opensAt: all.length ? 'industries' : 'field',
    };
  }).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/** Reads the whole table, not the updatedAt index, so a need without a timestamp is still listed. */
export async function loadLibrary(): Promise<LibraryRow[]> {
  const [needs, mechanisms, deepDives, concepts, fieldReads] = await Promise.all([
    db.needs.toArray(), db.mechanisms.toArray(), db.deepDives.toArray(), db.appConcepts.toArray(), v2db.fieldReads.toArray(),
  ]);
  return buildLibrary({ needs, mechanisms, deepDives, concepts, fieldReadKeys: new Set(fieldReads.map((f) => f.key)) });
}
