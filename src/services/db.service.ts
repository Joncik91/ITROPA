import Dexie, { Table } from 'dexie';
import type { Need, IndustryExpression } from '../types';

// Database Schema Design:
// 1. needs - Store complete Need objects with all nested data
// 2. mechanisms - Cache mechanism analysis results
// 3. deepDives - Cache deep dive analysis results
// 4. crossPollinates - Store cross-pollination results
// 5. searchCache - Cache prior art and generation results

export interface DBNeed extends Need {
  createdAt: number;
  updatedAt: number;
}

export interface DBMechanism {
  id: string; // IndustryExpression.id
  expressionName: string;
  needId: string;
  details: {
    coreMechanism?: string;
    abstractPattern?: string;
    historicalApplications?: Array<{
      domain: string;
      era: string;
      implementation: string;
    }>;
    futureApplications?: Array<{
      domain: string;
      potential: string;
    }>;
  };
  createdAt: number;
}

export interface DBDeepDive {
  id: string; // IndustryExpression.id
  expressionName: string;
  needId: string;
  details: {
    marketOpportunity?: string;
    keyEnablers?: string[];
    challenges?: Array<{
      challenge: string;
      potentialSolution: string;
    }>;
    timeline?: string;
  };
  createdAt: number;
}

export interface DBCrossPollinate {
  id: string; // Composite of two expression IDs
  expression1Id: string;
  expression2Id: string;
  expression1Name: string;
  expression2Name: string;
  result: IndustryExpression[];
  createdAt: number;
}

export interface DBSearchCache {
  key: string; // Normalized need name
  needName: string;
  priorArt: any;
  createdAt: number;
}

class IndustryFamilyTreeDB extends Dexie {
  needs!: Table<DBNeed, string>;
  mechanisms!: Table<DBMechanism, string>;
  deepDives!: Table<DBDeepDive, string>;
  crossPollinates!: Table<DBCrossPollinate, string>;
  searchCache!: Table<DBSearchCache, string>;

  constructor() {
    super('IndustryFamilyTreeDB');
    
    this.version(1).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt'
    });
  }
}

export const db = new IndustryFamilyTreeDB();

// Database Service Methods
export class DBService {
  // ============ NEEDS ============
  
