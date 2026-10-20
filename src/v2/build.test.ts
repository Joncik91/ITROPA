import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import { DEFAULT_CONSTRAINTS, type AppConcept, type IndustryExpression } from '../types';
import { loadConcepts, rankConcepts } from './build';

const call = vi.mocked(geminiClient.callAPI);
const industry: IndustryExpression = { id: 'a', type: 'future', name: 'Shared rituals', mutation: 'm', insight: 'i', inspirations: [], children: [] };
const raw = (name: string, over: Record<string, unknown> = {}) => ({
  name, tagline: 't', formFactor: 'saas', targetUser: 'u', problemSolved: 'p', coreFeature: 'c',
  monetization: { model: 'Freemium', pricing: '$9', revenueEstimate: '$1k' }, techStack: ['React'], mvpScope: 'm',
  effortEstimate: '1-2 weeks', competitiveEdge: 'e', risks: ['r'], score: 70, ...over,
});

beforeEach(async () => {
  call.mockReset();
  await db.appConcepts.clear();
  await db.mechanisms.clear();
  await db.deepDives.clear();
});

describe('loadConcepts (checks 5, 7, 8)', () => {
  it('opens concepts V1 saved with no model call', async () => {
    const saved = { id: 'c1', name: 'Old', formFactor: 'tool' } as AppConcept;
    await DBService.saveAppConcepts('a', 'Shared rituals', 'need-1', [saved], false);
    expect(await loadConcepts('need-1', industry)).toEqual([saved]);
    expect(call).not.toHaveBeenCalled();
  });

  it('generates once, saves, and reuses the saved ones', async () => {
    call.mockResolvedValue({ concepts: [raw('One'), raw('Two'), raw('Three')] });
    const first = await loadConcepts('need-1', industry);
    expect(first.map((c) => c.name)).toEqual(['One', 'Two', 'Three']);
    expect((await DBService.getAppConcepts('a'))?.concepts).toHaveLength(3);
    await loadConcepts('need-1', industry);
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('saves nothing when fewer than 2 concepts come back or the call fails', async () => {
    call.mockResolvedValueOnce({ concepts: [raw('Only')] });
    await expect(loadConcepts('need-1', industry)).rejects.toThrow(/at least 2/);
    call.mockRejectedValueOnce(new Error('down'));
    await expect(loadConcepts('need-1', industry)).rejects.toThrow('down');
    expect(await DBService.getAppConcepts('a')).toBeUndefined();
  });
});

describe('rankConcepts (check 5)', () => {
  const mk = (name: string, over: Partial<AppConcept> = {}, score = 70) =>
    ({ id: name, name, tagline: '', formFactor: 'saas', targetUser: '', problemSolved: '', coreFeature: '', monetization: { model: '', pricing: '', revenueEstimate: '' }, techStack: ['React'], mvpScope: '', effortEstimate: '1-2 weeks', competitiveEdge: '', risks: [], score, ...over }) as AppConcept;

  it('puts the best fit first, breaks ties by the model score, and shows at most 4', () => {
    const list = [mk('Bad', { effortEstimate: '3+ months' }), mk('GoodLow', {}, 10), mk('GoodHigh', {}, 90), mk('B', { formFactor: 'mobile' }, 80), mk('C', { formFactor: 'mobile' }, 5)];
    const ranked = rankConcepts(list, { ...DEFAULT_CONSTRAINTS, availableTime: '2-4 weeks' });
    expect(ranked.map((r) => r.concept.name)).toEqual(['GoodHigh', 'GoodLow', 'B', 'Bad']);
    expect(ranked.map((r) => r.score)).toEqual([100, 100, 75, 75]);
  });
});
