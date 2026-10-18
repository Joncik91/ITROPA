/**
 * Groups mechanism analyses into recurring patterns.
 *
 * Abstract patterns are free text written by the model ("Feedback loop amplification",
 * "Feedback loops that amplify engagement"), so exact-string grouping almost never finds
 * a repeat. Labels are tokenized (stop words dropped, light stemming) and greedily
 * clustered by Jaccard similarity; a cluster is a pattern once it spans 2+ distinct
 * mechanisms.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'into', 'is', 'it', 'its',
  'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'through', 'via', 'with', 'within', 'based',
  'using', 'driven', 'enabled',
]);

const stem = (w: string) => w.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '');

export function patternTokens(label: string): Set<string> {
  return new Set(
    label.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
      .map(stem)
      .filter(Boolean),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface PatternInstance {
  mechanismId: string;
  label: string;
}

export interface PatternCluster {
  /** Most frequent original label in the cluster. */
  name: string;
  mechanismIds: string[];
}

export function clusterPatterns(instances: PatternInstance[], threshold = 0.5): PatternCluster[] {
  const clusters: Array<{ tokens: Set<string>; labels: Map<string, number>; ids: Set<string> }> = [];

  for (const { mechanismId, label } of instances) {
    const tokens = patternTokens(label);
    if (tokens.size === 0) continue;
    let best: (typeof clusters)[number] | undefined;
    let bestScore = threshold;
    for (const c of clusters) {
      const score = jaccard(tokens, c.tokens);
      if (score >= bestScore) {
        best = c;
        bestScore = score;
      }
    }
    if (!best) {
      best = { tokens, labels: new Map(), ids: new Set() };
      clusters.push(best);
    }
    best.ids.add(mechanismId);
    best.labels.set(label, (best.labels.get(label) ?? 0) + 1);
  }

  return clusters
    .filter((c) => c.ids.size >= 2)
    .map((c) => ({
      name: [...c.labels.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0],
      mechanismIds: [...c.ids],
    }))
    .sort((a, b) => b.mechanismIds.length - a.mechanismIds.length);
}
