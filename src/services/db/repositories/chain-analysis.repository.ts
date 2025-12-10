import { BaseRepository } from '../base.repository';
import { db, DBChainAnalysis } from '../db-client';

/**
 * Repository for ChainAnalysis entities
 */
export class ChainAnalysisRepository extends BaseRepository<DBChainAnalysis, string> {
  constructor() {
    super(db.chainAnalyses);
  }

  /**
   * Save a chain analysis result
   */
  async saveChainAnalysis(expressionId: string, expressionName: string, needId: string, analyses: any[]): Promise<void> {
    const chainAnalysis: DBChainAnalysis = {
      id: expressionId,
      expressionId,
      expressionName,
      needId,
      analyses,
      createdAt: Date.now()
    };
    await this.save(chainAnalysis);
  }

  /**
   * Get chain analyses for a specific need
   */
  async getChainAnalysesByNeed(needId: string): Promise<DBChainAnalysis[]> {
    return await db.chainAnalyses.where('needId').equals(needId).toArray();
  }
}
