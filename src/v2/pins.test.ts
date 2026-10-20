import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../services/db/db-client';
import { isPinned, livePins, loadPins, pinKey, togglePin, type PinRecord } from './pins';
import { v2db } from './store';

const pin = (over: Partial<PinRecord> = {}): PinRecord => ({
  key: 'k', kind: 'industry', needName: 'Belonging', industryId: 'a', label: 'Care circles', text: 't', createdAt: 1, ...over,
});

describe('V2 database upgrade', () => {
  it('opens a version 1 database with a field read in it, keeps the row and gives a usable pins table', async () => {
    // A browser profile from before pins existed: version 1, one field-read row.
    await v2db.delete();
    const old = new Dexie('ItropaV2DB');
    old.version(1).stores({ fieldReads: 'key, createdAt' });
    await old.open();
    await old.table('fieldReads').put({ key: 'belonging', needName: 'Belonging', fieldRead: { summary: 'kept' }, createdAt: 1 });
    old.close();

    await v2db.open();
    expect(v2db.verno).toBe(2);
    expect((await v2db.fieldReads.get('belonging'))?.needName).toBe('Belonging');
    expect(await togglePin({ kind: 'industry', needName: 'Belonging', industryId: 'a', label: 'Care circles', text: 't' })).toBe(true);
    expect(await v2db.pins.count()).toBe(1);
  });
});

describe('pins', () => {
  beforeEach(async () => { await v2db.pins.clear(); await db.needs.clear(); });

  it('toggles: first call pins, second removes, and the state is read back from storage', async () => {
    const p = { kind: 'concept' as const, needName: 'Belonging', industryId: 'a', label: 'Alpha', text: 'tag', conceptName: 'Alpha' };
    expect(await isPinned(pinKey(p))).toBe(false);
    expect(await togglePin(p)).toBe(true);
    expect(await isPinned(pinKey(p))).toBe(true);
    expect(await togglePin(p)).toBe(false);
    expect(await isPinned(pinKey(p))).toBe(false);
  });

  it('two taps at once cancel out: pinned, then removed', async () => {
    const p = { kind: 'industry' as const, needName: 'Belonging', industryId: 'a', label: 'Care', text: 't' };
    const results = await Promise.all([togglePin(p), togglePin(p)]);
    expect(results).toEqual([true, false]);
    expect(await isPinned(pinKey(p))).toBe(false);
  });

  it('keys an industry by its id and a concept by id plus concept name, with need names compared loosely', () => {
    expect(pinKey({ kind: 'industry', needName: 'Belonging', industryId: 'a' })).toBe(pinKey({ kind: 'industry', needName: ' belonging ', industryId: 'a' }));
    expect(pinKey({ kind: 'concept', needName: 'B', industryId: 'a', conceptName: 'X' })).not.toBe(pinKey({ kind: 'concept', needName: 'B', industryId: 'a', conceptName: 'Y' }));
    expect(pinKey({ kind: 'concept', needName: 'B', industryId: 'a', conceptName: 'X' })).not.toBe(pinKey({ kind: 'industry', needName: 'B', industryId: 'a' }));
  });

  it('keeps a copy of the text, cut to a short length', async () => {
    await togglePin({ kind: 'industry', needName: 'B', industryId: 'a', label: 'L', text: 'x'.repeat(1000) });
    expect((await v2db.pins.toArray())[0].text.length).toBe(280);
  });

  it('lists newest first and drops pins whose need is no longer saved', () => {
    const rows = livePins([pin({ key: '1', createdAt: 1 }), pin({ key: '2', needName: 'Gone', createdAt: 5 }), pin({ key: '3', needName: 'Sleep', createdAt: 3 })], ['Belonging', 'sleep']);
    expect(rows.map((r) => r.key)).toEqual(['3', '1']);
  });

  it('loadPins joins stored pins to the saved needs table', async () => {
    await db.needs.put({ id: 'n1', name: 'Belonging', icon: 'Users', description: 'd', eras: [], createdAt: 1, updatedAt: 1 } as never);
    await togglePin({ kind: 'industry', needName: 'Belonging', industryId: 'a', label: 'Care', text: 't' });
    await togglePin({ kind: 'industry', needName: 'Deleted', industryId: 'z', label: 'Ghost', text: 't' });
    expect((await loadPins()).map((p) => p.label)).toEqual(['Care']);
  });
});
