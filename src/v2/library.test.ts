import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../services/db/db-client';
import { DBService } from '../services/db/db.service';
import type { IndustryExpression, Need } from '../types';
import { buildLibrary, loadLibrary } from './library';
import { saveFieldRead, v2db } from './store';

const ind = (id: string, children: IndustryExpression[] = []): IndustryExpression => ({
  id, type: 'future', name: id, mutation: 'm', insight: 'i', children, inspirations: [],
});
const need = (id: string, name: string, list: IndustryExpression[], updatedAt?: number) => ({
  id, name, icon: 'Users', description: 'd', createdAt: 1, updatedAt,
  eras: [{ name: 'Post-AI Era (2025+)', expressions: list }],
}) as Need & { createdAt: number; updatedAt?: number };

const base = { mechanisms: [], deepDives: [], concepts: [], fieldReadKeys: new Set<string>() };

describe('buildLibrary', () => {
  it('counts every industry including sub-industries, and sorts newest first with undated last', () => {
    const rows = buildLibrary({ ...base, needs: [
      need('n0', 'Undated', [ind('u')]),
      need('n1', 'Old', [ind('a')], 10),
      need('n2', 'New', [ind('b', [ind('b1'), ind('b2')])], 20),
    ] as never });
    expect(rows.map((r) => [r.name, r.industries])).toEqual([['New', 3], ['Old', 1], ['Undated', 1]]);
  });

  it('counts understood only when both the mechanism and the deep dive exist, for that need', () => {
    const rows = buildLibrary({ ...base,
      needs: [need('n1', 'A', [ind('a'), ind('b'), ind('c')], 1)] as never,
      mechanisms: [{ id: 'a', needId: 'n1' }, { id: 'b', needId: 'n1' }, { id: 'c', needId: 'other' }],
      deepDives: [{ id: 'a', needId: 'n1' }, { id: 'c', needId: 'n1' }],
    });
    expect(rows[0].understood).toBe(1);
  });

  it('counts industries with a saved concept set that holds at least one concept', () => {
    const rows = buildLibrary({ ...base,
      needs: [need('n1', 'A', [ind('a'), ind('b')], 1)] as never,
      concepts: [{ id: 'a', needId: 'n1', concepts: [{}] }, { id: 'b', needId: 'n1', concepts: [] }],
    });
    expect(rows[0].withConcepts).toBe(1);
  });

  it('opens at Industries when it has industries and at Field when it has none', () => {
    const rows = buildLibrary({ ...base, needs: [need('n1', 'Full', [ind('a')], 2), need('n2', 'Empty', [], 1)] as never });
    expect(Object.fromEntries(rows.map((r) => [r.name, r.opensAt]))).toEqual({ Full: 'industries', Empty: 'field' });
  });

  it('shows two needs with the same name as one row, the one that opens (lowest id)', () => {
    const rows = buildLibrary({ ...base, needs: [need('b-new', 'Belonging', [ind('y'), ind('z')], 5), need('a-old', ' belonging ', [ind('x')], 1)] as never });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('a-old');
    expect(rows[0].industries).toBe(1);
  });

  it('keeps listing the others when one stored row is damaged', () => {
    const broken = { id: 'x', name: 'Broken', createdAt: 1, updatedAt: 1 } as never;
    const nameless = { id: 'y', eras: [] } as never;
    const rows = buildLibrary({ ...base, needs: [broken, nameless, need('n1', 'Fine', [ind('a')], 2)] as never });
    expect(rows.map((r) => [r.name, r.industries])).toEqual([['Fine', 1], ['Broken', 0]]);
  });

  it('marks a field read by the need name', () => {
    const rows = buildLibrary({ ...base, needs: [need('n1', 'Belonging', [], 1)] as never, fieldReadKeys: new Set(['belonging']) });
    expect(rows[0].hasFieldRead).toBe(true);
  });
});

describe('loadLibrary', () => {
  beforeEach(async () => { await db.needs.clear(); await db.mechanisms.clear(); await db.deepDives.clear(); await db.appConcepts.clear(); await v2db.fieldReads.clear(); });

  it('lists a need that has no updatedAt, which the updatedAt index would skip', async () => {
    await db.needs.put(need('n1', 'Undated', [ind('a')]) as never);
    await db.needs.put(need('n2', 'Dated', [ind('b')], 5) as never);
    const rows = await loadLibrary();
    expect(rows.map((r) => r.name)).toEqual(['Dated', 'Undated']);
  });

  it('describes the record that opening by name returns', async () => {
    await db.needs.put(need('a-old', 'Belonging', [ind('x')], 1) as never);
    await db.needs.put(need('b-new', 'Belonging', [ind('y'), ind('z')], 5) as never);
    const row = (await loadLibrary())[0];
    expect((await DBService.findNeedByName(row.name))?.id).toBe(row.id);
  });

  it('reads the field-read store', async () => {
    await db.needs.put(need('n1', 'Belonging', [ind('a')], 1) as never);
    await saveFieldRead('Belonging', { summary: 's', leaders: [], gaps: [], whiteSpace: [], evolution: '', entryMoves: [] });
    expect((await loadLibrary())[0].hasFieldRead).toBe(true);
  });
});
