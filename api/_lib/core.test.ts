import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleGenerate, LIMITS, validateGenerateBody } from './core';

const env = { ...process.env };
beforeEach(() => {
  delete process.env.GEMINI_API_KEY;
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
    process.env.GEMINI_API_KEY = 'k';
    expect((await handleGenerate(req('POST', { prompt: '' }), 0.9)).status).toBe(400);
  });
});
