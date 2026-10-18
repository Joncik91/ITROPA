import { BaseRepository } from '../base.repository';
import { db, DBSearchCache } from '../db-client';
import { needKey } from '../../../utils/need-model';
import type { PriorArt } from '../../../types';

/**
 * Repository for SearchCache entities
 */
export class SearchCacheRepository extends BaseRepository<DBSearchCache, string> {
  constructor() {
    super(db.searchCache);
  }

  /**
   * Save a search cache entry
   */
  async saveSearchCache(needName: string, priorArt: PriorArt): Promise<void> {
    const key = needKey(needName);
    const cache: DBSearchCache = {
      key,
      needName,
      priorArt,
      createdAt: Date.now()
    };
    await this.save(cache);
  }

  /**
   * Get a search cache entry by need name
   */
  async getSearchCache(needName: string): Promise<DBSearchCache | undefined> {
    const key = needKey(needName);
    return await this.get(key);
  }
}
