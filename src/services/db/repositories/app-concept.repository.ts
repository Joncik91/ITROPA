import { BaseRepository } from '../base.repository';
import { db, DBAppConcept } from '../db-client';
import type { AppConcept } from '../../../types';

/**
 * Repository for App Concept entities
 */
export class AppConceptRepository extends BaseRepository<DBAppConcept, string> {
  constructor() {
    super(db.appConcepts);
  }

  /**
   * Save app concepts for an industry
   */
  async saveAppConcepts(
    industryId: string,
    industryName: string,
    needId: string,
    concepts: AppConcept[],
    deepDiveAvailable: boolean
  ): Promise<void> {
    const record: DBAppConcept = {
      id: industryId,
      industryName,
      needId,
      concepts,
      deepDiveAvailable,
      createdAt: Date.now()
    };
    await this.save(record);
  }

  /**
   * Get app concepts for a specific industry
   */
  async getAppConcepts(industryId: string): Promise<DBAppConcept | undefined> {
    return await this.get(industryId);
  }

  /**
   * Get all app concepts for a need
   */
  async getAppConceptsByNeed(needId: string): Promise<DBAppConcept[]> {
    return await db.appConcepts.where('needId').equals(needId).toArray();
  }

  /**
   * Search app concepts by industry name or concept names
   */
  async searchAppConcepts(query: string): Promise<DBAppConcept[]> {
    const lowerQuery = query.toLowerCase();
    const all = await this.toArray();
    return all.filter(record =>
      record.industryName.toLowerCase().includes(lowerQuery) ||
      record.concepts.some(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.tagline.toLowerCase().includes(lowerQuery)
      )
    );
  }
}
