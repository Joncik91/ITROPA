import { geminiClient } from '../services/gemini/gemini-client';
import { BranchOperation } from '../services/gemini/operations/branch.operation';
import { CrossPollinateOperation } from '../services/gemini/operations/cross-pollinate.operation';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import {
  getFutureExpressions, insertIntoExpressionTree, locateInExpressionTree, newId, withFutureExpressions,
} from '../utils/need-model';
import type { IndustryExpression, Need } from '../types';
import { once } from './journey';
import { buildUnderstandPrompt, normalizeUnderstanding, type Understanding } from './dig-model';
import { UNDERSTAND_TOKENS } from './tokens';

export type { Understanding };

/** What V1 or V2 already saved for this industry (both parts needed), with no model call. */
export async function getSavedUnderstanding(industryId: string): Promise<Understanding | null> {
  const [m, d] = await Promise.all([DBService.getMechanism(industryId), DBService.getDeepDiveById(industryId)]);
  const mechanism = m?.details?.[0];
  return mechanism && d?.details ? { mechanism, deepDive: d.details } : null;
}

/** One call. Both records are saved only after both parts parse, so a bad answer leaves nothing half-saved. */
export const understand = (needId: string, industry: IndustryExpression): Promise<Understanding> =>
  once(`understand:${industry.id}`, async () => {
    const raw = await geminiClient.callAPI(buildUnderstandPrompt(industry), UNDERSTAND_TOKENS);
    const result = normalizeUnderstanding(raw);
    // One transaction: a failure on the second record must not leave the first behind.
    await db.transaction('rw', db.mechanisms, db.deepDives, async () => {
      await DBService.saveMechanism(industry.id, industry.name, needId, [result.mechanism]);
      await DBService.saveDeepDive(industry.id, industry.name, needId, result.deepDive);
    });
    return result;
  });

/** Re-reads the need after the model answers, so a change made meanwhile is not overwritten. */
async function editNeed(needId: string, edit: (need: Need) => Need | null): Promise<Need> {
  // Read and write in one transaction, so two edits that finish together (or in two tabs) queue up
  // instead of the later save overwriting the earlier one.
  return db.transaction('rw', db.needs, async () => {
    const need = await DBService.getNeed(needId);
    if (!need) throw new Error('This need no longer exists.');
    const next = edit(need);
    if (!next) throw new Error('That industry was removed before the answer arrived.');
    await DBService.saveNeed(next);
    return next;
  });
}

export const branch = (needId: string, industry: IndustryExpression): Promise<Need> =>
  once(`branch:${industry.id}`, async () => {
    const children = await new BranchOperation().branchIndustry(industry);
    if (children.length < 3) throw new Error(`The AI returned ${children.length} sub-industries instead of 3. Try again.`);
    return editNeed(needId, (need) => {
      const before = getFutureExpressions(need);
      if (!locateInExpressionTree(before, industry.id)) return null;
      return withFutureExpressions(need, () => insertIntoExpressionTree(before, industry.id, children));
    });
  });

/** The model proposes five hybrids; the one it scores highest for synergy joins the list, flagged and sourced. */
export const combine = (needId: string, a: IndustryExpression, b: IndustryExpression): Promise<Need> =>
  once(`combine:${a.id}:${b.id}`, async () => {
    const options = await new CrossPollinateOperation().crossPollinate(a, b);
    const best = options.reduce((top, o) => ((o.synergyScore ?? 0) > (top.synergyScore ?? 0) ? o : top));
    const node: IndustryExpression = { ...best, id: newId('expr'), children: [], crossPollinated: true, sourceExpressions: [a.id, b.id] };
    return editNeed(needId, (need) => {
      const before = getFutureExpressions(need);
      if (!locateInExpressionTree(before, a.id) || !locateInExpressionTree(before, b.id)) return null;
      return withFutureExpressions(need, () => insertIntoExpressionTree(before, null, [node]));
    });
  });
