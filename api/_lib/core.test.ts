import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGenerate, LIMITS, providerName, validateGenerateBody } from './core';

const env = { ...process.env };
beforeEach(() => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_PROVIDER;
});
afterEach(() => {
  process.env = { ...env };
});

const req = (method: string, body: unknown = null, headers: Record<string, string> = {}) => ({ method, headers, body });

describe('validateGenerateBody', () => {
  it('rejects missing, empty and non-string prompts', () => {
    expect(validateGenerateBody(null, 0.9).ok).toBe(false);
    expect(validateGenerateBody({}, 0.9).ok).toBe(false);
    expect(validateGenerateBody({ prompt: '   ' }, 0.9).ok).toBe(false);
    expect(validateGenerateBody({ prompt: 42 }, 0.9).ok).toBe(false);
  });

  it('rejects oversized prompts', () => {
    const r = validateGenerateBody({ prompt: 'x'.repeat(LIMITS.maxPromptChars + 1) }, 0.9);
    expect(r.ok).toBe(false);
  });

  it('clamps tokens and temperature, and ignores non-numeric values', () => {
    const r = validateGenerateBody({ prompt: 'hi', maxTokens: 1e9, temperature: -5 }, 0.9);
    expect(r).toEqual({ ok: true, value: { prompt: 'hi', maxTokens: LIMITS.maxTokens, temperature: 0 } });
    const d = validateGenerateBody({ prompt: 'hi', maxTokens: 'lots', temperature: NaN }, 0.7);
    expect(d.ok && d.value.temperature).toBe(0.7);
    expect(d.ok && d.value.maxTokens).toBe(4000);
  });
});

describe('handleGenerate guards (no upstream call)', () => {
  it('requires POST', async () => {
    expect((await handleGenerate(req('GET'), 0.9)).status).toBe(405);
  });

  it('reports a missing key as a config error', async () => {
    expect(await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).toMatchObject({ status: 500, body: { code: 'config' } });
  });

  it('rejects invalid bodies before calling the model', async () => {
    process.env.ANTHROPIC_API_KEY = 'k';
    expect((await handleGenerate(req('POST', { prompt: '' }), 0.9)).status).toBe(400);
  });
});

describe('provider selection', () => {
  beforeEach(() => {
    delete process.env.AI_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('defaults to anthropic, falls back to gemini when only its key is set', () => {
    expect(providerName()).toBe('anthropic');
    process.env.GEMINI_API_KEY = 'g';
    expect(providerName()).toBe('gemini');
    process.env.ANTHROPIC_API_KEY = 'a';
    expect(providerName()).toBe('anthropic');
    process.env.AI_PROVIDER = 'gemini';
    expect(providerName()).toBe('gemini');
  });

  it('reports the missing key for the selected provider', async () => {
    expect(await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).toMatchObject({
      status: 500,
      body: { code: 'config', error: expect.stringContaining('ANTHROPIC_API_KEY') },
    });
  });

  it('calls the Messages API and maps the response', async () => {
    process.env.ANTHROPIC_API_KEY = 'a';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: 'text', text: '{"ok":1}' }], stop_reason: 'max_tokens' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const res = await handleGenerate(req('POST', { prompt: 'x', temperature: 1.4 }), 0.9);
    expect(res).toMatchObject({ status: 200, body: { text: '{"ok":1}', truncated: true } });
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent).not.toHaveProperty('temperature');
    expect(fetchMock.mock.calls[0][1].headers['x-api-key']).toBe('a');
    vi.unstubAllGlobals();
  });

  it('maps Anthropic 401 and 429', async () => {
    process.env.ANTHROPIC_API_KEY = 'a';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'invalid x-api-key' } }), { status: 401 })));
    expect((await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).body).toMatchObject({ code: 'config' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'slow down' } }), { status: 429 })));
    expect((await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).status).toBe(429);
    vi.unstubAllGlobals();
  });
});
