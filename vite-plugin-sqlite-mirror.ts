import type { Plugin } from 'vite';
import { resolve } from 'path';

const TABLES = [
  'needs', 'mechanisms', 'deepDives', 'crossPollinates',
  'searchCache', 'patternAnalyses', 'priorArtAnalyses',
  'chainAnalyses', 'appConcepts',
];

export function sqliteMirrorPlugin(): Plugin {
  return {
    name: 'sqlite-mirror',
    configureServer(server) {
      // Lazy-require so it only loads in dev (not bundled)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const dbPath = resolve(process.cwd(), 'local-mirror.db');
      const sqlite = new Database(dbPath) as import('better-sqlite3').Database;

      for (const table of TABLES) {
        sqlite
          .prepare(`CREATE TABLE IF NOT EXISTS "${table}" (pk TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)`)
          .run();
      }

      console.log('🗄️  SQLite mirror ready:', dbPath);

      // Mount middleware at /api/mirror
      server.middlewares.use('/api/mirror', (req, res, next) => {
        // req.url has the /api/mirror prefix stripped by connect
        const parts = (req.url ?? '/').split('/').filter(Boolean);
        const table = parts[0];
        const encodedKey = parts[1];
        const key = encodedKey ? decodeURIComponent(encodedKey) : undefined;

        res.setHeader('Content-Type', 'application/json');

        // GET /api/mirror/all  — dump every table
        if (req.method === 'GET' && table === 'all') {
          const result: Record<string, any[]> = {};
          for (const t of TABLES) {
            const rows = sqlite.prepare(`SELECT data FROM "${t}"`).all() as { data: string }[];
            result[t] = rows.map(r => JSON.parse(r.data));
          }
          res.end(JSON.stringify(result));
          return;
        }

        if (!table || !TABLES.includes(table)) { next(); return; }

        // GET /api/mirror/:table
        if (req.method === 'GET') {
          const rows = sqlite.prepare(`SELECT data FROM "${table}"`).all() as { data: string }[];
          res.end(JSON.stringify(rows.map(r => JSON.parse(r.data))));
          return;
        }

        // POST /api/mirror/:table  — upsert  { key, data }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { key: pk, data } = JSON.parse(body);
              sqlite
                .prepare(`INSERT OR REPLACE INTO "${table}" (pk, data, updated_at) VALUES (?, ?, ?)`)
                .run(pk, JSON.stringify(data), Date.now());
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(e) }));
            }
          });
          return;
        }

        // DELETE /api/mirror/:table/:key  — remove one row
        if (req.method === 'DELETE' && key) {
          sqlite.prepare(`DELETE FROM "${table}" WHERE pk = ?`).run(key);
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        // DELETE /api/mirror/:table  — clear table
        if (req.method === 'DELETE' && !key) {
          sqlite.prepare(`DELETE FROM "${table}"`).run();
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        next();
      });
    },
  };
}
