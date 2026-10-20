import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/gemini/gemini-client', () => ({ geminiClient: { callAPI: vi.fn() } }));

import { geminiClient } from '../services/gemini/gemini-client';
import { buildFieldReadPrompt, normalizeFieldRead, runFieldRead } from './field-read';

const item = (t: string) => ({ title: t, detail: `${t} detail that is long enough to read` });
const good = {
  summary: 's', evolution: 'e',
  leaders: [{ name: 'L', strength: 'a', weakness: 'b' }],
  gaps: [item('g1'), item('g2'), item('g3')],
  whiteSpace: [item('w1'), item('w2'), item('w3')],
  entryMoves: [item('m1')],
};

describe('normalizeFieldRead', () => {
  it('keeps complete entries and accepts name/description as aliases', () => {
    const f = normalizeFieldRead({ ...good, gaps: [{ name: 'n', description: 'd' }] });
    expect(f.gaps).toEqual([{ title: 'n', detail: 'd' }]);
    expect(f.whiteSpace).toHaveLength(3);
  });

  it('drops entries with a title but no detail, and non-objects', () => {
    const f = normalizeFieldRead({ gaps: [{ title: 'only title' }, 'text', null, item('ok')], whiteSpace: 'nope' });
    expect(f.gaps).toEqual([item('ok')]);
    expect(f.whiteSpace).toEqual([]);
  });

  it('turns garbage into an empty read, not a crash', () => {
    expect(normalizeFieldRead(null).gaps).toEqual([]);
    expect(normalizeFieldRead('x').leaders).toEqual([]);
  });
});

describe('runFieldRead', () => {
  it('returns the normalized read', async () => {
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce(good);
    expect((await runFieldRead('Belonging', {})).gaps).toHaveLength(3);
  });

  it('rejects a read with no gaps or no white space', async () => {
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce({ ...good, gaps: [] });
    await expect(runFieldRead('Belonging', {})).rejects.toThrow(/gaps or white space/);
    vi.mocked(geminiClient.callAPI).mockResolvedValueOnce({ ...good, whiteSpace: [] });
    await expect(runFieldRead('Belonging', {})).rejects.toThrow(/gaps or white space/);
  });

  it('puts the need and its prior art in the prompt', () => {
    const p = buildFieldReadPrompt('Belonging', { currentLeaders: [{ name: 'Meetup', mechanism: 'm' }] });
    expect(p).toContain('"Belonging"');
    expect(p).toContain('Meetup');
  });
});
