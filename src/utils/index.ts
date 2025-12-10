// Shared utilities
export { extractJSON, tryExtractJSON } from './json-parser';
export type { ParseOptions } from './json-parser';

export { runFrameworkAnalysis, defineFramework, FrameworkAnalysisBuilder } from './framework-analyzer';
export type { FrameworkDefinition, FrameworkAnalysisOptions } from './framework-analyzer';

export {
  findInTree,
  findAllInTree,
  findExpressionInList,
  findExpressionByNameInList,
  findExpressionInNeed,
  findExpressionByNameInNeed,
  getAllExpressionsFromNeed,
  countExpressionsInNeed
} from './tree-search';
export type { TreeSearchOptions } from './tree-search';

export {
  getRatingColor,
  getRatingBadgeClasses,
  createRatingBadgeGetter
} from './badge-styles';

export {
  withAsyncToast,
  updateToastMessage,
  createAsyncHandler,
  toastOnComplete
} from './async-handler';
export type { AsyncHandlerOptions } from './async-handler';

export {
  normalizeToId,
  normalizeToKey,
  toTitleCase,
  truncate
} from './string-helpers';
