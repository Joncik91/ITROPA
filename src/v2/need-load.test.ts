import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPriorArt = vi.fn();
vi.mock('./prior-art', () => ({ fetchPriorArt: (...a: unknown[]) => fetchPriorArt(...a) }));
vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import { getFutureExpressions } from '../utils/need-model';
import { NEED_TOKENS } from './tokens';
import { loadNeed } from './need-load';

const prior = { currentLeaders: [{ name: 'Meetup', mechanism: 'groups' }] };
const generated = {
  name: 'Belonging',
  icon: 'Users',
  description: 'to be part of something',
  eras: [
    { name: 'Pre-Industrial', expressions: ['Villages'] },
    { name: 'Post-AI Era (2025+)', expressions: [{ name: 'Shared rituals', mutation: 'm', insight: 'i', inspirations: [{ source: 'Meetup', mechanism: 'groups', twist: 't' }], children: [] }] },
  ],
};

beforeEach(async () => {
  fetchPriorArt.mockReset();
  vi.mocked(geminiClient.callAPI).mockReset();
  await db.needs.clear();
  await db.searchCache.clear();
});

describe('loadNeed', () => {
  it('opens a need that V1 saved without any model call (check 8)', async () => {
    await DBService.saveNeed({
      id: 'need-v1', name: 'Belonging', icon: 'Users', description: 'v1', priorArt: prior,
      eras: [
        { name: 'Industrial', expressions: ['Clubs'] },
        { name: 'Post-AI Era (2025+)', expressions: [{ id: 'e1', type: 'future', name: 'Old industry', mutation: 'm', insight: 'i', inspirations: [], children: [] }] },
      ],
    });
    const need = await loadNeed('belonging');
    expect(need.id).toBe('need-v1');
    expect(need.priorArt).toEqual(prior);
    expect(getFutureExpressions(need)[0].name).toBe('Old industry');
    expect(geminiClient.callAPI).not.toHaveBeenCalled();
    expect(fetchPriorArt).not.toHaveBeenCalled();
  });

  it('saves under the typed name even when the model renames the need, so the next visit finds it', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    vi.mocked(geminiClient.callAPI).mockResolvedValue({ ...generated, name: 'Sense of community' });
    const need = await loadNeed('Belonging');
    expect(need.name).toBe('Belonging');
    expect((await DBService.findNeedByName('Belonging'))?.id).toBe(need.id);
    await loadNeed('Belonging');
    expect(geminiClient.callAPI).toHaveBeenCalledTimes(1);
  });

  it('generates once from the saved prior art and saves the need', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    vi.mocked(geminiClient.callAPI).mockResolvedValue(generated);
    const need = await loadNeed('Belonging');
    expect(getFutureExpressions(need)[0].name).toBe('Shared rituals');
    expect(vi.mocked(geminiClient.callAPI).mock.calls[0][1]).toBe(NEED_TOKENS);
    expect((await DBService.findNeedByName('Belonging'))?.id).toBe(need.id);
    await loadNeed('Belonging');
    expect(geminiClient.callAPI).toHaveBeenCalledTimes(1);
  });

  it('saves no need when the answer holds no future industries, and keeps the prior art', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    vi.mocked(geminiClient.callAPI).mockResolvedValue({ ...generated, eras: [generated.eras[0]] });
    await expect(loadNeed('Belonging')).rejects.toThrow(/no future industries/);
    expect(await DBService.findNeedByName('Belonging')).toBeUndefined();
    expect((await DBService.getSearchCache('Belonging'))?.priorArt).toEqual(prior);
  });

  it('saves no need when the call fails', async () => {
    fetchPriorArt.mockResolvedValue(prior);
    vi.mocked(geminiClient.callAPI).mockRejectedValue(new Error('upstream'));
    await expect(loadNeed('Belonging')).rejects.toThrow('upstream');
    expect(await DBService.findNeedByName('Belonging')).toBeUndefined();
  });
});
