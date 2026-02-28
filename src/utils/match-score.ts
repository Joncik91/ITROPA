/**
 * Match Score Calculator
 * Calculates how well an industry/opportunity matches the user's constraints profile.
 */

import type { IndustryExpression, DeepDiveDetails, ConstraintsProfile } from '../types';

export interface MatchScoreResult {
  score: number;           // 0-100 overall match score
  breakdown: {
    timefit: number;       // Does timeline match available time?
    techfit: number;       // Does tech stack align?
    marketfit: number;     // Does target market align?
    riskfit: number;       // Does competition level match risk tolerance?
    formfit: number;       // Does product type match preferences?
  };
  reasons: string[];       // Human-readable explanations
  warnings: string[];      // Potential concerns
}

/**
 * Calculate how well an industry matches the user's constraints.
 * Returns a score from 0-100 with breakdown and explanations.
 */
export function calculateMatchScore(
  industry: IndustryExpression,
  deepDive: DeepDiveDetails | null,
  profile: ConstraintsProfile
): MatchScoreResult {
  const breakdown = {
    timefit: 50,
    techfit: 50,
    marketfit: 50,
    riskfit: 50,
    formfit: 50,
  };
  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- Time Fit (weight: 25%) ---
  if (deepDive?.soloDevAssessment?.timeToMVP) {
    const mvpTime = deepDive.soloDevAssessment.timeToMVP.toLowerCase();
    const timeMatch = calculateTimeFit(mvpTime, profile.availableTime);
    breakdown.timefit = timeMatch.score;
    if (timeMatch.reason) reasons.push(timeMatch.reason);
    if (timeMatch.warning) warnings.push(timeMatch.warning);
  }

  // --- Tech Fit (weight: 25%) ---
  if (deepDive?.soloDevAssessment?.techStack) {
    const techMatch = calculateTechFit(
      deepDive.soloDevAssessment.techStack,
      profile.techStack,
      profile.hasAIAccess
    );
    breakdown.techfit = techMatch.score;
    if (techMatch.reason) reasons.push(techMatch.reason);
    if (techMatch.warning) warnings.push(techMatch.warning);
  }

  // --- Market Fit (weight: 15%) ---
  // Infer B2B/B2C from industry name and deep dive data
  const marketMatch = calculateMarketFit(industry, deepDive, profile);
  breakdown.marketfit = marketMatch.score;
  if (marketMatch.reason) reasons.push(marketMatch.reason);

  // --- Risk Fit (weight: 20%) ---
  if (deepDive?.opportunityScore?.competitionDensity !== undefined) {
    const riskMatch = calculateRiskFit(
      deepDive.opportunityScore.competitionDensity,
      profile.riskTolerance
    );
    breakdown.riskfit = riskMatch.score;
    if (riskMatch.reason) reasons.push(riskMatch.reason);
    if (riskMatch.warning) warnings.push(riskMatch.warning);
  }

  // --- Form Factor Fit (weight: 15%) ---
  // Infer form factor from industry characteristics
  const formMatch = calculateFormFactorFit(industry, deepDive, profile);
  breakdown.formfit = formMatch.score;
  if (formMatch.reason) reasons.push(formMatch.reason);

  // --- Calculate weighted overall score ---
  const weights = {
    timefit: 0.25,
    techfit: 0.25,
    marketfit: 0.15,
    riskfit: 0.20,
    formfit: 0.15,
  };

  const score = Math.round(
    breakdown.timefit * weights.timefit +
    breakdown.techfit * weights.techfit +
    breakdown.marketfit * weights.marketfit +
    breakdown.riskfit * weights.riskfit +
    breakdown.formfit * weights.formfit
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown,
    reasons,
    warnings,
  };
}

// --- Helper functions ---

