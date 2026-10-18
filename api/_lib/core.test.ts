import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createSessionToken,
  handleAuth,
  handleGenerate,
  isAuthorized,
  LIMITS,
  readCookie,
  SESSION_COOKIE,
  validateGenerateBody,
  verifySessionToken,
} from './core';

const env = { ...process.env };
beforeEach(() => {
  delete process.env.APP_PASSWORD;
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

describe('session tokens', () => {
  it('verifies a fresh token and rejects tampering, expiry, wrong password', () => {
    const now = Date.now();
    const token = createSessionToken('pw', now);
    expect(verifySessionToken(token, 'pw', now)).toBe(true);
    expect(verifySessionToken(token, 'other', now)).toBe(false);
    expect(verifySessionToken(token.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')), 'pw', now)).toBe(false);
    const [exp, sig] = token.split('.');
    expect(verifySessionToken(`${Number(exp) + 999}.${sig}`, 'pw', now)).toBe(false);
    expect(verifySessionToken(token, 'pw', now + 31 * 24 * 3600 * 1000)).toBe(false);
    expect(verifySessionToken(undefined, 'pw', now)).toBe(false);
    expect(verifySessionToken('garbage', 'pw', now)).toBe(false);
  });

  it('reads the session cookie among others', () => {
    expect(readCookie({ cookie: `a=1; ${SESSION_COOKIE}=abc%2Edef; b=2` }, SESSION_COOKIE)).toBe('abc.def');
    expect(readCookie({}, SESSION_COOKIE)).toBeUndefined();
    expect(readCookie({ cookie: `${SESSION_COOKIE}=%E0%A4` }, SESSION_COOKIE)).toBeUndefined();
  });
});

describe('handleAuth', () => {
  it('reports open access when no password is configured', async () => {
    expect(await handleAuth(req('GET'))).toMatchObject({ status: 200, body: { required: false, authenticated: true } });
  });

  it('issues an HttpOnly cookie on the right password and 401 otherwise', async () => {
    process.env.APP_PASSWORD = 'secret';
    expect((await handleAuth(req('GET'))).body).toEqual({ required: true, authenticated: false });
    expect((await handleAuth(req('POST', { password: 'nope' }))).status).toBe(401);
    expect((await handleAuth(req('POST', {}))).status).toBe(401);

    const ok = await handleAuth(req('POST', { password: ' secret ' }, { 'x-forwarded-proto': 'https' }));
    expect(ok.status).toBe(200);
    const cookie = String(ok.headers?.['Set-Cookie']);
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Secure');

    const token = cookie.split(';')[0].split('=')[1];
    expect(isAuthorized(req('POST', null, { cookie: `${SESSION_COOKIE}=${token}` }))).toBe(true);
    expect((await handleAuth(req('GET', null, { cookie: `${SESSION_COOKIE}=${token}` }))).body).toEqual({ required: true, authenticated: true });
  });

  it('clears the cookie on DELETE', async () => {
    expect(String((await handleAuth(req('DELETE'))).headers?.['Set-Cookie'])).toContain('Max-Age=0');
  });
});

describe('handleGenerate guards (no upstream call)', () => {
  it('requires POST', async () => {
    expect((await handleGenerate(req('GET'), 0.9)).status).toBe(405);
  });

  it('enforces the session server-side when a password is set', async () => {
    process.env.APP_PASSWORD = 'secret';
    process.env.GEMINI_API_KEY = 'k';
    expect((await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).status).toBe(401);
  });

  it('reports a missing key as a config error', async () => {
    expect(await handleGenerate(req('POST', { prompt: 'x' }), 0.9)).toMatchObject({ status: 500, body: { code: 'config' } });
  });

  it('rejects invalid bodies before calling the model', async () => {
    process.env.GEMINI_API_KEY = 'k';
    expect((await handleGenerate(req('POST', { prompt: '' }), 0.9)).status).toBe(400);
  });
});
