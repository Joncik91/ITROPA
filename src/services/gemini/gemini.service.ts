import { NeedOperation } from './operations/need.operation';
import { BranchOperation } from './operations/branch.operation';
import { MechanismOperation } from './operations/mechanism.operation';
import { PatternOperation } from './operations/pattern.operation';
import { PriorArtOperation } from './operations/prior-art.operation';
import { ChainOperation } from './operations/chain.operation';
import { CrossPollinateOperation } from './operations/cross-pollinate.operation';
import { DeepDiveOperation } from './operations/deep-dive.operation';
import type { Need, PriorArt, IndustryExpression, MechanismDetails, DeepDiveDetails } from '../../types';

/**
 * Thin orchestrator service that composes specialized operations.
 * Maintains the same API as the original GeminiService for backwards compatibility.
 */
class GeminiService {
  private needOp = new NeedOperation();
  private branchOp = new BranchOperation();
  private mechanismOp = new MechanismOperation();
  private patternOp = new PatternOperation();
  private priorArtOp = new PriorArtOperation();
  private chainOp = new ChainOperation();
  private crossPollinateOp = new CrossPollinateOperation();
  private deepDiveOp = new DeepDiveOperation();

  constructor() {
    // No longer needs API key - using backend API
  }

  // ============ NEED OPERATIONS ============

  async fetchPriorArt(need: string, userDescription?: string): Promise<PriorArt> {
    return this.needOp.fetchPriorArt(need, userDescription);
  }

  async generateNeed(needName: string, priorArt: PriorArt, userDescription?: string): Promise<Need> {
    return this.needOp.generateNeed(needName, priorArt, userDescription);
  }

  // ============ BRANCH OPERATIONS ============

  async branchIndustry(parent: IndustryExpression): Promise<IndustryExpression[]> {
    return this.branchOp.branchIndustry(parent);
  }

  // ============ MECHANISM OPERATIONS ============

  async extractMechanism(industry: IndustryExpression): Promise<MechanismDetails[]> {
    return this.mechanismOp.extractMechanism(industry);
  }

  // ============ PATTERN OPERATIONS ============

  async analyzePatterns(
    patternName: string,
    mechanisms: Array<{
      expressionName: string;
      needName: string;
      coreMechanism: string;
    }>
  ): Promise<any[]> {
    return this.patternOp.analyzePatterns(patternName, mechanisms);
  }

  // ============ PRIOR ART OPERATIONS ============

  async analyzePriorArt(needName: string, priorArt: any): Promise<any[]> {
    return this.priorArtOp.analyzePriorArt(needName, priorArt);
  }

  // ============ CHAIN OPERATIONS ============

  async analyzeInspirationChain(expression: IndustryExpression, allExpressions: IndustryExpression[]): Promise<any[]> {
    return this.chainOp.analyzeInspirationChain(expression, allExpressions);
  }

  // ============ CROSS-POLLINATION OPERATIONS ============

  async crossPollinate(a: IndustryExpression, b: IndustryExpression): Promise<IndustryExpression[]> {
    return this.crossPollinateOp.crossPollinate(a, b);
  }

  // ============ DEEP DIVE OPERATIONS ============

  async deepDive(industry: IndustryExpression): Promise<DeepDiveDetails> {
    return this.deepDiveOp.deepDive(industry);
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
};

export default GeminiService;
