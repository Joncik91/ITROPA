// Main exports
export { getGeminiService, default as GeminiService } from './gemini.service';

// Client export (for advanced usage)
export { geminiClient, GeminiClient } from './gemini-client';

// Operation exports (for advanced usage)
export { NeedOperation } from './operations/need.operation';
export { BranchOperation } from './operations/branch.operation';
export { MechanismOperation } from './operations/mechanism.operation';
export { PatternOperation } from './operations/pattern.operation';
export { PriorArtOperation } from './operations/prior-art.operation';
export { ChainOperation } from './operations/chain.operation';
export { CrossPollinateOperation } from './operations/cross-pollinate.operation';
export { DeepDiveOperation } from './operations/deep-dive.operation';

// Prompt utilities (for testing/advanced usage)
export * from './prompts/common';
export * from './prompts/need-prompts';
export * from './prompts/branch-prompts';
export * from './prompts/mechanism-prompts';
export * from './prompts/pattern-prompts';
export * from './prompts/prior-art-prompts';
export * from './prompts/chain-prompts';
export * from './prompts/cross-pollinate-prompts';
export * from './prompts/deep-dive-prompts';
