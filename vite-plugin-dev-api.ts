import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type * as Core from './api/_lib/core';

const MAX_BODY_BYTES = 1_000_000;

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string | string[]> = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.end(JSON.stringify(body));
}

/**
 * Serves /api/gemini, /api/ai-assistant and /api/auth from the same core module the Vercel
 * functions use, so `npm run dev` works end-to-end with the API key kept server-side.
 */
export function devApiPlugin(): Plugin {
  return {
    name: 'itropa-dev-api',
    apply: 'serve',
    configureServer(server) {
      const routes: Record<string, (core: typeof Core, req: Core.CoreRequest) => Core.CoreResponse | Promise<Core.CoreResponse>> = {
        '/api/gemini': (core, req) => core.handleGenerate(req, 0.9),
        '/api/ai-assistant': (core, req) => core.handleGenerate(req, 0.7),
        '/api/auth': (core, req) => core.handleAuth(req),
      };

      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        const route = routes[path];
        if (!route) return next();

        try {
          const body = req.method === 'POST' ? await readBody(req) : null;
          // Loaded per request so edits to api/_lib hot-reload without restarting Vite.
          const core = (await server.ssrLoadModule('/api/_lib/core.ts')) as typeof Core;
          const result = await route(core, { method: req.method ?? 'GET', headers: req.headers, body });
          send(res, result.status, result.body, result.headers);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Internal error';
          const isClientError = /Invalid JSON body|too large/.test(message);
          if (!isClientError) console.error('[dev-api]', error);
          send(res, isClientError ? 400 : 500, { error: isClientError ? message : 'Internal server error' });
        }
      });
    },
  };
}
