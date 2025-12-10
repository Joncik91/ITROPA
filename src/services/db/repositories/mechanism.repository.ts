import { BaseRepository } from '../base.repository';
import { db, DBMechanism } from '../db-client';

/**
 * Repository for Mechanism entities
 */
export class MechanismRepository extends BaseRepository<DBMechanism, string> {
  constructor() {
    super(db.mechanisms);
  }

  /**
   * Save a mechanism analysis result
   */
  async saveMechanism(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    const mechanism: DBMechanism = {
      id: expressionId,
      expressionName,
      needId,
      details,
      createdAt: Date.now()
    };
    await this.save(mechanism);
  }

  /**
   * Get mechanisms for a specific need
   */
  async getMechanismsByNeed(needId: string): Promise<DBMechanism[]> {
    return await db.mechanisms.where('needId').equals(needId).toArray();
  }

  /**
   * Search mechanisms by expression name or mechanism content
   */
  async searchMechanisms(query: string): Promise<DBMechanism[]> {
    const lowerQuery = query.toLowerCase();
    const allMechanisms = await this.toArray();
    return allMechanisms.filter(mech =>
      mech.expressionName.toLowerCase().includes(lowerQuery) ||
      mech.details.coreMechanism?.toLowerCase().includes(lowerQuery) ||
      mech.details.abstractPattern?.toLowerCase().includes(lowerQuery)
    );
  }
}
