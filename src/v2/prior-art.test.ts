import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { fetchPriorArt, PRIOR_ART_TOKENS } from './prior-art';

describe('fetchPriorArt', () => {
  it('asks for more output than the V1 call, whose 3000-token answer is cut off', async () => {
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce({ currentLeaders: [{ name: 'Meetup', mechanism: 'groups' }] });
    const pa = await fetchPriorArt('Belonging');
    expect(pa.currentLeaders?.[0].name).toBe('Meetup');
    expect(vi.mocked(geminiClient.callAPI).mock.calls[0][1]).toBe(PRIOR_ART_TOKENS);
    expect(PRIOR_ART_TOKENS).toBeGreaterThan(3000);
  });
});
