/**
 * Shape guards for AI analysis payloads (deep dives, app concepts, framework analyses,
 * assistant suggestions). Guarantees the arrays and strings the UI maps over exist,
 * so a malformed model response degrades to missing sections instead of a crash.
 */

import type { AIActionSuggestion, AIAssistantResponse, AppConcept, DeepDiveDetails } from '../types';
import { arr, newId, str, strArr, unwrapArray } from './need-model';

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : fallback;
};

const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => {
  const s = str(v).toLowerCase();
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
};

export function normalizeDeepDive(raw: unknown): DeepDiveDetails {
  if (!isObject(raw)) throw new Error('The AI returned an invalid deep dive.');

  const dd: DeepDiveDetails = {
    marketOpportunity: str(raw.marketOpportunity),
    keyEnablers: strArr(raw.keyEnablers),
    challenges: arr(raw.challenges).flatMap((c) =>
      isObject(c) ? [{ challenge: str(c.challenge), potentialSolution: str(c.potentialSolution) }]
      : typeof c === 'string' ? [{ challenge: c, potentialSolution: '' }]
      : []),
    timeline: str(raw.timeline),
    firstMoverAdvantage: str(raw.firstMoverAdvantage) || undefined,
    priorArtLeverage: str(raw.priorArtLeverage) || undefined,
    keyPlayers: strArr(raw.keyPlayers),
    risks: strArr(raw.risks),
  };

  if (!dd.marketOpportunity && dd.keyEnablers.length === 0 && dd.challenges.length === 0) {
    throw new Error('The AI returned an empty deep dive.');
  }

  if (isObject(raw.opportunityScore)) {
    const s = raw.opportunityScore;
    dd.opportunityScore = {
      marketTiming: num(s.marketTiming),
      technicalFit: num(s.technicalFit),
      effortEstimate: num(s.effortEstimate),
      monetizationClarity: num(s.monetizationClarity),
      competitionDensity: num(s.competitionDensity),
      overallScore: num(s.overallScore),
    };
  }
  if (isObject(raw.soloDevAssessment)) {
    const s = raw.soloDevAssessment;
    dd.soloDevAssessment = {
      feasibility: oneOf(s.feasibility, ['high', 'medium', 'low'] as const, 'medium'),
      timeToMVP: str(s.timeToMVP),
      techStack: strArr(s.techStack),
      biggestChallenge: str(s.biggestChallenge),
      unfairAdvantage: str(s.unfairAdvantage),
    };
  }
  const models = arr(raw.monetizationModels).filter(isObject);
  if (models.length) {
    dd.monetizationModels = models.map((m) => ({
      model: str(m.model),
      description: str(m.description),
      revenueRange: str(m.revenueRange),
      difficulty: oneOf(m.difficulty, ['easy', 'medium', 'hard'] as const, 'medium'),
    }));
  }
  if (isObject(raw.buildRecommendation)) {
    const b = raw.buildRecommendation;
    dd.buildRecommendation = {
      verdict: oneOf(b.verdict, ['build', 'explore', 'skip'] as const, 'explore'),
      confidence: num(b.confidence),
      reasoning: str(b.reasoning),
      nextStep: str(b.nextStep),
    };
  }
  return dd;
}

const FORM_FACTORS = ['saas', 'tool', 'api', 'marketplace', 'extension', 'mobile'] as const;
const EFFORTS = ['weekend', '1-2 weeks', '2-4 weeks', '1-2 months', '3+ months'] as const;

export function normalizeAppConcepts(raw: unknown): AppConcept[] {
  return unwrapArray(raw, 'concepts').flatMap((c) => {
    if (!isObject(c) || !str(c.name)) return [];
    const m = isObject(c.monetization) ? c.monetization : {};
    const concept: AppConcept = {
      id: newId('concept'),
      name: str(c.name),
      tagline: str(c.tagline),
      formFactor: oneOf(c.formFactor, FORM_FACTORS, 'saas'),
      targetUser: str(c.targetUser),
      problemSolved: str(c.problemSolved),
      coreFeature: str(c.coreFeature),
      monetization: { model: str(m.model), pricing: str(m.pricing), revenueEstimate: str(m.revenueEstimate) },
      techStack: strArr(c.techStack),
      mvpScope: str(c.mvpScope),
      effortEstimate: oneOf(c.effortEstimate, EFFORTS, '2-4 weeks'),
      competitiveEdge: str(c.competitiveEdge),
      risks: strArr(c.risks),
      score: num(c.score),
    };
    return [concept];
  });
}

const ACTION_TYPES = ['create_need', 'compare', 'branch', 'analyze', 'find_similar', 'extract', 'apply_pattern'] as const;

export function normalizeAssistantResponse(raw: unknown): AIAssistantResponse {
  const src = isObject(raw) ? raw : {};
  const suggestions: AIActionSuggestion[] = unwrapArray(src.suggestions ?? raw, 'suggestions').flatMap((s) => {
    if (!isObject(s) || !str(s.action)) return [];
    const actionType = str(s.actionType) as AIActionSuggestion['actionType'];
    if (!(ACTION_TYPES as readonly string[]).includes(actionType)) return [];
    return [{
      id: newId('suggestion'),
      action: str(s.action),
      reasoning: str(s.reasoning),
      actionType,
      params: isObject(s.params) ? s.params : {},
    }];
  });
  return { suggestions, reasoning: str(src.reasoning) };
}

/** Framework analyses are rendered field-by-field; drop anything that is not an object. */
export function normalizeFrameworkResults<T>(results: unknown[]): T[] {
  return results.filter(isObject) as T[];
}
