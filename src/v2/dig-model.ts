import { normalizeDeepDive } from '../utils/ai-normalizers';
import { arr, str, strArr } from '../utils/need-model';
import type { DeepDiveDetails, IndustryExpression, MechanismDetails } from '../types';

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export interface Understanding {
  mechanism: MechanismDetails;
  deepDive: DeepDiveDetails;
}

/** One call for what V1 asked in six: how it works, which pattern it is, and what the business looks like. */
export function buildUnderstandPrompt(industry: IndustryExpression): string {
  const from = industry.inspirations.map((i) => `${i.source} (${i.mechanism})`).join('; ') || 'none listed';
  return `Analyse the emerging industry "${industry.name}" in two parts.
Enabler: ${industry.mutation}
Core insight: ${industry.insight}
Borrowed from: ${from}

Part 1, MECHANISM: the underlying mechanism that makes it work, abstracted so it could be reused in other fields.
Part 2, DEEP DIVE: the business picture.

Return ONLY valid JSON, no markdown, no trailing commas:
{
  "mechanism": {
    "coreMechanism": "The primary mechanism in one or two sentences",
    "abstractPattern": "The highest-level pattern behind it, free of this industry's vocabulary",
    "keyPrinciples": [{"principle": "Core principle", "function": "What it does", "criticality": "Why it is essential"}],
    "untappedDomains": [{"domain": "Field not yet using it", "opportunity": "How it would apply", "novelty": "What is new"}],
    "combinationPotential": ["Compatible mechanism"]
  },
  "deepDive": {
    "marketOpportunity": "Market size, growth and who pays",
    "keyEnablers": ["Technology or trend that enables it"],
    "challenges": [{"challenge": "Major barrier", "potentialSolution": "How to overcome it"}],
    "timeline": "Early adopters, mainstream, maturity",
    "risks": ["Risk"]
  }
}
Give 3 key principles, 2 untapped domains, 3 enablers and 3 challenges.`;
}

export function normalizeMechanism(raw: unknown): MechanismDetails {
  if (!isObject(raw) || !str(raw.coreMechanism)) throw new Error('The AI returned no mechanism.');
  return {
    coreMechanism: str(raw.coreMechanism),
    abstractPattern: str(raw.abstractPattern),
    keyPrinciples: arr(raw.keyPrinciples).flatMap((p) =>
      isObject(p) && str(p.principle) ? [{ principle: str(p.principle), function: str(p.function), criticality: str(p.criticality) }] : []),
    untappedDomains: arr(raw.untappedDomains).flatMap((d) =>
      isObject(d) && str(d.domain) ? [{ domain: str(d.domain), opportunity: str(d.opportunity), novelty: str(d.novelty) }] : []),
    combinationPotential: strArr(raw.combinationPotential),
  };
}

/** Both parts or an error: a half answer must never be saved. */
export function normalizeUnderstanding(raw: unknown): Understanding {
  if (!isObject(raw)) throw new Error('The AI returned an invalid analysis.');
  return { mechanism: normalizeMechanism(raw.mechanism), deepDive: normalizeDeepDive(raw.deepDive) };
}
