import type { AppConcept, ConstraintsProfile } from '../types';

const EFFORT_WEEKS: Record<AppConcept['effortEstimate'], number> = { weekend: 0, '1-2 weeks': 1, '2-4 weeks': 2, '1-2 months': 3, '3+ months': 4 };
const TIME_RANK: Record<ConstraintsProfile['availableTime'], number> = { weekend: 0, '1-2 weeks': 1, '2-4 weeks': 2, '1-2 months': 3, unlimited: Infinity };
const PENALTY = 25;

export interface Fit {
  /** 100 minus 25 per mismatch, never below 0. */
  score: number;
  /** One plain sentence per mismatch, so the score can be read, not trusted. */
  reasons: string[];
}

const norm = (s: string) => s.toLowerCase().trim();
/** Words of a technology name; a trailing ".js" is dropped from each word so "Node.js" and "Node" are the same name. */
const words = (s: string) => norm(s).split(/[^a-z0-9+#.]+/).map((w) => w.replace(/\.js$/, '')).filter(Boolean);
/** Same name, or one name's words appear whole inside the other's ("React" in "React Native"); never letters inside a word. */
const sameTech = (a: string, b: string) => {
  const [short, long] = words(a).length <= words(b).length ? [words(a), words(b)] : [words(b), words(a)];
  if (!short.length) return false;
  return long.some((_, i) => short.every((w, j) => long[i + j] === w));
};
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text: string, word: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(word)}($|[^a-z0-9])`).test(text);

/** Fit of a concept to the builder's profile (spec check 5): up to four mismatches at 25 points each. */
export function fitScore(concept: AppConcept, profile: ConstraintsProfile): Fit {
  const reasons: string[] = [];

  if (EFFORT_WEEKS[concept.effortEstimate] > TIME_RANK[profile.availableTime]) {
    reasons.push(`Takes ${concept.effortEstimate}, longer than the ${profile.availableTime} you have.`);
  }

  const mine = profile.techStack.map(norm).filter(Boolean);
  const theirs = (concept.techStack ?? []).map(norm).filter(Boolean);
  const overlaps = theirs.some((t) => mine.some((m) => sameTech(t, m)));
  if (mine.length && !overlaps) reasons.push('Uses none of the technologies you listed.');

  if (!profile.preferredFormFactors.includes(concept.formFactor)) {
    reasons.push(`It is a ${concept.formFactor}, not one of the product types you prefer.`);
  }

  const text = norm([concept.name, concept.tagline, concept.targetUser, concept.problemSolved, concept.coreFeature, concept.monetization?.model].filter(Boolean).join(' '));
  const hit = profile.avoidCategories.map(norm).filter(Boolean).find((c) => hasWord(text, c));
  if (hit) reasons.push(`It touches “${hit}”, which you asked to avoid.`);

  return { score: Math.max(0, 100 - PENALTY * reasons.length), reasons };
}
