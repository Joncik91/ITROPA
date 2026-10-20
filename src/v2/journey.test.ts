import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPriorArt = vi.fn();
vi.mock('./prior-art', () => ({ fetchPriorArt: (...a: unknown[]) => fetchPriorArt(...a) }));
vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import { loadFieldRead, loadPriorArt } from './journey';
import { getFieldRead, v2db } from './store';

const prior = { currentLeaders: [{ name: 'Meetup', mechanism: 'groups' }] };
const item = (t: string) => ({ title: t, detail: `${t} detail` });
const field = { summary: '', evolution: '', leaders: [], gaps: [item('g')], whiteSpace: [item('w')], entryMoves: [] };

beforeEach(async () => {
  fetchPriorArt.mockReset();
  vi.mocked(geminiClient.callAPI).mockReset();
  await db.searchCache.clear();
  await v2db.fieldReads.clear();
});

describe('loadPriorArt', () => {
  it('fetches once, saves, then serves the saved copy', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    expect(await loadPriorArt('Belonging')).toEqual(prior);
    expect(await loadPriorArt('belonging')).toEqual(prior);
    expect(fetchPriorArt).toHaveBeenCalledTimes(1);
  });

  it('saves nothing when the answer is empty, and says so', async () => {
    fetchPriorArt.mockResolvedValue({ currentLeaders: [], historicalPrecedents: [], adjacentDomains: [], natureSolutions: [] });
    await expect(loadPriorArt('Belonging')).rejects.toThrow(/No prior art/);
    expect(await DBService.getSearchCache('Belonging')).toBeUndefined();
  });

  it('does not save when the call itself fails', async () => {
    fetchPriorArt.mockRejectedValue(new Error('upstream'));
    await expect(loadPriorArt('Belonging')).rejects.toThrow('upstream');
    expect(await DBService.getSearchCache('Belonging')).toBeUndefined();
  });

  it('runs fresh research when the user adds a description', async () => {
    await DBService.saveSearchCache('Belonging', prior);
    fetchPriorArt.mockResolvedValue({ currentLeaders: [{ name: 'Other', mechanism: 'm' }] });
    const pa = await loadPriorArt('Belonging', 'in remote teams');
    expect(pa.currentLeaders?.[0].name).toBe('Other');
  });
});

describe('concurrent calls', () => {
  it('two simultaneous loads of the same need make one model call', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    await Promise.all([loadPriorArt('Belonging'), loadPriorArt('Belonging')]);
    expect(fetchPriorArt).toHaveBeenCalledTimes(1);
  });
});

describe('re-research with a description', () => {
  it('drops the old field read so it is rebuilt from the new prior art', async () => {
    fetchPriorArt.mockResolvedValueOnce(prior);
    const first = await loadPriorArt('Belonging');
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce(field);
    await loadFieldRead('Belonging', first);

    const second = { currentLeaders: [{ name: 'Other', mechanism: 'm' }] };
    fetchPriorArt.mockResolvedValueOnce(second);
    await loadPriorArt('Belonging', 'in remote teams');
    expect(await getFieldRead('Belonging')).toBeUndefined();

    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce({ ...field, gaps: [item('fresh')] });
    expect((await loadFieldRead('Belonging', second)).gaps[0].title).toBe('fresh');
  });
});

describe('loadFieldRead', () => {
  it('a failed field read leaves the saved prior art intact and saves no field read', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    const pa = await loadPriorArt('Belonging');
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce({ gaps: [] });
    await expect(loadFieldRead('Belonging', pa)).rejects.toThrow();
    expect(await getFieldRead('Belonging')).toBeUndefined();
    expect((await DBService.getSearchCache('Belonging'))?.priorArt).toEqual(prior);
  });

  it('saves a usable read and serves it without a second call', async () => {
    vi.mocked(geminiClient.callAPI).mockResolvedValue(field);
    await loadFieldRead('Belonging', prior);
    await loadFieldRead('Belonging', prior);
    expect(geminiClient.callAPI).toHaveBeenCalledTimes(1);
    expect((await getFieldRead('Belonging'))?.gaps[0].title).toBe('g');
  });
});
