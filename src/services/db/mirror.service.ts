/**
 * Mirror service — syncs IndexedDB writes to the local SQLite mirror via the Vite dev server.
 * All calls are fire-and-forget and only active in development mode.
 */

const IS_DEV = import.meta.env.DEV;
const BASE = '/api/mirror';

function post(path: string, body: object): void {
  if (!IS_DEV) return;
  fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => { /* mirror is best-effort */ });
}

function del(path: string): void {
  if (!IS_DEV) return;
  fetch(`${BASE}/${path}`, { method: 'DELETE' }).catch(() => {});
}

export const mirrorService = {
  /** Upsert a record into the mirror */
  save(table: string, key: string, data: any): void {
    post(table, { key, data });
  },

  /** Remove a single record from the mirror */
  delete(table: string, key: string): void {
    del(`${table}/${encodeURIComponent(key)}`);
  },

  /** Clear all records in a mirror table */
  clear(table: string): void {
    del(table);
  },

  /** Load all mirrored data (called once on startup to restore IndexedDB) */
  async loadAll(): Promise<Record<string, any[]>> {
    if (!IS_DEV) return {};
    try {
      const res = await fetch(`${BASE}/all`);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  },
};
