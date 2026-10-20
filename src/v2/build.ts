import { AppConceptOperation } from '../services/gemini/operations/app-concept.operation';
import { DBService } from '../services/db/db.service';
import type { AppConcept, IndustryExpression } from '../types';
import { getSavedUnderstanding } from './dig';
import { fitScore } from './fit';
import { once } from './journey';
import { loadProfile } from './profile';
import type { ConstraintsProfile } from '../types';

export const MIN_CONCEPTS = 2;
export const MAX_SHOWN = 4;

/**
 * Saved concepts when there are any (V1 or V2 made them); otherwise one fresh call, using the
 * industry's saved analysis when it has one. Saved only when at least MIN_CONCEPTS came back.
 */
export const loadConcepts = (needId: string, industry: IndustryExpression): Promise<AppConcept[]> =>
  once(`concepts:${industry.id}`, async () => {
    const saved = await DBService.getAppConcepts(industry.id);
    if (saved?.concepts?.length) return saved.concepts;
    const understanding = await getSavedUnderstanding(industry.id);
    const concepts = await new AppConceptOperation().generateConcepts(industry, understanding?.deepDive);
    if (concepts.length < MIN_CONCEPTS) throw new Error(`The AI returned ${concepts.length} app concept instead of at least ${MIN_CONCEPTS}. Try again.`);
    await DBService.saveAppConcepts(industry.id, industry.name, needId, concepts, !!understanding);
    return concepts;
  });

export interface ScoredConcept {
  concept: AppConcept;
  score: number;
  reasons: string[];
}

/** Best fit first (the model's own score breaks ties), at most MAX_SHOWN shown. */
export function rankConcepts(concepts: AppConcept[], profile: ConstraintsProfile = loadProfile()): ScoredConcept[] {
  return concepts
    .map((concept) => ({ concept, ...fitScore(concept, profile) }))
    .sort((a, b) => b.score - a.score || b.concept.score - a.concept.score)
    .slice(0, MAX_SHOWN);
}
