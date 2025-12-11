import { JSON_ONLY } from './common';
import type { IndustryExpression } from '../../../types';
import { getConstraintsProfile, serializeConstraintsForPrompt } from '../../../utils/constraints-storage';

/**
 * Get the builder profile context from user constraints.
 * Falls back to defaults if no profile exists.
 */
function getBuilderContext(): string {
  const profile = getConstraintsProfile();
  return serializeConstraintsForPrompt(profile);
}

/**
 * Generate prompt for deep dive business analysis with opportunity scoring.
 * Uses the user's Constraints Profile for personalized assessment.
 */
export function buildDeepDivePrompt(industry: IndustryExpression): string {
  const builderContext = getBuilderContext();

  return `Provide detailed business analysis for the emerging industry "${industry.name}".

Context:
- Mutation/Enabler: ${industry.mutation}
- Core Insight: ${industry.insight}

${builderContext}

${JSON_ONLY}

{
  "marketOpportunity": "Detailed description of market size, growth trajectory, and opportunity ($X billion by year Y, growing at Z% CAGR)",
  "keyEnablers": ["Technology/trend 1 that enables this", "Technology/trend 2", "Social/economic factor 3"],
  "challenges": [
    {"challenge": "Major barrier 1", "potentialSolution": "How to overcome it"},
    {"challenge": "Major barrier 2", "potentialSolution": "How to overcome it"},
    {"challenge": "Major barrier 3", "potentialSolution": "How to overcome it"}
  ],
  "timeline": "Detailed timeline: Early adopters (X years), mainstream adoption (Y years), maturity (Z years)",
  "firstMoverAdvantage": "Specific strategies for companies entering this space early",
  "priorArtLeverage": "How to use insights from ${industry.inspirations?.map(i => i.source).join(', ') || 'prior art'} to gain competitive edge",
  "keyPlayers": ["Potential company/startup 1", "Potential company 2", "Potential company 3"],
  "risks": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
  "opportunityScore": {
    "marketTiming": 75,
    "technicalFit": 80,
    "effortEstimate": 60,
    "monetizationClarity": 70,
    "competitionDensity": 65,
    "overallScore": 70
  },
  "soloDevAssessment": {
    "feasibility": "high|medium|low",
    "timeToMVP": "2-4 weeks",
    "techStack": ["React", "Node.js", "Specific API/service"],
    "biggestChallenge": "The main obstacle for a solo dev building this",
    "unfairAdvantage": "What edge a solo dev could have over incumbents"
  },
  "monetizationModels": [
    {
      "model": "SaaS Subscription",
      "description": "Monthly recurring fee for access",
      "revenueRange": "$500-2000/mo at 50-200 users",
      "difficulty": "easy|medium|hard"
    },
    {
      "model": "Usage-based API",
      "description": "Pay per API call or usage",
      "revenueRange": "$1000-5000/mo",
      "difficulty": "easy|medium|hard"
    }
  ],
  "buildRecommendation": {
    "verdict": "build|explore|skip",
    "confidence": 75,
    "reasoning": "Clear explanation of why this verdict based on the builder profile",
    "nextStep": "Specific actionable next step if pursuing this opportunity"
  }
}

IMPORTANT for scoring:
- marketTiming: 100 = perfect window right now, 0 = too early or too late
- technicalFit: 100 = perfectly matches builder's stack, 0 = requires completely new skills
- effortEstimate: 100 = weekend project, 0 = multi-year enterprise effort
- monetizationClarity: 100 = obvious payment model, 0 = unclear how to charge
- competitionDensity: 100 = wide open blue ocean, 0 = dominated by giants
- overallScore: Weighted average favoring technicalFit and effortEstimate for solo dev

For buildRecommendation.verdict:
- "build": Strong fit, clear path, go for it
- "explore": Promising but needs validation or has uncertainties
- "skip": Poor fit for this builder profile (doesn't mean bad opportunity overall)`;
}
