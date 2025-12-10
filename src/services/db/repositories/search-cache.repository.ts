import { BaseRepository } from '../base.repository';
import { db, DBSearchCache } from '../db-client';
import { normalizeToKey } from '../../../utils/string-helpers';

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
  async saveSearchCache(needName: string, priorArt: any): Promise<void> {
    const key = normalizeToKey(needName);
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
    const key = normalizeToKey(needName);
    return await this.get(key);
  }
}
