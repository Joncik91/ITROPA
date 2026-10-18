import { db, ALL_TABLES, migrateToV6 } from './db-client';
import { mirrorService } from './mirror.service';
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
import { collectExpressionIds } from '../../utils/need-model';
import type { Need, IndustryExpression, AppConcept, DeepDiveDetails, MechanismDetails, PriorArt } from '../../types';

const allTables = () => ALL_TABLES.map((t) => db.table(t));

/**
 * Facade over the repositories. Components and hooks go through this, never through Dexie.
 */
export class DBService {
  private static needRepo = new NeedRepository();
  private static mechanismRepo = new MechanismRepository();
  private static deepDiveRepo = new DeepDiveRepository();
  private static crossPollinateRepo = new CrossPollinateRepository();
  private static patternAnalysisRepo = new PatternAnalysisRepository();
  private static priorArtAnalysisRepo = new PriorArtAnalysisRepository();
  private static chainAnalysisRepo = new ChainAnalysisRepository();
  private static searchCacheRepo = new SearchCacheRepository();
  private static appConceptRepo = new AppConceptRepository();

  // ============ MIRROR SYNC ============

  /**
   * On startup: restore IndexedDB from the SQLite mirror (dev only; no-op in production).
   * Mirrored rows may predate the v6 ID migration, so it is re-applied (it is idempotent).
   */
  static async syncFromMirror(): Promise<void> {
    const data = await mirrorService.loadAll();
    if (!Object.values(data).some((rows) => rows?.length)) return;

    await mirrorService.withoutMirroring(() =>
      db.transaction('rw', allTables(), async () => {
        for (const table of ALL_TABLES) {
          const rows = data[table];
          if (rows?.length) await db.table(table).bulkPut(rows);
        }
      }),
    );
    // Separate transaction so its re-keys (and deletion of old-ID rows) reach the mirror too.
    await db.transaction('rw', allTables(), (tx) => migrateToV6(tx));
    console.info('🔄 Restored from SQLite mirror');
  }

  // ============ NEEDS ============

  static async saveNeed(need: Need) {
    return this.needRepo.upsertNeed(need);
  }

  static async getNeed(id: string) {
    return this.needRepo.get(id);
  }

  static async findNeedByName(name: string) {
    return this.needRepo.findByName(name);
  }

  /** The saved need whose tree contains the expression, if any. */
  static async findNeedIdByExpression(expressionId: string): Promise<string | undefined> {
    const needs = await db.needs.toArray();
    return needs.find((n) => collectExpressionIds(n).has(expressionId))?.id;
  }

  static async getAllNeeds() {
    return this.needRepo.getAllNeeds();
  }

  static async deleteNeed(id: string): Promise<void> {
    return this.needRepo.deleteNeed(id);
  }

  // ============ MECHANISMS ============

  static async saveMechanism(expressionId: string, expressionName: string, needId: string, details: MechanismDetails[]): Promise<void> {
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

  static async saveDeepDive(expressionId: string, expressionName: string, needId: string, details: DeepDiveDetails): Promise<void> {
    return this.deepDiveRepo.saveDeepDive(expressionId, expressionName, needId, details);
  }

  static async getDeepDiveById(expressionId: string) {
    return this.deepDiveRepo.get(expressionId);
  }

  static async getDeepDivesByNeed(needId: string) {
    return this.deepDiveRepo.getDeepDivesByNeed(needId);
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

  // ============ PRIOR ART ANALYSES ============

  static async savePriorArtAnalysis(needName: string, analyses: any[]): Promise<void> {
    return this.priorArtAnalysisRepo.savePriorArtAnalysis(needName, analyses);
  }

  static async getPriorArtAnalysis(needName: string) {
    return this.priorArtAnalysisRepo.getPriorArtAnalysis(needName);
  }

  // ============ CHAIN ANALYSES ============

  static async saveChainAnalysis(expressionId: string, expressionName: string, needId: string, analyses: any[]): Promise<void> {
    return this.chainAnalysisRepo.saveChainAnalysis(expressionId, expressionName, needId, analyses);
  }

  static async getChainAnalysesByNeed(needId: string) {
    return this.chainAnalysisRepo.getChainAnalysesByNeed(needId);
  }

  // ============ SEARCH CACHE (prior art per need name) ============

  static async saveSearchCache(needName: string, priorArt: PriorArt): Promise<void> {
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

  /** Wipe every table atomically. */
  static async clearAllData(): Promise<void> {
    await db.transaction('rw', allTables(), async () => {
      for (const table of ALL_TABLES) await db.table(table).clear();
    });
  }

  static async exportAllData(): Promise<Record<string, unknown[]>> {
    return db.transaction('r', allTables(), async () => {
      const out: Record<string, unknown[]> = {};
      for (const table of ALL_TABLES) out[table] = await db.table(table).toArray();
      return out;
    });
  }

  static async getDatabaseStats() {
    const [needs, mechanisms, deepDives, crossPollinates, appConcepts] = await Promise.all([
      db.needs.count(), db.mechanisms.count(), db.deepDives.count(), db.crossPollinates.count(), db.appConcepts.count(),
    ]);
    return { needs, mechanisms, deepDives, crossPollinates, appConcepts, total: needs + mechanisms + deepDives + crossPollinates + appConcepts };
  }

  /** Remove analyses whose expression no longer exists in any saved need. */
  static async cleanupOrphanedData(): Promise<{ mechanisms: number; deepDives: number; crossPollinates: number; other: number }> {
    return db.transaction('rw', allTables(), async () => {
      const valid = new Set<string>();
      for (const need of await db.needs.toArray()) for (const id of collectExpressionIds(need)) valid.add(id);

      const prune = async (table: 'mechanisms' | 'deepDives' | 'chainAnalyses' | 'appConcepts') => {
        const orphanIds = (await db.table(table).toCollection().primaryKeys()).filter((k) => !valid.has(String(k)));
        await db.table(table).bulkDelete(orphanIds);
        return orphanIds.length;
      };

      const mechanisms = await prune('mechanisms');
      const deepDives = await prune('deepDives');
      const other = (await prune('chainAnalyses')) + (await prune('appConcepts'));

      const crossIds = (await db.crossPollinates.toArray())
        .filter((cp) => !valid.has(cp.expression1Id) || !valid.has(cp.expression2Id))
        .map((cp) => cp.id);
      await db.crossPollinates.bulkDelete(crossIds);

      return { mechanisms, deepDives, crossPollinates: crossIds.length, other };
    });
  }
}
