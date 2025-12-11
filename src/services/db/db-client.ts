import Dexie, { Table } from 'dexie';
import type { Need, IndustryExpression, AppConcept } from '../../types';

// Database Schema Design:
// 1. needs - Store complete Need objects with all nested data
// 2. mechanisms - Cache mechanism analysis results
// 3. deepDives - Cache deep dive analysis results
// 4. crossPollinates - Store cross-pollination results
// 5. searchCache - Cache prior art and generation results
// 6. patternAnalyses - Pattern analysis results
// 7. priorArtAnalyses - Prior art analysis results
// 8. chainAnalyses - Chain analysis results

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

export interface DBPatternAnalysis {
  id: string; // Pattern name normalized as key
  patternName: string;
  analyses: any[]; // Array of PatternAnalysis objects (5 frameworks)
  mechanismCount: number;
  createdAt: number;
}

export interface DBPriorArtAnalysis {
  id: string; // Need name normalized as key
  needName: string;
  analyses: any[]; // Array of PriorArtAnalysis objects (5 frameworks)
  createdAt: number;
}

export interface DBChainAnalysis {
  id: string; // Expression ID as key
  expressionId: string;
  expressionName: string;
  needId: string;
  analyses: any[]; // Array of ChainAnalysis objects (5 frameworks)
  createdAt: number;
}

export interface DBAppConcept {
  id: string;              // industryId
  industryName: string;
  needId: string;
  concepts: AppConcept[];
  deepDiveAvailable: boolean;
  createdAt: number;
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
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt'
    });

    // Add pattern analyses table in version 2
    this.version(2).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt',
      patternAnalyses: 'id, patternName, mechanismCount, createdAt'
    });

    // Add prior art analyses table in version 3
    this.version(3).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt',
      patternAnalyses: 'id, patternName, mechanismCount, createdAt',
      priorArtAnalyses: 'id, needName, createdAt'
    });

    // Add chain analyses table in version 4
    this.version(4).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt',
      patternAnalyses: 'id, patternName, mechanismCount, createdAt',
      priorArtAnalyses: 'id, needName, createdAt',
      chainAnalyses: 'id, expressionId, needId, createdAt'
    });

    // Add app concepts table in version 5
    this.version(5).stores({
      needs: 'id, name, createdAt, updatedAt',
      mechanisms: 'id, needId, expressionName, createdAt',
      deepDives: 'id, needId, expressionName, createdAt',
      crossPollinates: 'id, expression1Id, expression2Id, createdAt',
      searchCache: 'key, needName, createdAt',
      patternAnalyses: 'id, patternName, mechanismCount, createdAt',
      priorArtAnalyses: 'id, needName, createdAt',
      chainAnalyses: 'id, expressionId, needId, createdAt',
      appConcepts: 'id, industryName, needId, createdAt'
    });
  }
}

export const db = new IndustryFamilyTreeDB();
