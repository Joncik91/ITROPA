import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const respond = (status: number, body: unknown) =>
  Promise.resolve(new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }));

describe('apiClient', () => {
  let events: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    events = [];
    vi.stubGlobal('window', { dispatchEvent: (e: Event) => events.push(e.type) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const load = async () => (await import('./api-client.service'));

  it('parses JSON text from a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respond(200, { text: '```json\n{"ok": true}\n```' })));
    const { apiClient } = await load();
    await expect(apiClient.callGemini('p')).resolves.toEqual({ ok: true });
  });

  it('does not retry client errors and surfaces the server message', async () => {
    const fetchMock = vi.fn(() => respond(400, { error: 'Prompt is required', code: 'invalid' }));
    vi.stubGlobal('fetch', fetchMock);
    const { apiClient, ApiError } = await load();
    const err = (await apiClient.callGemini('p', 100, 3).catch((e: unknown) => e)) as InstanceType<typeof ApiError>;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Prompt is required');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries transient failures with backoff, then succeeds', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => respond(502, '<html>Bad gateway</html>'))
      .mockImplementationOnce(() => respond(200, { text: '[1]' }));
    vi.stubGlobal('fetch', fetchMock);
    const { apiClient } = await load();
    const promise = apiClient.callGemini('p', 100, 1);
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual([1]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('signals the app when the session is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respond(401, { error: 'Authentication required', code: 'auth' })));
    const { apiClient, AUTH_REQUIRED_EVENT } = await load();
    await expect(apiClient.callGemini('p')).rejects.toMatchObject({ code: 'auth' });
    expect(events).toEqual([AUTH_REQUIRED_EVENT]);
  });

  it('caps concurrent requests', async () => {
    let inFlight = 0;
    let peak = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
      return new Response(JSON.stringify({ text: '{}' }), { status: 200 });
    }));
    const { apiClient } = await load();
    const all = Promise.all(Array.from({ length: 10 }, () => apiClient.callGemini('p')));
    await vi.runAllTimersAsync();
    await all;
    expect(peak).toBe(4);
  });
});
