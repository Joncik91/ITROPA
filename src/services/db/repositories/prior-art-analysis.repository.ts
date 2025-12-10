import { BaseRepository } from '../base.repository';
import { db, DBPriorArtAnalysis } from '../db-client';
import { normalizeToId } from '../../../utils/string-helpers';

/**
 * Repository for PriorArtAnalysis entities
 */
export class PriorArtAnalysisRepository extends BaseRepository<DBPriorArtAnalysis, string> {
  constructor() {
    super(db.priorArtAnalyses);
  }

  /**
   * Save a prior art analysis result
   */
  async savePriorArtAnalysis(needName: string, analyses: any[]): Promise<void> {
    const id = normalizeToId(needName);
    const priorArtAnalysis: DBPriorArtAnalysis = {
      id,
      needName,
      analyses,
      createdAt: Date.now()
    };
    await this.save(priorArtAnalysis);
  }

  /**
   * Get a prior art analysis by need name
   */
  async getPriorArtAnalysis(needName: string): Promise<DBPriorArtAnalysis | undefined> {
    const id = normalizeToId(needName);
    return await this.get(id);
  }
}
