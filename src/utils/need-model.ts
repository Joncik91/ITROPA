/**
 * Normalization of AI-generated domain objects.
 *
 * The model's JSON is untrusted: fields go missing, arrays come back as strings, and
 * the IDs it echoes ("1", "2", "parent-1") collide across needs and across repeated
 * branches. Every AI result passes through here before entering state or storage, so
 * IDs are always client-assigned and globally unique and shapes are guaranteed.
 */

import type { Era, IndustryExpression, Inspiration, Need, PriorArt, PriorArtItem } from '../types';

export function newId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : fallback;

export const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean)
  : typeof v === 'string' && v.trim() ? [v.trim()]
  : [];

const score = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : undefined;
};

/** Unwrap `{ items: [...] }`-style envelopes the model sometimes adds around arrays. */
export function unwrapArray(value: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(value)) return value;
  if (isObject(value)) {
    for (const key of keys) if (Array.isArray(value[key])) return value[key] as unknown[];
    const firstArray = Object.values(value).find(Array.isArray);
    if (firstArray) return firstArray as unknown[];
  }
  return [];
}

function normalizeInspiration(raw: unknown): Inspiration | null {
  if (!isObject(raw)) return null;
  const source = str(raw.source);
  const mechanism = str(raw.mechanism);
  if (!source && !mechanism) return null;
  return { source, mechanism, twist: str(raw.twist) || undefined };
}

/**
 * Normalize one expression and its subtree. IDs from the model are discarded.
 * Returns null for entries without a usable name.
 */
export function normalizeExpression(raw: unknown, depth = 0): IndustryExpression | null {
  if (!isObject(raw)) return null;
  const name = str(raw.name);
  if (!name) return null;

  const expr: IndustryExpression = {
    id: newId('expr'),
    type: 'future',
    name,
    mutation: str(raw.mutation),
    insight: str(raw.insight),
    inspirations: arr(raw.inspirations).map(normalizeInspiration).filter((i): i is Inspiration => !!i),
    children: depth < 12 ? normalizeExpressions(raw.children, depth + 1) : [],
  };

  const combinationType = str(raw.combinationType);
  if (combinationType) expr.combinationType = combinationType;
  const synergy = score(raw.synergyScore);
  if (synergy !== undefined) expr.synergyScore = synergy;
  const novelty = score(raw.noveltyFactor);
  if (novelty !== undefined) expr.noveltyFactor = novelty;
  const marketFit = str(raw.marketFit);
  if (marketFit) expr.marketFit = marketFit;
  const challenges = strArr(raw.challenges);
  if (challenges.length) expr.challenges = challenges;

  return expr;
}

export function normalizeExpressions(raw: unknown, depth = 0): IndustryExpression[] {
  return unwrapArray(raw, 'expressions', 'industries', 'children', 'results')
    .map((r) => normalizeExpression(r, depth))
    .filter((e): e is IndustryExpression => !!e);
}

function normalizePriorArtItems(raw: unknown): PriorArtItem[] {
  return arr(raw).flatMap((item) => {
    if (!isObject(item)) return [];
    const name = str(item.name);
    if (!name) return [];
    const out: PriorArtItem = { name, mechanism: str(item.mechanism) };
    for (const key of ['domain', 'limitation', 'era', 'lesson', 'originalDomain', 'transferPotential', 'biomimicryPotential'] as const) {
      const v = str(item[key]);
      if (v) out[key] = v;
    }
    return [out];
  });
}

export function normalizePriorArt(raw: unknown): PriorArt {
  const src = isObject(raw) ? raw : {};
  return {
    currentLeaders: normalizePriorArtItems(src.currentLeaders),
    historicalPrecedents: normalizePriorArtItems(src.historicalPrecedents),
    adjacentDomains: normalizePriorArtItems(src.adjacentDomains),
    natureSolutions: normalizePriorArtItems(src.natureSolutions),
  };
}

export function hasPriorArt(p: PriorArt | undefined): boolean {
  return !!p && [p.currentLeaders, p.historicalPrecedents, p.adjacentDomains, p.natureSolutions]
    .some((list) => (list?.length ?? 0) > 0);
}

const VALID_ICONS = new Set(['Users', 'Zap', 'Brain', 'Heart', 'Shield', 'Leaf', 'Sparkles']);

export const FUTURE_ERA_NAME = 'Post-AI Era (2025+)';

// ============ Era helpers ============

/** An era is the "future" era when it holds expression objects (historical eras hold strings). */
export function isFutureEra(era: Era): boolean {
  return Array.isArray(era.expressions) && era.expressions.some((e) => isObject(e));
}

export function futureEraIndex(need: Need): number {
  const idx = need.eras.findIndex(isFutureEra);
  return idx !== -1 ? idx : need.eras.length - 1;
}

export function getFutureExpressions(need: Need): IndustryExpression[] {
  const era = need.eras[futureEraIndex(need)];
  return era && isFutureEra(era) ? (era.expressions as IndustryExpression[]) : [];
}

