import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CoreRequest, CoreResponse } from './core.js';

/** Adapt a framework-agnostic core handler to a Vercel serverless function. */
export function toVercelHandler(handle: (req: CoreRequest) => CoreResponse | Promise<CoreResponse>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    let result: CoreResponse;
    try {
      result = await handle({ method: req.method ?? 'GET', headers: req.headers, body: req.body ?? null });
    } catch (error) {
      console.error('[api] unhandled error:', error);
      result = { status: 500, body: { error: 'Internal server error' } };
    }
    res.setHeader('Cache-Control', 'no-store');
    for (const [name, value] of Object.entries(result.headers ?? {})) res.setHeader(name, value);
    res.status(result.status).json(result.body);
  };
}
