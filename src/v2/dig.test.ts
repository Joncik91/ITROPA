import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import { getFutureExpressions } from '../utils/need-model';
import type { IndustryExpression, Need } from '../types';
import { branch, combine, getSavedUnderstanding, understand } from './dig';

const call = vi.mocked(geminiClient.callAPI);
const ind = (id: string, name: string): IndustryExpression => ({
  id, type: 'future', name, mutation: 'enabler', insight: 'why', children: [],
  inspirations: [{ source: 'Meetup', mechanism: 'groups', twist: 't' }],
});
const NEED: Need = {
  id: 'need-1', name: 'Belonging', icon: 'Users', description: 'd',
  eras: [{ name: 'Post-AI Era (2025+)', expressions: [ind('a', 'Shared rituals'), ind('b', 'Care circles')] }],
};
const good = {
  mechanism: { coreMechanism: 'Repeated shared action builds trust', abstractPattern: 'Synchrony creates bonds', keyPrinciples: [{ principle: 'p', function: 'f', criticality: 'c' }], untappedDomains: [{ domain: 'Remote work', opportunity: 'o', novelty: 'n' }], combinationPotential: ['x'] },
  deepDive: { marketOpportunity: 'Large and growing', keyEnablers: ['AI'], challenges: [{ challenge: 'c', potentialSolution: 's' }], timeline: 't', risks: ['r'] },
};

beforeEach(async () => {
  call.mockReset();
  await db.needs.clear();
  await db.mechanisms.clear();
  await db.deepDives.clear();
  await DBService.saveNeed(NEED);
});

describe('understand (check 6b)', () => {
  it('makes one call, shows mechanism, pattern and business text, and saves both records', async () => {
    call.mockResolvedValue(good);
    const r = await understand('need-1', ind('a', 'Shared rituals'));
    expect(call).toHaveBeenCalledTimes(1);
    expect(r.mechanism.coreMechanism).toContain('trust');
    expect(r.mechanism.abstractPattern).toContain('Synchrony');
    expect(r.deepDive.marketOpportunity).toBe('Large and growing');
    expect(r.deepDive.keyEnablers).toEqual(['AI']);
    expect(r.deepDive.challenges[0].challenge).toBe('c');
    expect(await getSavedUnderstanding('a')).toEqual(r);
  });

  it('saves nothing when one part is missing or the call fails (check 7)', async () => {
    call.mockResolvedValueOnce({ deepDive: good.deepDive });
    await expect(understand('need-1', ind('a', 'Shared rituals'))).rejects.toThrow(/mechanism/i);
    call.mockRejectedValueOnce(new Error('boom'));
    await expect(understand('need-1', ind('a', 'Shared rituals'))).rejects.toThrow('boom');
    expect(await getSavedUnderstanding('a')).toBeNull();
    expect(await DBService.getMechanism('a')).toBeUndefined();
    expect(await DBService.getDeepDiveById('a')).toBeUndefined();
  });

  it('leaves no mechanism row behind when the deep dive cannot be saved', async () => {
    call.mockResolvedValue(good);
    const spy = vi.spyOn(DBService, 'saveDeepDive').mockRejectedValueOnce(new Error('disk full'));
    await expect(understand('need-1', ind('a', 'Shared rituals'))).rejects.toThrow('disk full');
    spy.mockRestore();
    expect(await DBService.getMechanism('a')).toBeUndefined();
  });

  it('opens what V1 saved with no model call', async () => {
    await DBService.saveMechanism('a', 'Shared rituals', 'need-1', [good.mechanism]);
    await DBService.saveDeepDive('a', 'Shared rituals', 'need-1', { marketOpportunity: 'v1', keyEnablers: [], challenges: [], timeline: '' });
    expect((await getSavedUnderstanding('a'))?.deepDive.marketOpportunity).toBe('v1');
    expect(call).not.toHaveBeenCalled();
  });
});

