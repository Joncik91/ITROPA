// Main exports
export { DBService } from './db.service';
export { db } from './db-client';

// Type exports
export type {
  DBNeed,
  DBMechanism,
  DBDeepDive,
  DBCrossPollinate,
  DBSearchCache,
  DBPatternAnalysis,
  DBPriorArtAnalysis,
  DBChainAnalysis,
  DBAppConcept
} from './db-client';

// Repository exports (for advanced usage)
export { NeedRepository } from './repositories/need.repository';
export { MechanismRepository } from './repositories/mechanism.repository';
export { DeepDiveRepository } from './repositories/deep-dive.repository';
export { CrossPollinateRepository } from './repositories/cross-pollinate.repository';
export { PatternAnalysisRepository } from './repositories/pattern-analysis.repository';
export { PriorArtAnalysisRepository } from './repositories/prior-art-analysis.repository';
export { ChainAnalysisRepository } from './repositories/chain-analysis.repository';
export { SearchCacheRepository } from './repositories/search-cache.repository';
export { AppConceptRepository } from './repositories/app-concept.repository';
export { SearchService } from './search.service';
export { BaseRepository } from './base.repository';
