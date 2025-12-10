import { BaseRepository } from '../base.repository';
import { db, DBPatternAnalysis } from '../db-client';
import { normalizeToId } from '../../../utils/string-helpers';

/**
 * Repository for PatternAnalysis entities
 */
export class PatternAnalysisRepository extends BaseRepository<DBPatternAnalysis, string> {
  constructor() {
    super(db.patternAnalyses);
  }

  /**
   * Save a pattern analysis result
   */
  async savePatternAnalysis(patternName: string, analyses: any[], mechanismCount: number): Promise<void> {
    const id = normalizeToId(patternName);
    const patternAnalysis: DBPatternAnalysis = {
      id,
      patternName,
      analyses,
      mechanismCount,
      createdAt: Date.now()
    };
    await this.save(patternAnalysis);
  }

  /**
   * Get a pattern analysis by pattern name
   */
  async getPatternAnalysis(patternName: string): Promise<DBPatternAnalysis | undefined> {
    const id = normalizeToId(patternName);
    return await this.get(id);
  }

  /**
   * Get all pattern analyses ordered by mechanism count (highest first)
   */
  async getAllPatternAnalyses(): Promise<DBPatternAnalysis[]> {
    return await db.patternAnalyses.orderBy('mechanismCount').reverse().toArray();
  }
}