/** Return a copy of the need with its future-era expression list replaced. */
export function withFutureExpressions(
  need: Need,
  update: (expressions: IndustryExpression[]) => IndustryExpression[],
): Need {
  const idx = futureEraIndex(need);
  if (idx === -1) {
    return { ...need, eras: [{ name: FUTURE_ERA_NAME, expressions: update([]) }] };
  }
  return {
    ...need,
    eras: need.eras.map((era, i) =>
      i === idx ? { ...era, expressions: update(isFutureEra(era) ? (era.expressions as IndustryExpression[]) : []) } : era,
    ),
  };
}

/**
 * Immutably apply `fn` to the expression with `id` anywhere in the tree.
 * Returns the *same* array when `id` is not found, so callers can detect a no-op.
 */
export function mapExpressionTree(
  expressions: IndustryExpression[],
  id: string,
  fn: (expr: IndustryExpression) => IndustryExpression,
): IndustryExpression[] {
  let changed = false;
  const next = expressions.map((e) => {
    if (e.id === id) {
      changed = true;
      return fn(e);
    }
    if (e.children?.length) {
      const children = mapExpressionTree(e.children, id, fn);
      if (children !== e.children) {
        changed = true;
        return { ...e, children };
      }
    }
    return e;
  });
  return changed ? next : expressions;
}

/** Immutably remove the expression with `id` (and its subtree). */
export function removeFromExpressionTree(expressions: IndustryExpression[], id: string): IndustryExpression[] {
  let changed = false;
  const next: IndustryExpression[] = [];
  for (const e of expressions) {
    if (e.id === id) {
      changed = true;
      continue;
    }
    const children = e.children?.length ? removeFromExpressionTree(e.children, id) : e.children;
    if (children !== e.children) {
      changed = true;
      next.push({ ...e, children });
    } else {
      next.push(e);
    }
  }
  return changed ? next : expressions;
}

/**
 * Insert nodes under `parentId` (or at the root when null), at `index` or the end.
 * Returns the original array when the parent does not exist.
 */
export function insertIntoExpressionTree(
  expressions: IndustryExpression[],
  parentId: string | null,
  nodes: IndustryExpression[],
  index?: number,
): IndustryExpression[] {
  const insert = (list: IndustryExpression[]) => {
    const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
    return [...list.slice(0, at), ...nodes, ...list.slice(at)];
  };
  if (parentId === null) return insert(expressions);
  return mapExpressionTree(expressions, parentId, (e) => ({ ...e, children: insert(e.children ?? []) }));
}

/** Locate a node: its parent id (null at root) and index among its siblings. */
export function locateInExpressionTree(
  expressions: IndustryExpression[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; index: number; node: IndustryExpression } | null {
  for (let i = 0; i < expressions.length; i++) {
    const e = expressions[i];
    if (e.id === id) return { parentId, index: i, node: e };
    if (e.children?.length) {
      const found = locateInExpressionTree(e.children, id, e.id);
      if (found) return found;
    }
  }
  return null;
}

/** IDs of the ancestors of `id`, root first; null when not found. */
export function expressionAncestors(expressions: IndustryExpression[], id: string): string[] | null {
  for (const e of expressions) {
    if (e.id === id) return [];
    if (e.children?.length) {
      const below = expressionAncestors(e.children, id);
      if (below) return [e.id, ...below];
    }
  }
  return null;
}

export function findNeedIdForExpression(needs: Need[], expressionId: string): string | undefined {
  return needs.find((n) => collectExpressionIds(n).has(expressionId))?.id;
}

export function collectExpressionIds(need: Need): Set<string> {
  const ids = new Set<string>();
  const walk = (list: IndustryExpression[]) => {
    for (const e of list) {
      ids.add(e.id);
      if (e.children?.length) walk(e.children);
    }
  };
  for (const era of need.eras) if (isFutureEra(era)) walk(era.expressions as IndustryExpression[]);
  return ids;
}

/**
 * Normalize a generated need. Historical eras keep their string lists; the future era is
 * guaranteed to exist, sit last, and hold normalized expressions with unique IDs.
 */
export function normalizeNeed(raw: unknown, requestedName: string, priorArt: PriorArt): Need {
  const src = isObject(raw) ? raw : {};
  const rawEras = arr(src.eras).filter(isObject);

  const historical: Era[] = [];
  let future: IndustryExpression[] = [];
  let futureName = FUTURE_ERA_NAME;

  for (const era of rawEras) {
    const list = arr(era.expressions);
    if (list.some(isObject)) {
      future = future.concat(normalizeExpressions(list));
      futureName = str(era.name) || futureName;
    } else {
      historical.push({ name: str(era.name, 'Era'), expressions: strArr(list) });
    }
  }

  if (future.length === 0) throw new Error('The AI response contained no future industries.');

  const icon = str(src.icon);
  return {
    id: newId('need'),
    name: str(src.name) || requestedName.trim(),
    icon: VALID_ICONS.has(icon) ? icon : 'Users',
    description: str(src.description),
    priorArt,
    eras: [...historical, { name: futureName, expressions: future }],
    relatedNeeds: strArr(src.relatedNeeds).slice(0, 8),
  };
}

export const needKey = (name: string): string => name.toLowerCase().trim().replace(/\s+/g, ' ');
