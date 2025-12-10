import { BaseRepository } from '../base.repository';
import { db, DBNeed } from '../db-client';
import type { Need } from '../../../types';

/**
 * Repository for Need entities with cascade delete logic
 */
export class NeedRepository extends BaseRepository<DBNeed, string> {
  constructor() {
    super(db.needs);
  }

  /**
   * Save a new need
   */
  async saveNeed(need: Need): Promise<void> {
    const dbNeed: DBNeed = {
      ...need,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await this.save(dbNeed);
  }

  /**
   * Update an existing need
   */
  async updateNeed(need: Need): Promise<void> {
    const existing = await this.get(need.id);
    const dbNeed: DBNeed = {
      ...need,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    await this.save(dbNeed);
  }

  /**
   * Get needs ordered by update time (newest first)
   */
  async getAllNeeds(): Promise<DBNeed[]> {
    return await db.needs.orderBy('updatedAt').reverse().toArray();
  }

  /**
   * Delete a need and cascade delete related entities
   */
  async deleteNeed(id: string): Promise<void> {
    await this.delete(id);

    // Clean up related data
    await db.mechanisms.where('needId').equals(id).delete();
    await db.deepDives.where('needId').equals(id).delete();
    await db.chainAnalyses.where('needId').equals(id).delete();

    // Clean up orphaned cross-pollinations (where either source expression no longer exists)
    const allCrossPollinates = await db.crossPollinates.toArray();
    const allNeeds = await db.needs.toArray();

    // Build a set of all valid expression IDs
    const validExpressionIds = new Set<string>();
    allNeeds.forEach(need => {
      need.eras.forEach(era => {
        if (Array.isArray(era.expressions)) {
          era.expressions.forEach((expr: any) => {
            if (typeof expr === 'object' && expr.id) {
              validExpressionIds.add(expr.id);
              // Also add children IDs
              const addChildrenIds = (expression: any) => {
                if (expression.children) {
                  expression.children.forEach((child: any) => {
                    validExpressionIds.add(child.id);
                    addChildrenIds(child);
                  });
                }
              };
              addChildrenIds(expr);
            }
          });
        }
      });
    });

    // Delete cross-pollinations with invalid source expressions
    for (const cp of allCrossPollinates) {
      if (!validExpressionIds.has(cp.expression1Id) || !validExpressionIds.has(cp.expression2Id)) {
        await db.crossPollinates.delete(cp.id);
      }
    }
  }

  /**
   * Clear all needs and related data
   */
  async clearAllNeeds(): Promise<void> {
    await this.clear();
    await db.mechanisms.clear();
    await db.deepDives.clear();
    await db.patternAnalyses.clear();
    await db.priorArtAnalyses.clear();
    await db.chainAnalyses.clear();
  }

  /**
   * Search needs by name or description
   */
  async searchNeeds(query: string): Promise<DBNeed[]> {
    const lowerQuery = query.toLowerCase();
    const allNeeds = await this.toArray();
    return allNeeds.filter(need =>
      need.name.toLowerCase().includes(lowerQuery) ||
      need.description.toLowerCase().includes(lowerQuery)
    );
  }
}