  static async saveNeed(need: Need): Promise<void> {
    const dbNeed: DBNeed = {
      ...need,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.needs.put(dbNeed);
  }

  static async updateNeed(need: Need): Promise<void> {
    const existing = await db.needs.get(need.id);
    const dbNeed: DBNeed = {
      ...need,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    await db.needs.put(dbNeed);
  }

  static async getNeed(id: string): Promise<DBNeed | undefined> {
    return await db.needs.get(id);
  }

  static async getAllNeeds(): Promise<DBNeed[]> {
    return await db.needs.orderBy('updatedAt').reverse().toArray();
  }

  static async deleteNeed(id: string): Promise<void> {
    await db.needs.delete(id);
    // Clean up related data
    await db.mechanisms.where('needId').equals(id).delete();
    await db.deepDives.where('needId').equals(id).delete();
    
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

  static async clearAllNeeds(): Promise<void> {
    await db.needs.clear();
    await db.mechanisms.clear();
    await db.deepDives.clear();
  }

  // ============ MECHANISMS ============

  static async saveMechanism(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    const mechanism: DBMechanism = {
      id: expressionId,
      expressionName,
      needId,
      details,
      createdAt: Date.now()
    };
    await db.mechanisms.put(mechanism);
  }

  static async getMechanism(expressionId: string): Promise<DBMechanism | undefined> {
    return await db.mechanisms.get(expressionId);
  }

  static async getMechanismsByNeed(needId: string): Promise<DBMechanism[]> {
    return await db.mechanisms.where('needId').equals(needId).toArray();
  }

  static async getAllMechanisms(): Promise<DBMechanism[]> {
    return await db.mechanisms.orderBy('createdAt').reverse().toArray();
  }

  // ============ DEEP DIVES ============

  static async saveDeepDive(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    const deepDive: DBDeepDive = {
      id: expressionId,
      expressionName,
      needId,
      details,
      createdAt: Date.now()
    };
    await db.deepDives.put(deepDive);
  }

  static async getDeepDive(expressionId: string): Promise<DBDeepDive | undefined> {
    return await db.deepDives.get(expressionId);
  }

  static async getDeepDivesByNeed(needId: string): Promise<DBDeepDive[]> {
    return await db.deepDives.where('needId').equals(needId).toArray();
  }

  // ============ CROSS-POLLINATION ============

  static async saveCrossPollinate(expr1: IndustryExpression, expr2: IndustryExpression, result: IndustryExpression[]): Promise<void> {
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
    await db.crossPollinates.put(crossPollinate);
  }

  static async getCrossPollinate(expr1Id: string, expr2Id: string): Promise<DBCrossPollinate | undefined> {
    const id = [expr1Id, expr2Id].sort().join('_');
    return await db.crossPollinates.get(id);
  }

  static async getAllCrossPollinates(): Promise<DBCrossPollinate[]> {
    return await db.crossPollinates.orderBy('createdAt').reverse().toArray();
  }

  // ============ SEARCH CACHE ============

  static async saveSearchCache(needName: string, priorArt: any): Promise<void> {
    const key = needName.toLowerCase().trim();
    const cache: DBSearchCache = {
      key,
      needName,
      priorArt,
      createdAt: Date.now()
    };
    await db.searchCache.put(cache);
  }

  static async getSearchCache(needName: string): Promise<DBSearchCache | undefined> {
    const key = needName.toLowerCase().trim();
    return await db.searchCache.get(key);
  }

  // ============ SEARCH & LOOKUP ============

  static async searchNeeds(query: string): Promise<DBNeed[]> {
    const lowerQuery = query.toLowerCase();
    const allNeeds = await db.needs.toArray();
    return allNeeds.filter(need => 
      need.name.toLowerCase().includes(lowerQuery) ||
      need.description.toLowerCase().includes(lowerQuery)
    );
  }

  static async searchExpressions(query: string): Promise<Array<{ need: DBNeed, expression: IndustryExpression, path: string[] }>> {
    const lowerQuery = query.toLowerCase();
    const allNeeds = await db.needs.toArray();
    const results: Array<{ need: DBNeed, expression: IndustryExpression, path: string[] }> = [];

    const searchInExpressions = (expressions: IndustryExpression[], need: DBNeed, path: string[] = []) => {
      expressions.forEach(expr => {
        if (expr.name.toLowerCase().includes(lowerQuery) || 
            expr.mutation.toLowerCase().includes(lowerQuery) ||
            expr.insight.toLowerCase().includes(lowerQuery)) {
          results.push({ need, expression: expr, path: [...path, expr.name] });
        }
        if (expr.children?.length) {
          searchInExpressions(expr.children, need, [...path, expr.name]);
        }
      });
    };

    allNeeds.forEach(need => {
      need.eras.forEach(era => {
        if (Array.isArray(era.expressions) && era.expressions.length > 0 && typeof era.expressions[0] === 'object') {
          searchInExpressions(era.expressions as IndustryExpression[], need);
        }
      });
    });

    return results;
  }

  static async searchMechanisms(query: string): Promise<DBMechanism[]> {
    const lowerQuery = query.toLowerCase();
    const allMechanisms = await db.mechanisms.toArray();
    return allMechanisms.filter(mech => 
      mech.expressionName.toLowerCase().includes(lowerQuery) ||
      mech.details.coreMechanism?.toLowerCase().includes(lowerQuery) ||
      mech.details.abstractPattern?.toLowerCase().includes(lowerQuery)
    );
  }

  static async searchDeepDives(query: string): Promise<DBDeepDive[]> {
    const lowerQuery = query.toLowerCase();
    const allDives = await db.deepDives.toArray();
    return allDives.filter(dive => 
      dive.expressionName.toLowerCase().includes(lowerQuery) ||
      dive.details.marketOpportunity?.toLowerCase().includes(lowerQuery)
    );
  }

  static async getRecentActivity(limit: number = 10) {
    const needs = await db.needs.orderBy('updatedAt').reverse().limit(limit).toArray();
    const mechanisms = await db.mechanisms.orderBy('createdAt').reverse().limit(limit).toArray();
    const deepDives = await db.deepDives.orderBy('createdAt').reverse().limit(limit).toArray();
    const crossPollinates = await db.crossPollinates.orderBy('createdAt').reverse().limit(limit).toArray();

    const activities = [
      ...needs.map(n => ({ type: 'need', data: n, timestamp: n.updatedAt })),
      ...mechanisms.map(m => ({ type: 'mechanism', data: m, timestamp: m.createdAt })),
      ...deepDives.map(d => ({ type: 'deepDive', data: d, timestamp: d.createdAt })),
      ...crossPollinates.map(c => ({ type: 'crossPollinate', data: c, timestamp: c.createdAt }))
    ];

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // ============ UTILITY ============

  static async clearAllData(): Promise<void> {
    await db.needs.clear();
    await db.mechanisms.clear();
    await db.deepDives.clear();
    await db.crossPollinates.clear();
    await db.searchCache.clear();
  }

  static async exportAllData() {
    return {
      needs: await db.needs.toArray(),
      mechanisms: await db.mechanisms.toArray(),
      deepDives: await db.deepDives.toArray(),
      crossPollinates: await db.crossPollinates.toArray(),
      searchCache: await db.searchCache.toArray()
    };
  }

  static async getDatabaseStats() {
    const needsCount = await db.needs.count();
    const mechanismsCount = await db.mechanisms.count();
    const deepDivesCount = await db.deepDives.count();
    const crossPollinatesCount = await db.crossPollinates.count();
    const cacheCount = await db.searchCache.count();

    return {
      needs: needsCount,
      mechanisms: mechanismsCount,
      deepDives: deepDivesCount,
      crossPollinates: crossPollinatesCount,
      searchCache: cacheCount,
      total: needsCount + mechanismsCount + deepDivesCount + crossPollinatesCount + cacheCount
    };
  }

  static async cleanupOrphanedData(): Promise<{ mechanisms: number; deepDives: number; crossPollinates: number }> {
    const removed = { mechanisms: 0, deepDives: 0, crossPollinates: 0 };
    
    // Get all valid need IDs
    const allNeeds = await db.needs.toArray();
    const validNeedIds = new Set(allNeeds.map(n => n.id));
    
    // Build set of all valid expression IDs
    const validExpressionIds = new Set<string>();
    allNeeds.forEach(need => {
      need.eras.forEach(era => {
        if (Array.isArray(era.expressions)) {
          era.expressions.forEach((expr: any) => {
            if (typeof expr === 'object' && expr.id) {
              validExpressionIds.add(expr.id);
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
    
    // Clean up orphaned mechanisms
    const allMechanisms = await db.mechanisms.toArray();
    for (const mech of allMechanisms) {
      if (!validNeedIds.has(mech.needId) || !validExpressionIds.has(mech.id)) {
        await db.mechanisms.delete(mech.id);
        removed.mechanisms++;
      }
    }
    
    // Clean up orphaned deep dives
    const allDeepDives = await db.deepDives.toArray();
    for (const dive of allDeepDives) {
      if (!validNeedIds.has(dive.needId) || !validExpressionIds.has(dive.id)) {
        await db.deepDives.delete(dive.id);
        removed.deepDives++;
      }
    }
    
    // Clean up orphaned cross-pollinations
    const allCrossPollinates = await db.crossPollinates.toArray();
    for (const cp of allCrossPollinates) {
      if (!validExpressionIds.has(cp.expression1Id) || !validExpressionIds.has(cp.expression2Id)) {
        await db.crossPollinates.delete(cp.id);
        removed.crossPollinates++;
      }
    }
    
    return removed;
  }
}
