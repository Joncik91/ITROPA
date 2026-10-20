import { DBService } from '../services/db/db.service';
import { clusterPatterns, jaccard, patternTokens, type PatternInstance } from '../utils/pattern-clustering';
import { getFutureExpressions } from '../utils/need-model';
import type { IndustryExpression, MechanismDetails, Need } from '../types';
import type { DBMechanism } from '../services/db/db-client';

/** One industry that shows a pattern, with the mechanism written for it. */
export interface PatternMember { needId: string; needName: string; industry: string; mechanism: string }
export interface PatternInsight { name: string; members: PatternMember[]; needs: string[] }

/** One borrowed idea: where it came from, what was taken, how it was changed. */
export interface ChainLink { needName: string; industry: string; source: string; mechanism: string; twist: string }
export interface ChainInsight { source: string; links: ChainLink[]; needs: string[] }

export interface Insights { patterns: PatternInsight[]; chains: ChainInsight[]; needCount: number; understoodCount: number }

const entries = (details: unknown): Partial<MechanismDetails>[] =>
  Array.isArray(details) ? details : details && typeof details === 'object' ? [details as Partial<MechanismDetails>] : [];

const flatten = (list: IndustryExpression[]): IndustryExpression[] => list.flatMap((e) => [e, ...flatten(e.children ?? [])]);
const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

/** Patterns shared by industries of two or more different needs, and every borrowed idea grouped by its source. Reads only what is already stored. */
export function buildInsights(needs: Need[], mechanisms: DBMechanism[]): Insights {
  const needName = new Map(needs.map((n) => [n.id, n.name]));
  const owned = mechanisms.filter((m) => needName.has(m.needId));
  const byId = new Map(owned.map((m) => [m.id, m]));

  const instances: PatternInstance[] = owned.flatMap((m) =>
    entries(m.details).flatMap((d) => (typeof d.abstractPattern === 'string' && d.abstractPattern.trim() ? [{ mechanismId: m.id, label: d.abstractPattern.trim() }] : [])));

  const patterns = clusterPatterns(instances).flatMap((c): PatternInsight[] => {
    const clusterTokens = patternTokens(c.name);
    const members = c.mechanismIds.flatMap((id): PatternMember[] => {
      const m = byId.get(id);
      if (!m) return [];
      // A record can hold several framework entries; describe the industry by the entry that matches this pattern.
      const withCore = entries(m.details).filter((d) => d.coreMechanism);
      const matching = withCore.find((d) => jaccard(patternTokens(d.abstractPattern ?? ''), clusterTokens) >= 0.5) ?? withCore[0];
      return [{ needId: m.needId, needName: needName.get(m.needId)!, industry: m.expressionName, mechanism: matching?.coreMechanism ?? '' }];
    });
    const needIds = new Set(members.map((m) => m.needId));
    return needIds.size >= 2 ? [{ name: c.name, members, needs: members.filter((m, i) => members.findIndex((x) => x.needId === m.needId) === i).map((m) => m.needName) }] : [];
  }).sort((a, b) => b.needs.length - a.needs.length || b.members.length - a.members.length);

  const bySource = new Map<string, ChainInsight>();
  const seen = new Map<string, Set<string>>();
  for (const need of needs) {
    for (const e of flatten(getFutureExpressions(need))) {
      for (const i of e.inspirations ?? []) {
        if (!i.source?.trim()) continue;
        const key = norm(i.source);
        const group = bySource.get(key) ?? { source: i.source.trim(), links: [], needs: [] };
        if (!seen.get(key)?.has(need.id)) { group.needs.push(need.name); seen.set(key, (seen.get(key) ?? new Set()).add(need.id)); }
        group.links.push({ needName: need.name, industry: e.name, source: i.source.trim(), mechanism: i.mechanism ?? '', twist: i.twist ?? '' });
        bySource.set(key, group);
      }
    }
  }
  const chains = [...bySource.values()].sort((a, b) => b.needs.length - a.needs.length || b.links.length - a.links.length);

  return { patterns, chains, needCount: needs.length, understoodCount: owned.length };
}

export async function loadInsights(): Promise<Insights> {
  const [needs, mechanisms] = await Promise.all([DBService.getAllNeeds(), DBService.getAllMechanisms()]);
  return buildInsights(needs, mechanisms);
}
