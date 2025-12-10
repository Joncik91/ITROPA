import { JSON_ONLY } from './common';
import type { IndustryExpression } from '../../../types';

/**
 * Generate prompt for deep dive business analysis
 */
export function buildDeepDivePrompt(industry: IndustryExpression): string {
  return `Provide detailed business analysis for the emerging industry "${industry.name}".

Context:
- Mutation/Enabler: ${industry.mutation}
- Core Insight: ${industry.insight}

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
  "risks": ["Risk factor 1", "Risk factor 2", "Risk factor 3"]
}`;
}
