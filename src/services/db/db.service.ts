import { db } from './db-client';
import { NeedRepository } from './repositories/need.repository';
import { MechanismRepository } from './repositories/mechanism.repository';
import { DeepDiveRepository } from './repositories/deep-dive.repository';
import { CrossPollinateRepository } from './repositories/cross-pollinate.repository';
import { PatternAnalysisRepository } from './repositories/pattern-analysis.repository';
import { PriorArtAnalysisRepository } from './repositories/prior-art-analysis.repository';
import { ChainAnalysisRepository } from './repositories/chain-analysis.repository';
import { SearchCacheRepository } from './repositories/search-cache.repository';
import { AppConceptRepository } from './repositories/app-concept.repository';
import { SearchService } from './search.service';
import type { Need, IndustryExpression, AppConcept } from '../../types';

/**
 * Facade service that delegates to specialized repositories.
 * Maintains the same API as the original DBService for backwards compatibility.
 */
export class DBService {
  // Repository instances
  private static needRepo = new NeedRepository();
  private static mechanismRepo = new MechanismRepository();
  private static deepDiveRepo = new DeepDiveRepository();
  private static crossPollinateRepo = new CrossPollinateRepository();
  private static patternAnalysisRepo = new PatternAnalysisRepository();
  private static priorArtAnalysisRepo = new PriorArtAnalysisRepository();
  private static chainAnalysisRepo = new ChainAnalysisRepository();
  private static searchCacheRepo = new SearchCacheRepository();
  private static appConceptRepo = new AppConceptRepository();

  // ============ NEEDS ============

  static async saveNeed(need: Need): Promise<void> {
    return this.needRepo.saveNeed(need);
  }

  static async updateNeed(need: Need): Promise<void> {
    return this.needRepo.updateNeed(need);
  }

  static async getNeed(id: string) {
    return this.needRepo.get(id);
  }

  static async getAllNeeds() {
    return this.needRepo.getAllNeeds();
  }

  static async deleteNeed(id: string): Promise<void> {
    return this.needRepo.deleteNeed(id);
  }

  static async clearAllNeeds(): Promise<void> {
    return this.needRepo.clearAllNeeds();
  }

  // ============ MECHANISMS ============

  static async saveMechanism(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    return this.mechanismRepo.saveMechanism(expressionId, expressionName, needId, details);
  }

  static async getMechanism(expressionId: string) {
    return this.mechanismRepo.get(expressionId);
  }

  static async getMechanismsByNeed(needId: string) {
    return this.mechanismRepo.getMechanismsByNeed(needId);
  }

  static async getAllMechanisms() {
    return this.mechanismRepo.getAll();
  }

  // ============ DEEP DIVES ============

  static async saveDeepDive(expressionId: string, expressionName: string, needId: string, details: any): Promise<void> {
    return this.deepDiveRepo.saveDeepDive(expressionId, expressionName, needId, details);
  }

  static async getDeepDive(expressionId: string, needId: string) {
    return this.deepDiveRepo.getDeepDive(expressionId, needId);
  }

  static async getDeepDivesByNeed(needId: string) {
    return this.deepDiveRepo.getDeepDivesByNeed(needId);
  }

  static async getAllDeepDives() {
    return this.deepDiveRepo.toArray();
  }

  // ============ CROSS-POLLINATION ============

  static async saveCrossPollinate(expr1: IndustryExpression, expr2: IndustryExpression, result: IndustryExpression[]): Promise<void> {
    return this.crossPollinateRepo.saveCrossPollinate(expr1, expr2, result);
  }

  static async getCrossPollinate(expr1Id: string, expr2Id: string) {
    return this.crossPollinateRepo.getCrossPollinate(expr1Id, expr2Id);
  }

  static async getAllCrossPollinates() {
    return this.crossPollinateRepo.getAll();
  }

  // ============ PATTERN ANALYSES ============

  static async savePatternAnalysis(patternName: string, analyses: any[], mechanismCount: number): Promise<void> {
    return this.patternAnalysisRepo.savePatternAnalysis(patternName, analyses, mechanismCount);
  }

  static async getPatternAnalysis(patternName: string) {
    return this.patternAnalysisRepo.getPatternAnalysis(patternName);
  }

  static async getAllPatternAnalyses() {
    return this.patternAnalysisRepo.getAllPatternAnalyses();
  }

  // ============ PRIOR ART ANALYSES ============

  static async savePriorArtAnalysis(needName: string, analyses: any[]): Promise<void> {
    return this.priorArtAnalysisRepo.savePriorArtAnalysis(needName, analyses);
  }

  static async getPriorArtAnalysis(needName: string) {
    return this.priorArtAnalysisRepo.getPriorArtAnalysis(needName);
  }

  static async getAllPriorArtAnalyses() {
    return this.priorArtAnalysisRepo.getAll();
  }

  // ============ CHAIN ANALYSES ============

  static async saveChainAnalysis(expressionId: string, expressionName: string, needId: string, analyses: any[]): Promise<void> {
    return this.chainAnalysisRepo.saveChainAnalysis(expressionId, expressionName, needId, analyses);
  }

  static async getChainAnalysis(expressionId: string) {
    return this.chainAnalysisRepo.get(expressionId);
  }

  static async getChainAnalysesByNeed(needId: string) {
    return this.chainAnalysisRepo.getChainAnalysesByNeed(needId);
  }

  static async getAllChainAnalyses() {
    return this.chainAnalysisRepo.getAll();
  }

  // ============ SEARCH CACHE ============

  static async saveSearchCache(needName: string, priorArt: any): Promise<void> {
    return this.searchCacheRepo.saveSearchCache(needName, priorArt);
  }

  static async getSearchCache(needName: string) {
    return this.searchCacheRepo.getSearchCache(needName);
  }

  // ============ APP CONCEPTS ============

  static async saveAppConcepts(
    industryId: string,
    industryName: string,
    needId: string,
    concepts: AppConcept[],
    deepDiveAvailable: boolean
  ): Promise<void> {
    return this.appConceptRepo.saveAppConcepts(industryId, industryName, needId, concepts, deepDiveAvailable);
  }

  static async getAppConcepts(industryId: string) {
    return this.appConceptRepo.getAppConcepts(industryId);
  }

  static async getAppConceptsByNeed(needId: string) {
    return this.appConceptRepo.getAppConceptsByNeed(needId);
  }

  static async getAllAppConcepts() {
    return this.appConceptRepo.getAll();
  }

  // ============ SEARCH & LOOKUP ============

  static async searchNeeds(query: string) {
    return this.needRepo.searchNeeds(query);
  }

  static async searchExpressions(query: string) {
    return SearchService.searchExpressions(query);
  }

  static async searchMechanisms(query: string) {
    return this.mechanismRepo.searchMechanisms(query);
  }

  static async searchDeepDives(query: string) {
    return this.deepDiveRepo.searchDeepDives(query);
  }

  static async getRecentActivity(limit: number = 10) {
    return SearchService.getRecentActivity(limit);
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
