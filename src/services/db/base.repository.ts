import { Table } from 'dexie';

/**
 * Generic base repository providing CRUD operations for any entity type.
 * Implements DRY principle by centralizing common database operations.
 *
 * @template T - The entity type (must have createdAt)
 * @template K - The primary key type (defaults to string)
 */
export abstract class BaseRepository<T extends { createdAt: number }, K = string> {
  constructor(protected table: Table<T, K>) {}

  /**
   * Save or update an entity
   */
  async save(entity: T): Promise<void> {
    await this.table.put(entity as any);
  }

  /**
   * Get an entity by its primary key
   */
  async get(key: K): Promise<T | undefined> {
    return await this.table.get(key);
  }

  /**
   * Get all entities, ordered by creation date (newest first)
   */
  async getAll(): Promise<T[]> {
    return await this.table.orderBy('createdAt').reverse().toArray();
  }

  /**
   * Delete an entity by its primary key
   */
  async delete(key: K): Promise<void> {
    await this.table.delete(key);
  }

  /**
   * Clear all entities from the table
   */
  async clear(): Promise<void> {
    await this.table.clear();
  }

  /**
   * Count total entities in the table
   */
  async count(): Promise<number> {
    return await this.table.count();
  }

  /**
   * Get all entities as array (without ordering)
   */
  async toArray(): Promise<T[]> {
    return await this.table.toArray();
  }
}
