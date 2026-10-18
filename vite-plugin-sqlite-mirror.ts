import type { Plugin } from 'vite';
import { resolve } from 'path';

const TABLES = [
  'needs', 'mechanisms', 'deepDives', 'crossPollinates',
  'searchCache', 'patternAnalyses', 'priorArtAnalyses',
  'chainAnalyses', 'appConcepts',
];

const MAX_BODY_BYTES = 20_000_000;

export function sqliteMirrorPlugin(): Plugin {
  return {
    name: 'sqlite-mirror',
    apply: 'serve',
    async configureServer(server) {
      // Loaded lazily so production builds never touch the native module, and a missing or
      // unbuildable better-sqlite3 degrades to "no mirror" instead of crashing the dev server.
      let sqlite: import('better-sqlite3').Database;
      try {
        const { default: Database } = await import('better-sqlite3');
        sqlite = new Database(resolve(process.cwd(), 'local-mirror.db'));
      } catch (error) {
        console.warn('⚠️  SQLite mirror disabled (better-sqlite3 unavailable):', (error as Error).message);
        return;
      }

      for (const table of TABLES) {
        sqlite
          .prepare(`CREATE TABLE IF NOT EXISTS "${table}" (pk TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)`)
          .run();
      }

      const readRows = (table: string): unknown[] =>
        (sqlite.prepare(`SELECT data FROM "${table}"`).all() as { data: string }[]).flatMap((r) => {
          try {
            return [JSON.parse(r.data)];
          } catch {
            return [];
          }
        });

      const upsertMany = sqlite.transaction((table: string, rows: Array<{ key: string; data: unknown }>) => {
        const stmt = sqlite.prepare(`INSERT OR REPLACE INTO "${table}" (pk, data, updated_at) VALUES (?, ?, ?)`);
        const now = Date.now();
        for (const row of rows) stmt.run(String(row.key), JSON.stringify(row.data), now);
      });

      console.log('🗄️  SQLite mirror ready');

      server.middlewares.use('/api/mirror', (req, res, next) => {
        // connect strips the /api/mirror prefix from req.url
        const parts = (req.url ?? '/').split('?')[0].split('/').filter(Boolean);
        const table = parts[0];
        const key = parts[1] ? decodeURIComponent(parts[1]) : undefined;

        const reply = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };

        if (req.method === 'GET' && table === 'all') {
          const result: Record<string, unknown[]> = {};
          for (const t of TABLES) result[t] = readRows(t);
          return reply(200, result);
        }

        if (!table || !TABLES.includes(table)) return next();

        if (req.method === 'GET') return reply(200, readRows(table));

        // POST /api/mirror/:table — upsert { rows: [{ key, data }] }
        if (req.method === 'POST') {
          let size = 0;
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
              reply(413, { error: 'Payload too large' });
              req.destroy();
              return;
            }
            chunks.push(chunk);
          });
          req.on('end', () => {
            try {
              const { rows } = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { rows: Array<{ key: string; data: unknown }> };
              if (!Array.isArray(rows)) throw new Error('Expected { rows: [...] }');
              upsertMany(table, rows);
              reply(200, { ok: true });
            } catch (e) {
              reply(400, { error: String(e) });
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          if (key) sqlite.prepare(`DELETE FROM "${table}" WHERE pk = ?`).run(key);
          else sqlite.prepare(`DELETE FROM "${table}"`).run();
          return reply(200, { ok: true });
        }

        next();
      });
    },
  };
}
