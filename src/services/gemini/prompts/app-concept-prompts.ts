import { JSON_ONLY } from './common';
import type { IndustryExpression, DeepDiveDetails } from '../../../types';
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
 * Get preferred form factors as a string list for the prompt.
 */
function getPreferredFormFactors(): string {
  const profile = getConstraintsProfile();
  return profile.preferredFormFactors.join(', ');
}

/**
 * Generate prompt for app concept generation.
 * Uses the user's Constraints Profile for personalized concept generation.
 */
export function buildAppConceptPrompt(
  industry: IndustryExpression,
  deepDive?: DeepDiveDetails
): string {
  const builderContext = getBuilderContext();
  const preferredFormFactors = getPreferredFormFactors();

  const deepDiveContext = deepDive ? `
Market Intelligence (from Deep Dive analysis):
- Market Opportunity: ${deepDive.marketOpportunity}
- Timeline: ${deepDive.timeline}
- Key Enablers: ${deepDive.keyEnablers?.join(', ') || 'N/A'}
- Key Players: ${deepDive.keyPlayers?.join(', ') || 'N/A'}
- Challenges: ${deepDive.challenges?.map(c => c.challenge).join(', ') || 'N/A'}
${deepDive.buildRecommendation ? `- Build Recommendation: ${deepDive.buildRecommendation.verdict} (${deepDive.buildRecommendation.reasoning})` : ''}
` : '';

  return `Generate 5 diverse app/product concepts for the emerging industry "${industry.name}".

Industry Context:
- Mutation/Enabler: ${industry.mutation}
- Core Insight: ${industry.insight}
${deepDiveContext}
${builderContext}

CRITICAL: Generate DIVERSE form factors. Prioritize the builder's preferred form factors (${preferredFormFactors}) but include variety. Do NOT generate 5 of the same type.

${JSON_ONLY}

{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Creative product name",
      "tagline": "One-liner pitch (max 10 words)",
      "formFactor": "saas|tool|api|marketplace|extension|mobile",
      "targetUser": "Specific user persona in one sentence",
      "problemSolved": "The ONE problem this solves",
      "coreFeature": "The ONE killer feature",
      "monetization": {
        "model": "Freemium SaaS|Usage-based|One-time purchase|Marketplace fees|etc",
        "pricing": "$X/mo or $X one-time",
        "revenueEstimate": "$X-Xk MRR at X users"
      },
      "techStack": ["React", "Node.js", "Specific API/DB"],
      "mvpScope": "What the SMALLEST viable version includes",
      "effortEstimate": "weekend|1-2 weeks|2-4 weeks|1-2 months|3+ months",
      "competitiveEdge": "Why this wins against alternatives",
      "risks": ["Risk 1", "Risk 2"],
      "score": 75
    }
  ]
}

Scoring criteria (0-100):
- Technical feasibility for solo dev (weight: 30%)
- Market timing and opportunity (weight: 25%)
- Monetization clarity (weight: 20%)
- Competitive positioning (weight: 15%)
- Effort vs potential return (weight: 10%)

IMPORTANT:
- Each concept should be ACTIONABLE - something a solo dev could start building TODAY
- Effort estimates should be REALISTIC for one person
- Scores should reflect THIS builder profile, not general market opportunity
- Include at least one "quick win" (weekend-2 weeks) and one "ambitious bet" (1-2 months)
- Names should be memorable and domain-available-sounding`;
}
