import { BaseRepository } from '../base.repository';
import { db, DBNeed, ALL_TABLES } from '../db-client';
import { collectExpressionIds, needKey } from '../../../utils/need-model';
import { normalizeToId } from '../../../utils/string-helpers';
import type { Need } from '../../../types';

/**
 * Repository for Need entities with cascade delete logic
 */
export class NeedRepository extends BaseRepository<DBNeed, string> {
  constructor() {
    super(db.needs);
  }

  /** Insert or update, preserving the original creation time. */
  async upsertNeed(need: Need): Promise<DBNeed> {
    return db.transaction('rw', db.needs, async () => {
      const existing = await db.needs.get(need.id);
      const now = Date.now();
      const record: DBNeed = { ...need, createdAt: existing?.createdAt ?? now, updatedAt: now };
      await db.needs.put(record);
      return record;
    });
  }

  /**
   * Get needs ordered by update time (newest first)
   */
  async getAllNeeds(): Promise<DBNeed[]> {
    return await db.needs.orderBy('updatedAt').reverse().toArray();
  }

  async findByName(name: string): Promise<DBNeed | undefined> {
    const key = needKey(name);
    return db.needs.filter((n) => needKey(n.name) === key).first();
  }

  /**
   * Delete a need and everything derived from it, atomically.
   */
  async deleteNeed(id: string): Promise<void> {
    await db.transaction('rw', ALL_TABLES.map((t) => db.table(t)), async () => {
      const need = await db.needs.get(id);
      if (!need) return;
      const exprIds = [...collectExpressionIds(need)];

      await db.needs.delete(id);
      await db.mechanisms.where('needId').equals(id).delete();
      await db.deepDives.where('needId').equals(id).delete();
      await db.chainAnalyses.where('needId').equals(id).delete();
      await db.appConcepts.where('needId').equals(id).delete();
      // Analyses keyed by expression id but saved before needId was tracked correctly.
      await db.mechanisms.bulkDelete(exprIds);
      await db.deepDives.bulkDelete(exprIds);
      await db.chainAnalyses.bulkDelete(exprIds);
      await db.appConcepts.bulkDelete(exprIds);

      if (exprIds.length) {
        const gone = new Set(exprIds);
        const crossIds = (await db.crossPollinates.toArray())
          .filter((cp) => gone.has(cp.expression1Id) || gone.has(cp.expression2Id))
          .map((cp) => cp.id);
        await db.crossPollinates.bulkDelete(crossIds);
      }

      // Name-keyed caches belong to this need unless another need shares its name.
      const sameName = await db.needs.filter((n) => needKey(n.name) === needKey(need.name)).count();
      if (sameName === 0) {
        await db.searchCache.delete(needKey(need.name));
        await db.priorArtAnalyses.delete(normalizeToId(need.name));
      }
    });
  }

  /**
   * Search needs by name or description
   */
  async searchNeeds(query: string): Promise<DBNeed[]> {
    const lowerQuery = query.toLowerCase();
    const allNeeds = await this.toArray();
    return allNeeds.filter(need =>
      need.name.toLowerCase().includes(lowerQuery) ||
      (need.description ?? '').toLowerCase().includes(lowerQuery)
    );
  }
}
