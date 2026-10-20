import { describe, expect, it } from 'vitest';
import { DEFAULT_CONSTRAINTS, type AppConcept, type ConstraintsProfile } from '../types';
import { fitScore } from './fit';

const concept = (over: Partial<AppConcept> = {}): AppConcept => ({
  id: 'c', name: 'Pod', tagline: 'Groups', formFactor: 'saas', targetUser: 'Remote teams', problemSolved: 'Loneliness',
  coreFeature: 'Rituals', monetization: { model: 'Freemium SaaS', pricing: '$9', revenueEstimate: '$1k' }, techStack: ['React', 'Supabase'],
  mvpScope: 'm', effortEstimate: '1-2 weeks', competitiveEdge: 'e', risks: [], score: 70, ...over,
});
const profile = (over: Partial<ConstraintsProfile> = {}): ConstraintsProfile => ({ ...DEFAULT_CONSTRAINTS, ...over });

describe('fitScore (check 5)', () => {
  it('scores 100 with no mismatch', () => {
    expect(fitScore(concept(), profile())).toEqual({ score: 100, reasons: [] });
  });

  it('takes 25 off when the effort is longer than the available time', () => {
    const f = fitScore(concept({ effortEstimate: '1-2 months' }), profile({ availableTime: '2-4 weeks' }));
    expect(f.score).toBe(75);
    expect(f.reasons[0]).toMatch(/1-2 months.*2-4 weeks/);
    expect(fitScore(concept({ effortEstimate: '2-4 weeks' }), profile({ availableTime: '2-4 weeks' })).score).toBe(100);
    expect(fitScore(concept({ effortEstimate: '3+ months' }), profile({ availableTime: 'unlimited' })).score).toBe(100);
  });

  it('takes 25 off when no technology overlaps, and none when the profile lists none', () => {
    expect(fitScore(concept({ techStack: ['Rust', 'Go'] }), profile({ techStack: ['React'] })).score).toBe(75);
    expect(fitScore(concept({ techStack: ['react native'] }), profile({ techStack: ['React'] })).score).toBe(100);
    expect(fitScore(concept({ techStack: ['Rust'] }), profile({ techStack: [] })).score).toBe(100);
  });

  it('matches technologies by whole name, not by letters inside another name', () => {
    expect(fitScore(concept({ techStack: ['Python', 'R', 'Shiny'] }), profile()).score).toBe(75);
    expect(fitScore(concept({ techStack: ['React Native', 'MongoDB'] }), profile({ techStack: ['Go'] })).score).toBe(75);
    expect(fitScore(concept({ techStack: ['JavaScript'] }), profile({ techStack: ['Java'] })).score).toBe(75);
    expect(fitScore(concept({ techStack: ['Node'] }), profile({ techStack: ['Node.js'] })).score).toBe(100);
    expect(fitScore(concept({ techStack: ['React Native'] }), profile({ techStack: ['React'] })).score).toBe(100);
  });

  it('finds a technology inside a longer entry such as Node.js/Express or Next.js 14', () => {
    expect(fitScore(concept({ techStack: ['Node.js/Express'] }), profile()).score).toBe(100);
    expect(fitScore(concept({ techStack: ['Node.js (Express)'] }), profile()).score).toBe(100);
    expect(fitScore(concept({ techStack: ['Next.js 14', 'Supabase'] }), profile({ techStack: ['Next.js'] })).score).toBe(100);
    expect(fitScore(concept({ techStack: ['Node.js/Express'] }), profile({ techStack: ['Go'] })).score).toBe(75);
  });

  it('matches an avoided category as a whole word only', () => {
    const avoid = profile({ avoidCategories: ['AI', 'bet', 'ads'] });
    expect(fitScore(concept({ targetUser: 'Small retail shops', coreFeature: 'daily email', tagline: 'better downloads' }), avoid).score).toBe(100);
    expect(fitScore(concept({ tagline: 'An AI coach' }), avoid).score).toBe(75);
    expect(fitScore(concept({ tagline: 'Sports bet tracker' }), avoid).score).toBe(75);
  });

  it('copes with a saved concept that lacks its tech list or monetization', () => {
    const thin = { id: 'x', name: 'Old', formFactor: 'saas', effortEstimate: '1-2 weeks' } as unknown as AppConcept;
    expect(fitScore(thin, profile()).score).toBe(75); // no technologies listed overlaps nothing
  });

  it('takes 25 off for a form factor the person does not prefer', () => {
    expect(fitScore(concept({ formFactor: 'mobile' }), profile({ preferredFormFactors: ['saas'] })).score).toBe(75);
  });

  it('takes 25 off when the concept touches an avoided category', () => {
    const f = fitScore(concept({ tagline: 'Crypto rewards for groups' }), profile({ avoidCategories: ['crypto'] }));
    expect(f.score).toBe(75);
    expect(f.reasons[0]).toContain('crypto');
  });

  it('adds penalties: four mismatches reach 0', () => {
    const bad = concept({ effortEstimate: '3+ months', techStack: ['Rust'], formFactor: 'mobile', tagline: 'gambling' });
    const p = profile({ availableTime: 'weekend', techStack: ['React'], preferredFormFactors: ['saas'], avoidCategories: ['gambling'] });
    expect(fitScore(bad, p)).toMatchObject({ score: 0 });
    expect(fitScore(bad, p).reasons).toHaveLength(4);
    expect(fitScore(concept({ effortEstimate: '3+ months', techStack: ['Rust'] }), p).score).toBe(50);
  });
});
