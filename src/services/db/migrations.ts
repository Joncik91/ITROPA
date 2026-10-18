/**
 * v6 migration: make expression IDs globally unique.
 *
 * Before v6, expression IDs were echoed by the model ("1".."5", "1-1", "cross-1"), so every
 * need had an expression "1", and analyses cached under expression ID leaked across needs
 * (opening need B's "1" showed need A's mechanism). Mechanisms and deep dives were also
 * saved with needId = expression ID.
 *
 * Expressions are re-keyed to `${needId}/${oldId}` (suffixed on in-need duplicates), and each
 * cached analysis is re-attached to the expression whose old ID *and* name match. Records
 * that match nothing are kept as-is (orphans); no data is deleted.
 */

import type { IndustryExpression } from '../../types';

interface LegacyNeed {
  id: string;
  eras: Array<{ name: string; expressions: unknown[] }>;
}

interface ExprRef { newId: string; needId: string }

export interface IdMapping {
  /** `${oldId}\u0000${lowercased name}` → candidate new references (first need wins). */
  byOldIdAndName: Map<string, ExprRef[]>;
  /** oldId → candidate new references, for records that never stored a name. */
  byOldId: Map<string, ExprRef[]>;
}

const lookupKey = (oldId: string, name: string) => `${oldId}\u0000${name.toLowerCase().trim()}`;

function push<K>(map: Map<K, ExprRef[]>, key: K, ref: ExprRef) {
  const list = map.get(key);
  if (list) list.push(ref);
  else map.set(key, [ref]);
}

/** Rewrite expression IDs in-place on the provided needs and return the old→new mapping. */
export function rekeyNeedExpressions(needs: LegacyNeed[]): IdMapping {
  const mapping: IdMapping = { byOldIdAndName: new Map(), byOldId: new Map() };

  for (const need of needs) {
    const seen = new Map<string, number>();
    const walk = (list: IndustryExpression[]) => {
      for (const expr of list) {
        if (!expr || typeof expr !== 'object') continue;
        const oldId = String(expr.id ?? '');
        if (oldId.startsWith(`${need.id}/`) || oldId.startsWith('expr-')) {
          // Already unique (post-v6 data).
        } else {
          const count = seen.get(oldId) ?? 0;
          seen.set(oldId, count + 1);
          const newId = `${need.id}/${oldId}${count ? `#${count}` : ''}`;
          const ref = { newId, needId: need.id };
          push(mapping.byOldIdAndName, lookupKey(oldId, String(expr.name ?? '')), ref);
          push(mapping.byOldId, oldId, ref);
          expr.id = newId;
        }
        if (Array.isArray(expr.children)) walk(expr.children);
      }
    };
    for (const era of need.eras ?? []) {
      if (Array.isArray(era.expressions) && era.expressions.some((e) => e && typeof e === 'object')) {
        walk(era.expressions as IndustryExpression[]);
      }
    }
  }
  return mapping;
}

/** Resolve a legacy (expression ID, expression name) pair to its new reference. */
export function resolveExpression(mapping: IdMapping, oldId: string, name?: string, preferNeedId?: string): ExprRef | undefined {
  const candidates = name !== undefined
    ? mapping.byOldIdAndName.get(lookupKey(oldId, name))
    : mapping.byOldId.get(oldId);
  if (!candidates?.length) return undefined;
  return candidates.find((c) => c.needId === preferNeedId) ?? candidates[0];
}
