import { describe, expect, it } from 'vitest';
import {
  expressionAncestors,
  getFutureExpressions,
  insertIntoExpressionTree,
  isFutureEra,
  locateInExpressionTree,
  mapExpressionTree,
  normalizeExpressions,
  normalizeNeed,
  normalizePriorArt,
  removeFromExpressionTree,
  withFutureExpressions,
} from './need-model';
import { extractJSON } from './json-parser';
import type { IndustryExpression } from '../types';

const expr = (name: string, children: unknown[] = []) => ({ id: '1', name, mutation: 'm', insight: 'i', children });

describe('normalizeExpressions', () => {
  it('assigns fresh unique IDs, ignoring the model-echoed ones', () => {
    const list = normalizeExpressions([expr('A', [expr('A1'), expr('A2')]), expr('B')]);
    const ids = [list[0].id, list[0].children[0].id, list[0].children[1].id, list[1].id];
    expect(new Set(ids).size).toBe(4);
    expect(ids.every((id) => id.startsWith('expr-'))).toBe(true);
  });

  it('drops nameless entries and coerces malformed fields', () => {
    const list = normalizeExpressions([
      { name: 'Ok', inspirations: 'not an array', children: 'nope', challenges: 'single', synergyScore: '87.6' },
      { mutation: 'no name' },
      'string entry',
      null,
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].inspirations).toEqual([]);
    expect(list[0].children).toEqual([]);
    expect(list[0].challenges).toEqual(['single']);
    expect(list[0].synergyScore).toBe(88);
  });

  it('unwraps object envelopes around arrays', () => {
    expect(normalizeExpressions({ industries: [expr('X')] })).toHaveLength(1);
    expect(normalizeExpressions(undefined)).toEqual([]);
  });
});

describe('normalizeNeed', () => {
  const priorArt = normalizePriorArt({ currentLeaders: [{ name: 'L', mechanism: 'm' }] });

  it('finds the future era by content, not by name, and places it last', () => {
    const need = normalizeNeed({
      name: 'Belonging',
      icon: 'NotAnIcon',
      eras: [
        { name: 'Post-AI (2030+)', expressions: [expr('F1'), expr('F2')] },
        { name: 'Industrial', expressions: ['a', 'b'] },
      ],
    }, 'belonging', priorArt);

    expect(need.icon).toBe('Users');
    expect(need.eras.map((e) => e.name)).toEqual(['Industrial', 'Post-AI (2030+)']);
    expect(isFutureEra(need.eras[1])).toBe(true);
    expect(getFutureExpressions(need).map((e) => e.name)).toEqual(['F1', 'F2']);
    expect(need.priorArt).toBe(priorArt);
    expect(need.id.startsWith('need-')).toBe(true);
  });

  it('throws when the model produced no future industries', () => {
    expect(() => normalizeNeed({ eras: [{ name: 'Old', expressions: ['x'] }] }, 'n', priorArt)).toThrow(/no future/i);
    expect(() => normalizeNeed('garbage', 'n', priorArt)).toThrow();
  });

  it('two generations of the same need never share expression IDs', () => {
    const raw = { name: 'N', eras: [{ name: 'F', expressions: [expr('A'), expr('B')] }] };
    const a = getFutureExpressions(normalizeNeed(raw, 'N', priorArt)).map((e) => e.id);
    const b = getFutureExpressions(normalizeNeed(raw, 'N', priorArt)).map((e) => e.id);
    expect(a.filter((id) => b.includes(id))).toEqual([]);
  });
});

describe('tree operations', () => {
  const node = (id: string, children: IndustryExpression[] = []): IndustryExpression =>
    ({ id, type: 'future', name: id, mutation: '', insight: '', inspirations: [], children });
  const tree = [node('a', [node('a1'), node('a2', [node('a2x')])]), node('b')];

  it('inserts at root, under a parent, at an index, and is a no-op for unknown parents', () => {
    expect(insertIntoExpressionTree(tree, null, [node('c')]).map((n) => n.id)).toEqual(['a', 'b', 'c']);
    const under = insertIntoExpressionTree(tree, 'a2', [node('new')], 0);
    expect(under[0].children[1].children.map((n) => n.id)).toEqual(['new', 'a2x']);
    expect(insertIntoExpressionTree(tree, 'missing', [node('z')])).toBe(tree);
  });

  it('locates, removes and finds ancestors', () => {
    expect(locateInExpressionTree(tree, 'a2x')).toMatchObject({ parentId: 'a2', index: 0 });
    expect(locateInExpressionTree(tree, 'nope')).toBeNull();
    expect(removeFromExpressionTree(tree, 'a2')[0].children.map((n) => n.id)).toEqual(['a1']);
    expect(expressionAncestors(tree, 'a2x')).toEqual(['a', 'a2']);
    expect(expressionAncestors(tree, 'b')).toEqual([]);
    expect(expressionAncestors(tree, 'nope')).toBeNull();
  });

  it('keeps untouched subtrees referentially stable', () => {
    const next = mapExpressionTree(tree, 'a1', (e) => ({ ...e, name: 'changed' }));
    expect(next[1]).toBe(tree[1]);
    expect(next[0].children[1]).toBe(tree[0].children[1]);
  });

  it('withFutureExpressions only replaces the future era', () => {
    const need = { id: 'n', name: 'n', icon: 'Users', description: '', eras: [{ name: 'Old', expressions: ['x'] }, { name: 'F', expressions: tree }] };
    const next = withFutureExpressions(need, (list) => list.slice(1));
    expect(next.eras[0]).toBe(need.eras[0]);
    expect(getFutureExpressions(next).map((e) => e.id)).toEqual(['b']);
  });
});

describe('extractJSON', () => {
  it('handles fences, prose, trailing commas and truncation', () => {
    expect(extractJSON('```json\n{"a": [1, 2,],}\n```')).toEqual({ a: [1, 2] });
    expect(extractJSON('Sure! Here it is: [{"x": 1}] Hope that helps')).toEqual([{ x: 1 }]);
    expect(extractJSON('{"a": [{"b": "c"}, {"d": "e')).toEqual({ a: [{ b: 'c' }] });
  });

  it('throws on non-JSON', () => {
    expect(() => extractJSON('no json here', { logErrors: false })).toThrow();
  });
});

describe('no-op detection (used by undo/redo and late AI results)', () => {
  const node = (id: string, children: IndustryExpression[] = []): IndustryExpression =>
    ({ id, type: 'future', name: id, mutation: '', insight: '', inspirations: [], children });
  const tree = [node('a', [node('a1')]), node('b')];

  it('removing an absent node returns the same array', () => {
    expect(removeFromExpressionTree(tree, 'gone')).toBe(tree);
    expect(removeFromExpressionTree(tree, 'a1')).not.toBe(tree);
  });
});