function calculateTimeFit(
  mvpTime: string,
  availableTime: ConstraintsProfile['availableTime']
): { score: number; reason?: string; warning?: string } {
  const timeRanks: Record<string, number> = {
    'weekend': 1,
    '1-2 weeks': 2,
    '2-4 weeks': 3,
    '1-2 months': 4,
    'unlimited': 5,
  };

  const availableRank = timeRanks[availableTime] || 3;

  // Parse MVP time from various formats
  let mvpRank = 3; // Default to medium
  if (mvpTime.includes('weekend') || mvpTime.includes('few days')) {
    mvpRank = 1;
  } else if (mvpTime.includes('1-2 week') || mvpTime.includes('1 week') || mvpTime.includes('2 week')) {
    mvpRank = 2;
  } else if (mvpTime.includes('2-4 week') || mvpTime.includes('3-4 week') || mvpTime.includes('month')) {
    mvpRank = 3;
  } else if (mvpTime.includes('1-2 month') || mvpTime.includes('2 month')) {
    mvpRank = 4;
  } else if (mvpTime.includes('3+ month') || mvpTime.includes('quarter')) {
    mvpRank = 5;
  }

  const diff = availableRank - mvpRank;

  if (diff >= 0) {
    return {
      score: 80 + Math.min(diff * 5, 20),
      reason: `Timeline fits your ${availableTime} availability`,
    };
  } else if (diff === -1) {
    return {
      score: 60,
      reason: 'Timeline is slightly tight for your availability',
      warning: 'May need to extend timeline or reduce scope',
    };
  } else {
    return {
      score: Math.max(20, 50 + diff * 15),
      warning: `MVP time (${mvpTime}) exceeds your ${availableTime} availability`,
    };
  }
}

function calculateTechFit(
  requiredTech: string[],
  userTech: string[],
  hasAIAccess: boolean
): { score: number; reason?: string; warning?: string } {
  const userTechLower = userTech.map(t => t.toLowerCase());
  const requiredLower = requiredTech.map(t => t.toLowerCase());

  // Check for AI API requirements
  const needsAI = requiredLower.some(t =>
    t.includes('gemini') || t.includes('claude') || t.includes('openai') || t.includes('gpt') || t.includes('ai')
  );

  if (needsAI && !hasAIAccess) {
    return {
      score: 30,
      warning: 'Requires AI API access which you indicated you don\'t have',
    };
  }

  // Count matching technologies
  let matches = 0;
  let total = requiredLower.length;

  for (const req of requiredLower) {
    // Check for exact or fuzzy matches
    const found = userTechLower.some(user =>
      user.includes(req) || req.includes(user) ||
      // Common equivalents
      (req === 'node.js' && user === 'nodejs') ||
      (req === 'react' && (user === 'react' || user === 'next.js')) ||
      (req === 'typescript' && user === 'javascript')
    );
    if (found) matches++;
  }

  const matchRatio = total > 0 ? matches / total : 0.5;
  const score = Math.round(30 + matchRatio * 70);

  if (matchRatio >= 0.8) {
    return {
      score,
      reason: `Strong tech stack match (${matches}/${total} required technologies)`,
    };
  } else if (matchRatio >= 0.5) {
    return {
      score,
      reason: `Partial tech stack match (${matches}/${total})`,
    };
  } else {
    return {
      score,
      warning: `Tech stack gap: only ${matches}/${total} technologies match`,
    };
  }
}

function calculateMarketFit(
  industry: IndustryExpression,
  _deepDive: DeepDiveDetails | null,
  profile: ConstraintsProfile
): { score: number; reason?: string } {
  // Simple heuristics based on industry name/description
  const nameAndInsight = `${industry.name} ${industry.insight}`.toLowerCase();

  const b2bSignals = ['enterprise', 'business', 'b2b', 'saas', 'workflow', 'productivity', 'team', 'organization', 'corporate'];
  const b2cSignals = ['consumer', 'personal', 'individual', 'lifestyle', 'entertainment', 'social', 'home', 'family'];

  const isB2B = b2bSignals.some(s => nameAndInsight.includes(s));
  const isB2C = b2cSignals.some(s => nameAndInsight.includes(s));

  // Score based on preference match
  if ((isB2B && profile.preferB2B) || (isB2C && profile.preferB2C)) {
    return {
      score: 80,
      reason: `Market aligns with your ${isB2B ? 'B2B' : 'B2C'} preference`,
    };
  } else if (!isB2B && !isB2C) {
    return { score: 60 }; // Unclear market, neutral score
  } else {
    return {
      score: 40,
      reason: `Market (${isB2B ? 'B2B' : 'B2C'}) doesn't match your preferences`,
    };
  }
}

