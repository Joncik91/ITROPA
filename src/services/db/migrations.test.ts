import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { rekeyNeedExpressions, resolveExpression } from './migrations';

const legacyNeed = (id: string, names: string[]) => ({
  id,
  name: id,
  icon: 'Users',
  description: '',
  eras: [
    { name: 'Industrial', expressions: ['x'] },
    {
      name: 'Post-AI Era (2025+)',
      expressions: names.map((n, i) => ({
        id: String(i + 1), type: 'future', name: n, mutation: '', insight: '', inspirations: [],
        children: [{ id: `${i + 1}-1`, type: 'future', name: `${n} child`, mutation: '', insight: '', inspirations: [], children: [] }],
      })),
    },
  ],
  createdAt: 1,
  updatedAt: 1,
});

describe('rekeyNeedExpressions', () => {
  it('namespaces colliding IDs per need and is idempotent', () => {
    const needs = [legacyNeed('a', ['A1', 'A2']), legacyNeed('b', ['B1'])];
    const mapping = rekeyNeedExpressions(needs);
    const ids = (n: typeof needs[number]) => (n.eras[1].expressions as any[]).map((e) => e.id);
    expect(ids(needs[0])).toEqual(['a/1', 'a/2']);
    expect(ids(needs[1])).toEqual(['b/1']);
    expect((needs[0].eras[1].expressions[0] as any).children[0].id).toBe('a/1-1');

    expect(resolveExpression(mapping, '1', 'B1')?.newId).toBe('b/1');
    expect(resolveExpression(mapping, '1', 'a1')?.newId).toBe('a/1');
    expect(resolveExpression(mapping, '1', 'unknown')).toBeUndefined();

    rekeyNeedExpressions(needs);
    expect(ids(needs[0])).toEqual(['a/1', 'a/2']);
  });

  it('de-duplicates repeated IDs inside one need', () => {
    const need = legacyNeed('a', ['A1']);
    (need.eras[1].expressions as any[]).push({ id: '1', name: 'Dup', children: [] });
    rekeyNeedExpressions([need]);
    expect((need.eras[1].expressions as any[]).map((e) => e.id)).toEqual(['a/1', 'a/1#1']);
  });
});

describe('Dexie v5 → v6 upgrade', () => {
  it('re-keys analyses to the right need without deleting anything', async () => {
    const legacy = new Dexie('IndustryFamilyTreeDB');
    legacy.version(5).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt',
      patternAnalyses: 'id, patternName, mechanismCount, createdAt',
      priorArtAnalyses: 'id, needName, createdAt',
      chainAnalyses: 'id, expressionId, needId, createdAt',
      appConcepts: 'id, industryName, needId, createdAt',
    });
    await legacy.open();
    await legacy.table('needs').bulkPut([legacyNeed('a', ['A1']), legacyNeed('b', ['B1'])]);
    // Legacy bug: needId was saved as the expression id. "1" is B1's analysis here.
    await legacy.table('mechanisms').put({ id: '1', needId: '1', expressionName: 'B1', details: [{ coreMechanism: 'm' }], createdAt: 1 });
    await legacy.table('deepDives').put({ id: '1', needId: '1', expressionName: 'Orphan', details: {}, createdAt: 1 });
    await legacy.table('crossPollinates').put({ id: '1_1-1', expression1Id: '1', expression2Id: '1-1', expression1Name: 'A1', expression2Name: 'A1 child', result: [], createdAt: 1 });
    legacy.close();

    const { db } = await import('./db-client');
    await db.open();

    const mech = await db.mechanisms.toArray();
    expect(mech).toEqual([expect.objectContaining({ id: 'b/1', needId: 'b' })]);
    // No matching expression: kept as an orphan, not deleted.
    expect(await db.deepDives.get('1')).toBeDefined();
    const cross = await db.crossPollinates.toArray();
    expect(cross[0]).toMatchObject({ id: 'a/1-1_a/1'.split('_').sort().join('_'), expression1Id: 'a/1', expression2Id: 'a/1-1' });
    db.close();
  });
});
