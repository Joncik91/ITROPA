/**
 * Dev-only mirror of IndexedDB into a local SQLite file (see vite-plugin-sqlite-mirror.ts),
 * so data survives browser storage resets during development.
 *
 * Implemented as Dexie DBCore middleware, so *every* write is mirrored — including cascade
 * deletes, bulk operations and table clears that bypass the repositories.
 */

import type { DBCore, DBCoreMutateRequest, DBCoreTable, Middleware } from 'dexie';

const ENABLED = import.meta.env.DEV && typeof window !== 'undefined';
const BASE = '/api/mirror';

let suppressed = false;

function send(path: string, init: RequestInit): void {
  fetch(`${BASE}/${path}`, init).catch(() => { /* mirror is best-effort */ });
}

function primaryKeyOf(table: DBCoreTable, value: any, fallback: unknown): string {
  const keyPath = table.schema.primaryKey.keyPath;
  const key = typeof keyPath === 'string' ? value?.[keyPath] : fallback;
  return String(key ?? fallback);
}

function mirror(table: DBCoreTable, req: DBCoreMutateRequest, resultKeys: unknown[] | undefined): void {
  if (suppressed) return;
  const name = table.name;
  switch (req.type) {
    case 'add':
    case 'put': {
      const rows = req.values.map((value, i) => ({ key: primaryKeyOf(table, value, resultKeys?.[i] ?? req.keys?.[i]), data: value }));
      if (rows.length) send(name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
      break;
    }
    case 'delete':
      for (const key of req.keys) send(`${name}/${encodeURIComponent(String(key))}`, { method: 'DELETE' });
      break;
    case 'deleteRange':
      // Table.clear() issues an unbounded range; bounded primary-key ranges are not used by the app.
      send(name, { method: 'DELETE' });
      break;
  }
}

export const mirrorMiddleware: Middleware<DBCore> = {
  stack: 'dbcore',
  name: 'sqlite-mirror',
  create(down) {
    if (!ENABLED) return down;
    return {
      ...down,
      table(tableName) {
        const table = down.table(tableName);
        return {
          ...table,
          async mutate(req) {
            const res = await table.mutate(req);
            mirror(table, req, res.results);
            return res;
          },
        };
      },
    };
  },
};

export const mirrorService = {
  /** Load all mirrored data (called once on startup to restore IndexedDB). */
  async loadAll(): Promise<Record<string, unknown[]>> {
    if (!ENABLED) return {};
    try {
      const res = await fetch(`${BASE}/all`);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  },

  /** Run writes that originate *from* the mirror without echoing them back to it. */
  async withoutMirroring<T>(fn: () => Promise<T>): Promise<T> {
    suppressed = true;
    try {
      return await fn();
    } finally {
      suppressed = false;
    }
  },
};
