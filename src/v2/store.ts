import Dexie, { type Table } from 'dexie';
import { needKey } from '../utils/need-model';
import type { FieldRead } from './field-read';
import type { PinRecord } from './pins';

interface FieldReadRecord {
  key: string;
  needName: string;
  fieldRead: FieldRead;
  createdAt: number;
}

/** V2's own database: V1's schema and tables are left untouched. */
class V2DB extends Dexie {
  fieldReads!: Table<FieldReadRecord, string>;
  pins!: Table<PinRecord, string>;

  constructor() {
    super('ItropaV2DB');
    this.version(1).stores({ fieldReads: 'key, createdAt' });
    this.version(2).stores({ fieldReads: 'key, createdAt', pins: 'key, createdAt' });
  }
}

export const v2db = new V2DB();

export async function saveFieldRead(needName: string, fieldRead: FieldRead): Promise<void> {
  await v2db.fieldReads.put({ key: needKey(needName), needName, fieldRead, createdAt: Date.now() });
}

export async function getFieldRead(needName: string): Promise<FieldRead | undefined> {
  return (await v2db.fieldReads.get(needKey(needName)))?.fieldRead;
}

export async function deleteFieldRead(needName: string): Promise<void> {
  await v2db.fieldReads.delete(needKey(needName));
}
