import { describe, expect, it } from 'vitest';
import { normalizeAppConcepts, normalizeAssistantResponse, normalizeDeepDive } from './ai-normalizers';
import { clusterPatterns, jaccard, patternTokens } from './pattern-clustering';

describe('normalizeDeepDive', () => {
  it('coerces shapes the UI maps over', () => {
    const dd = normalizeDeepDive({
      marketOpportunity: 'Big',
      keyEnablers: 'just one',
      challenges: ['plain string', { challenge: 'c', potentialSolution: 's' }, 7],
      opportunityScore: { marketTiming: '120', technicalFit: 'x' },
      buildRecommendation: { verdict: 'BUILD', confidence: 70.4 },
    });
    expect(dd.keyEnablers).toEqual(['just one']);
    expect(dd.challenges).toEqual([{ challenge: 'plain string', potentialSolution: '' }, { challenge: 'c', potentialSolution: 's' }]);
    expect(dd.opportunityScore).toMatchObject({ marketTiming: 100, technicalFit: 0 });
    expect(dd.buildRecommendation).toMatchObject({ verdict: 'build', confidence: 70 });
    expect(dd.risks).toEqual([]);
  });

  it('rejects empty or non-object payloads', () => {
    expect(() => normalizeDeepDive([])).toThrow();
    expect(() => normalizeDeepDive({})).toThrow(/empty/);
  });
});

describe('normalizeAppConcepts', () => {
  it('accepts envelopes, drops nameless items, fills nested defaults', () => {
    const concepts = normalizeAppConcepts({ concepts: [{ name: 'A', formFactor: 'desktop', techStack: 'React' }, { tagline: 'no name' }] });
    expect(concepts).toHaveLength(1);
    expect(concepts[0]).toMatchObject({ formFactor: 'saas', techStack: ['React'], monetization: { model: '', pricing: '', revenueEstimate: '' } });
  });
});

describe('normalizeAssistantResponse', () => {
  it('keeps only executable, well-formed suggestions with unique ids', () => {
    const r = normalizeAssistantResponse({
      suggestions: [
        { id: 'x', action: 'Branch it', actionType: 'branch', params: { expressionName: 'A' } },
        { id: 'x', action: 'Teleport', actionType: 'teleport' },
        { actionType: 'branch' },
      ],
      reasoning: 'r',
    });
    expect(r.suggestions).toHaveLength(1);
    expect(r.suggestions[0].id).not.toBe('x');
    expect(normalizeAssistantResponse('junk')).toEqual({ suggestions: [], reasoning: '' });
  });
});

describe('pattern clustering', () => {
  it('tokenizes with stop words and light stemming', () => {
    expect([...patternTokens('Feedback loops that amplify the engagement')].sort()).toEqual(['amplify', 'engagement', 'feedback', 'loop']);
    expect(jaccard(new Set(), new Set(['a']))).toBe(0);
  });

  it('groups paraphrased patterns across mechanisms and ignores singletons', () => {
    const clusters = clusterPatterns([
      { mechanismId: 'm1', label: 'Feedback loop amplification' },
      { mechanismId: 'm2', label: 'Amplification via feedback loops' },
      { mechanismId: 'm1', label: 'Feedback loop amplification' },
      { mechanismId: 'm3', label: 'Decentralized trust networks' },
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].mechanismIds.sort()).toEqual(['m1', 'm2']);
    expect(clusters[0].name).toBe('Feedback loop amplification');
  });

  it('does not count one mechanism twice as a pattern', () => {
    expect(clusterPatterns([
      { mechanismId: 'm1', label: 'Network effects' },
      { mechanismId: 'm1', label: 'Network effect' },
    ])).toEqual([]);
  });
});