function calculateRiskFit(
  competitionDensity: number,
  riskTolerance: ConstraintsProfile['riskTolerance']
): { score: number; reason?: string; warning?: string } {
  // competitionDensity: 100 = blue ocean (risky), 0 = crowded (safer)
  const isBlueOcean = competitionDensity >= 70;
  const isCrowded = competitionDensity <= 30;

  if (riskTolerance === 'high') {
    if (isBlueOcean) {
      return {
        score: 90,
        reason: 'Blue ocean opportunity matches your high risk tolerance',
      };
    } else if (isCrowded) {
      return {
        score: 50,
        reason: 'Crowded market may be too "safe" for your taste',
      };
    }
  } else if (riskTolerance === 'low') {
    if (isBlueOcean) {
      return {
        score: 40,
        warning: 'Blue ocean/unproven market may be too risky for you',
      };
    } else if (isCrowded) {
      return {
        score: 80,
        reason: 'Proven market with existing demand matches low risk preference',
      };
    }
  }

  // Medium risk tolerance or medium competition
  return { score: 65 };
}

function calculateFormFactorFit(
  industry: IndustryExpression,
  _deepDive: DeepDiveDetails | null,
  profile: ConstraintsProfile
): { score: number; reason?: string } {
  // Infer likely form factor from industry characteristics
  const nameAndInsight = `${industry.name} ${industry.insight}`.toLowerCase();

  const likelyFormFactors: Array<ConstraintsProfile['preferredFormFactors'][number]> = [];

  if (nameAndInsight.includes('platform') || nameAndInsight.includes('subscription') || nameAndInsight.includes('dashboard')) {
    likelyFormFactors.push('saas');
  }
  if (nameAndInsight.includes('tool') || nameAndInsight.includes('utility') || nameAndInsight.includes('generator')) {
    likelyFormFactors.push('tool');
  }
  if (nameAndInsight.includes('api') || nameAndInsight.includes('integration') || nameAndInsight.includes('backend')) {
    likelyFormFactors.push('api');
  }
  if (nameAndInsight.includes('marketplace') || nameAndInsight.includes('matching') || nameAndInsight.includes('connect')) {
    likelyFormFactors.push('marketplace');
  }
  if (nameAndInsight.includes('extension') || nameAndInsight.includes('plugin') || nameAndInsight.includes('browser')) {
    likelyFormFactors.push('extension');
  }
  if (nameAndInsight.includes('app') || nameAndInsight.includes('mobile') || nameAndInsight.includes('ios') || nameAndInsight.includes('android')) {
    likelyFormFactors.push('mobile');
  }

  // Check overlap with user preferences
  const overlap = likelyFormFactors.filter(ff => profile.preferredFormFactors.includes(ff));

  if (likelyFormFactors.length === 0) {
    return { score: 60 }; // Unclear form factor
  }

  if (overlap.length > 0) {
    return {
      score: 80,
      reason: `Likely form factor (${overlap.join(', ')}) matches your preferences`,
    };
  }

  return {
    score: 45,
    reason: `Likely form factor (${likelyFormFactors.join(', ')}) differs from your preferences`,
  };
}

/**
 * Get a color class for the match score badge
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  if (score >= 40) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
  return 'bg-red-500/20 text-red-300 border-red-500/50';
}

/**
 * Get a label for the match score
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 50) return 'Fair Match';
  if (score >= 40) return 'Partial Match';
  return 'Poor Match';
}
