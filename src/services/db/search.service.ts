import { db, DBNeed } from './db-client';
import type { IndustryExpression } from '../../types';

/**
 * Service for cross-entity search operations
 */
export class SearchService {
  /**
   * Search for industry expressions across all needs
   */
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

  /**
   * Get recent activity across all entity types
   */
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
}
