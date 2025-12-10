import { BaseRepository } from '../base.repository';
import { db, DBDeepDive } from '../db-client';

/**
 * Repository for DeepDive entities
 */
export class DeepDiveRepository extends BaseRepository<DBDeepDive, string> {
  constructor() {
    super(db.deepDives);
  }

  /**
   * Save a deep dive analysis result
   */
  async saveDeepDive(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    const deepDive: DBDeepDive = {
      id: expressionId,
      expressionName,
      needId,
      details,
      createdAt: Date.now()
    };
    await this.save(deepDive);
  }

  /**
   * Get a deep dive by expression ID and need ID
   */
  async getDeepDive(expressionId: string, needId: string): Promise<DBDeepDive | undefined> {
    const deepDives = await db.deepDives.where('id').equals(expressionId).toArray();
    return deepDives.find(dd => dd.needId === needId);
  }

  /**
   * Get deep dives for a specific need
   */
  async getDeepDivesByNeed(needId: string): Promise<DBDeepDive[]> {
    return await db.deepDives.where('needId').equals(needId).toArray();
  }

  /**
   * Search deep dives by expression name or market opportunity
   */
  async searchDeepDives(query: string): Promise<DBDeepDive[]> {
    const lowerQuery = query.toLowerCase();
    const allDives = await this.toArray();
    return allDives.filter(dive =>
      dive.expressionName.toLowerCase().includes(lowerQuery) ||
      dive.details.marketOpportunity?.toLowerCase().includes(lowerQuery)
    );
  }
}
