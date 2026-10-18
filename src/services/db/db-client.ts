import Dexie, { Table, type Transaction } from 'dexie';
import type { Need, IndustryExpression, AppConcept, DeepDiveDetails, MechanismDetails, PriorArt } from '../../types';
import { rekeyNeedExpressions, resolveExpression } from './migrations';
import { mirrorMiddleware } from './mirror.service';

// Tables:
// needs            - complete Need objects (eras, tree)
// mechanisms       - mechanism analyses, keyed by expression id
// deepDives        - deep dive analyses, keyed by expression id
// crossPollinates  - cross-pollination results, keyed by sorted expression id pair
// searchCache      - prior art per normalized need name
// patternAnalyses  - pattern analyses, keyed by normalized pattern name
// priorArtAnalyses - prior art framework analyses, keyed by normalized need name
// chainAnalyses    - inspiration chain analyses, keyed by expression id
// appConcepts      - app concepts, keyed by expression id

export interface DBNeed extends Need {
  createdAt: number;
  updatedAt: number;
}

export interface DBMechanism {
  id: string; // IndustryExpression.id
  expressionName: string;
  needId: string;
  details: MechanismDetails[];
  createdAt: number;
}

export interface DBDeepDive {
  id: string; // IndustryExpression.id
  expressionName: string;
  needId: string;
  details: DeepDiveDetails;
  createdAt: number;
}

export interface DBCrossPollinate {
  id: string; // Sorted pair of expression IDs
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
  priorArt: PriorArt;
  createdAt: number;
}

export interface DBPatternAnalysis {
  id: string; // Pattern name normalized as key
  patternName: string;
  analyses: any[]; // PatternAnalysis objects (one per framework)
  mechanismCount: number;
  createdAt: number;
}

export interface DBPriorArtAnalysis {
  id: string; // Need name normalized as key
  needName: string;
  analyses: any[]; // PriorArtAnalysis objects (one per framework)
  createdAt: number;
}

export interface DBChainAnalysis {
  id: string; // Expression ID
  expressionId: string;
  expressionName: string;
  needId: string;
  analyses: any[]; // ChainAnalysis objects (one per framework)
  createdAt: number;
}

export interface DBAppConcept {
  id: string;              // Expression ID
  industryName: string;
  needId: string;
  concepts: AppConcept[];
  deepDiveAvailable: boolean;
  createdAt: number;
}

const SCHEMA_V5 = {
  needs: 'id, name, createdAt, updatedAt',
  mechanisms: 'id, needId, expressionName, createdAt',
  deepDives: 'id, needId, expressionName, createdAt',
  crossPollinates: 'id, expression1Id, expression2Id, createdAt',
  searchCache: 'key, needName, createdAt',
  patternAnalyses: 'id, patternName, mechanismCount, createdAt',
  priorArtAnalyses: 'id, needName, createdAt',
  chainAnalyses: 'id, expressionId, needId, createdAt',
  appConcepts: 'id, industryName, needId, createdAt',
};

export const ALL_TABLES = Object.keys(SCHEMA_V5) as Array<keyof typeof SCHEMA_V5>;

/** Re-key a table whose primary key is an expression ID, fixing needId along the way. */
async function rekeyExpressionTable(
  tx: Transaction,
  tableName: string,
  nameOf: (row: any) => string | undefined,
  mapping: ReturnType<typeof rekeyNeedExpressions>,
  extra?: (row: any, newId: string) => void,
) {
  const table = tx.table(tableName);
  const rows = await table.toArray();
  for (const row of rows) {
    const ref = resolveExpression(mapping, row.id, nameOf(row), row.needId);
    if (!ref || ref.newId === row.id) continue;
    await table.delete(row.id);
    extra?.(row, ref.newId);
    await table.put({ ...row, id: ref.newId, needId: ref.needId });
  }
}

export async function migrateToV6(tx: Transaction): Promise<void> {
  const needsTable = tx.table('needs');
  const needs = await needsTable.toArray();
  const mapping = rekeyNeedExpressions(needs);
  await needsTable.bulkPut(needs);

  await rekeyExpressionTable(tx, 'mechanisms', (r) => r.expressionName, mapping);
  await rekeyExpressionTable(tx, 'deepDives', (r) => r.expressionName, mapping);
  await rekeyExpressionTable(tx, 'chainAnalyses', (r) => r.expressionName, mapping, (row, newId) => { row.expressionId = newId; });
  await rekeyExpressionTable(tx, 'appConcepts', (r) => r.industryName, mapping);

  const cross = tx.table('crossPollinates');
  for (const row of await cross.toArray()) {
    const a = resolveExpression(mapping, row.expression1Id, row.expression1Name);
    const b = resolveExpression(mapping, row.expression2Id, row.expression2Name);
    if (!a || !b) continue;
    const id = [a.newId, b.newId].sort().join('_');
    if (id === row.id) continue;
    await cross.delete(row.id);
    await cross.put({ ...row, id, expression1Id: a.newId, expression2Id: b.newId });
  }
}

class IndustryFamilyTreeDB extends Dexie {
  needs!: Table<DBNeed, string>;
  mechanisms!: Table<DBMechanism, string>;
  deepDives!: Table<DBDeepDive, string>;
  crossPollinates!: Table<DBCrossPollinate, string>;
  searchCache!: Table<DBSearchCache, string>;
  patternAnalyses!: Table<DBPatternAnalysis, string>;
  priorArtAnalyses!: Table<DBPriorArtAnalysis, string>;
  chainAnalyses!: Table<DBChainAnalysis, string>;
  appConcepts!: Table<DBAppConcept, string>;

  constructor() {
    super('IndustryFamilyTreeDB');

    this.version(1).stores({
      needs: SCHEMA_V5.needs,
      mechanisms: SCHEMA_V5.mechanisms,
      deepDives: SCHEMA_V5.deepDives,
      crossPollinates: SCHEMA_V5.crossPollinates,
      searchCache: SCHEMA_V5.searchCache,
    });
    this.version(2).stores({ patternAnalyses: SCHEMA_V5.patternAnalyses });
    this.version(3).stores({ priorArtAnalyses: SCHEMA_V5.priorArtAnalyses });
    this.version(4).stores({ chainAnalyses: SCHEMA_V5.chainAnalyses });
    this.version(5).stores({ appConcepts: SCHEMA_V5.appConcepts });
    this.version(6).stores(SCHEMA_V5).upgrade(migrateToV6);

    this.use(mirrorMiddleware);
  }
}

export const db = new IndustryFamilyTreeDB();