describe('branch (check 6b)', () => {
  it('adds 3 sub-industries under the parent and saves them', async () => {
    call.mockResolvedValue([1, 2, 3].map((n) => ({ name: `Sub ${n}`, mutation: 'm', insight: `insight ${n}`, inspirations: [], children: [] })));
    const next = await branch('need-1', ind('a', 'Shared rituals'));
    const parent = getFutureExpressions(next).find((e) => e.id === 'a')!;
    expect(parent.children.map((c) => c.name)).toEqual(['Sub 1', 'Sub 2', 'Sub 3']);
    expect(parent.children[0].insight).toBe('insight 1');
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!).find((e) => e.id === 'a')!.children).toHaveLength(3);
  });

  it('saves nothing and asks for a retry when fewer than 3 sub-industries come back', async () => {
    call.mockResolvedValue([1, 2].map((n) => ({ name: `Sub ${n}`, mutation: 'm', insight: 'i', inspirations: [], children: [] })));
    await expect(branch('need-1', ind('a', 'Shared rituals'))).rejects.toThrow(/3/);
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!).find((e) => e.id === 'a')!.children).toHaveLength(0);
  });

  it('keeps both results when Branch and Combine finish at the same time', async () => {
    const subs = [1, 2, 3].map((n) => ({ name: `Sub ${n}`, mutation: 'm', insight: 'i', inspirations: [], children: [] }));
    const hybrids = [{ name: 'Hybrid', mutation: 'm', insight: 'i', synergyScore: 50, inspirations: [], children: [] }];
    call.mockImplementation(async (prompt: string) => {
      await new Promise((r) => setTimeout(r, 5));
      return prompt.includes('systematic combination') ? hybrids : subs;
    });
    await Promise.all([branch('need-1', ind('a', 'Shared rituals')), combine('need-1', ind('a', 'Shared rituals'), ind('b', 'Care circles'))]);
    const list = getFutureExpressions((await DBService.getNeed('need-1'))!);
    expect(list.find((e) => e.id === 'a')!.children).toHaveLength(3);
    expect(list.map((e) => e.name)).toContain('Hybrid');
  });

  it('saves nothing when the model returns no sub-industries', async () => {
    call.mockResolvedValue([]);
    await expect(branch('need-1', ind('a', 'Shared rituals'))).rejects.toThrow();
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!).find((e) => e.id === 'a')!.children).toHaveLength(0);
  });

  it('does not write when the parent was removed while the model answered', async () => {
    call.mockImplementation(async () => {
      await DBService.saveNeed({ ...NEED, eras: [{ name: 'Post-AI Era (2025+)', expressions: [ind('b', 'Care circles')] }] });
      return [1, 2, 3].map((n) => ({ name: `Sub ${n}`, mutation: 'm', insight: 'i', inspirations: [], children: [] }));
    });
    await expect(branch('need-1', ind('a', 'Shared rituals'))).rejects.toThrow(/removed/);
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!).map((e) => e.id)).toEqual(['b']);
  });
});

describe('combine (check 6)', () => {
  const hybrid = (name: string, synergyScore: number) => ({
    name, mutation: 'm', insight: 'i', combinationType: 'Additive Integration', synergyScore,
    inspirations: [{ source: 'Shared rituals', mechanism: 'm', twist: 't' }, { source: 'Care circles', mechanism: 'm', twist: 't' }], children: [],
  });

  it('adds the highest-synergy hybrid, flagged combined, with both sources named', async () => {
    call.mockResolvedValue([hybrid('Low', 40), hybrid('Best', 90), hybrid('Mid', 60)]);
    const next = await combine('need-1', ind('a', 'Shared rituals'), ind('b', 'Care circles'));
    const list = getFutureExpressions(next);
    expect(list).toHaveLength(3);
    const added = list[2];
    expect(added.name).toBe('Best');
    expect(added.crossPollinated).toBe(true);
    expect(added.sourceExpressions).toEqual(['a', 'b']);
    expect(added.inspirations.map((i) => i.source)).toEqual(['Shared rituals', 'Care circles']);
    expect(added.id).not.toBe('a');
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!)).toHaveLength(3);
  });

  it('adds nothing when the call fails', async () => {
    call.mockRejectedValue(new Error('down'));
    await expect(combine('need-1', ind('a', 'x'), ind('b', 'y'))).rejects.toThrow('down');
    expect(getFutureExpressions((await DBService.getNeed('need-1'))!)).toHaveLength(2);
  });
});
