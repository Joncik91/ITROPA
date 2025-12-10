import { BaseRepository } from '../base.repository';
import { db, DBCrossPollinate } from '../db-client';
import type { IndustryExpression } from '../../../types';

/**
 * Repository for CrossPollinate entities
 */
export class CrossPollinateRepository extends BaseRepository<DBCrossPollinate, string> {
  constructor() {
    super(db.crossPollinates);
  }

  /**
   * Save a cross-pollination result
   */
  async saveCrossPollinate(expr1: IndustryExpression, expr2: IndustryExpression, result: IndustryExpression[]): Promise<void> {
    const id = [expr1.id, expr2.id].sort().join('_');
    const crossPollinate: DBCrossPollinate = {
      id,
      expression1Id: expr1.id,
      expression2Id: expr2.id,
      expression1Name: expr1.name,
      expression2Name: expr2.name,
      result,
      createdAt: Date.now()
    };
    await this.save(crossPollinate);
  }

  /**
   * Get a cross-pollination result by two expression IDs
   */
  async getCrossPollinate(expr1Id: string, expr2Id: string): Promise<DBCrossPollinate | undefined> {
    const id = [expr1Id, expr2Id].sort().join('_');
    return await this.get(id);
  }
}
