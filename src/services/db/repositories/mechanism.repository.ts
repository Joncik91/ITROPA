import { BaseRepository } from '../base.repository';
import { db, DBMechanism } from '../db-client';
import type { MechanismDetails } from '../../../types';

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
  async saveMechanism(expressionId: string, expressionName: string, needId: string, details: MechanismDetails[]): Promise<void> {
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
    // Older records stored a single object; current ones store one entry per framework.
    const entries = (mech: DBMechanism): Array<Partial<MechanismDetails>> =>
      Array.isArray(mech.details) ? mech.details : mech.details ? [mech.details as Partial<MechanismDetails>] : [];
    return allMechanisms.filter(mech =>
      mech.expressionName.toLowerCase().includes(lowerQuery) ||
      entries(mech).some(d =>
        d.coreMechanism?.toLowerCase().includes(lowerQuery) ||
        d.abstractPattern?.toLowerCase().includes(lowerQuery))
    );
  }
}
