import { JSON_INSTRUCTION } from './common';
import type { FrameworkDefinition } from '../../../utils/framework-analyzer';

/**
 * Build all 5 prior art analysis framework prompts
 */
export function buildPriorArtFrameworks(needName: string, priorArt: any): FrameworkDefinition[] {
  const priorArtContext = JSON.stringify(priorArt, null, 2);

  return [
    {
      type: 'competitive-landscape' as const,
      prompt: `Analyze the prior art for "${needName}" using COMPETITIVE LANDSCAPE framework.
Map current solution providers and their competitive dynamics.

PRIOR ART DATA:
${priorArtContext}

${JSON_INSTRUCTION}
{
  "analysisType": "competitive-landscape",
  "needName": "${needName}",
  "marketStructure": {
    "leaders": [{"name": "Leader 1", "strength": "Core advantage", "weakness": "Key limitation", "marketShare": "Estimated %"}],
    "challengers": [{"name": "Challenger 1", "differentiator": "What makes them different", "growthRate": "Trend"}],
    "niche Players": [{"name": "Niche player 1", "specialization": "Specific focus area"}]
  },
  "competitiveDynamics": {
    "entryBarriers": ["Barrier 1", "Barrier 2"],
    "switchingCosts": "high/medium/low",
    "differentiationFactors": ["Factor 1", "Factor 2"],
    "consolidationTrends": "Trend description"
  },
  "strategicInsight": "Key insight about competitive landscape",
  "opportunityGaps": ["Gap 1", "Gap 2"],
  "disruptionRisks": ["Risk 1", "Risk 2"]
}`
    },
    {
      type: 'gap-analysis' as const,
      prompt: `Analyze the prior art for "${needName}" using GAP ANALYSIS framework.
Identify unmet needs and underserved segments.

PRIOR ART DATA:
${priorArtContext}

${JSON_INSTRUCTION}
{
  "analysisType": "gap-analysis",
  "needName": "${needName}",
  "identifiedGaps": [
    {
      "gapType": "Unmet need/Underserved segment/Missing feature",
      "description": "What's missing",
      "severity": "high/medium/low",
      "affectedUsers": "Who is impacted",
      "opportunitySize": "Market potential estimate"
    }
  ],
  "rootCauses": ["Why gap exists 1", "Why gap exists 2"],
  "emergingDemands": ["Demand trend 1", "Demand trend 2"],
  "strategicInsight": "Key insight about market gaps",
  "innovationOpportunities": ["Opportunity 1", "Opportunity 2"],
  "timingFactors": ["Factor affecting timing 1", "Factor affecting timing 2"]
}`
    },
    {
      type: 'evolution-pattern' as const,
      prompt: `Analyze the prior art for "${needName}" using EVOLUTION PATTERN framework.
Trace how solutions have evolved and predict future trajectories.

PRIOR ART DATA:
${priorArtContext}

${JSON_INSTRUCTION}
{
  "analysisType": "evolution-pattern",
  "needName": "${needName}",
  "evolutionTimeline": {
    "historicalPhases": [
      {"era": "Time period", "dominantSolution": "What was used", "keyCharacteristics": "How it worked", "limitations": "Why it evolved"}
    ],
    "currentState": "Description of current solutions",
    "emergingTrends": ["Trend 1", "Trend 2", "Trend 3"]
  },
  "evolutionDrivers": ["Driver 1", "Driver 2"],
  "nextPhase Prediction": "What's likely to emerge next",
  "strategicInsight": "Key insight about evolution patterns",
  "disruptionIndicators": ["Indicator 1", "Indicator 2"],
  "continuityFactors": ["What will persist", "What will persist 2"]
}`
    },
    {
      type: 'innovation-potential' as const,
      prompt: `Analyze the prior art for "${needName}" using INNOVATION POTENTIAL framework.
Assess opportunity for novel approaches and breakthrough innovations.

PRIOR ART DATA:
${priorArtContext}

${JSON_INSTRUCTION}
{
  "analysisType": "innovation-potential",
  "needName": "${needName}",
  "innovationOpportunities": [
    {
      "opportunityType": "Breakthrough/Incremental/Architectural",
      "description": "Innovation possibility",
      "noveltyScore": 85,
      "feasibilityScore": 70,
      "impactPotential": "high/medium/low",
      "requiredCapabilities": ["Capability 1", "Capability 2"]
    }
  ],
  "whiteSpaceAreas": ["Unexplored area 1", "Unexplored area 2"],
  "crossPollination Potential": ["Idea from adjacent domain 1", "Idea from adjacent domain 2"],
  "strategicInsight": "Key insight about innovation potential",
  "investmentPriorities": ["Priority 1", "Priority 2"],
  "riskFactors": ["Risk 1", "Risk 2"]
}`
    },
    {
      type: 'strategic-positioning' as const,
      prompt: `Analyze the prior art for "${needName}" using STRATEGIC POSITIONING framework.
Identify optimal positioning strategies for new entrants.

PRIOR ART DATA:
${priorArtContext}

${JSON_INSTRUCTION}
{
  "analysisType": "strategic-positioning",
  "needName": "${needName}",
  "positioningOptions": [
    {
      "strategy": "Low-cost/Differentiation/Niche focus/etc",
      "rationale": "Why this positioning works",
      "targetSegment": "Who to serve",
      "valueProposition": "Unique value offered",
      "competitiveAdvantage": "Source of advantage",
      "risks": ["Risk 1", "Risk 2"]
    }
  ],
  "blueOceanOpportunities": ["Opportunity 1 where competition is low", "Opportunity 2"],
  "firstMoverAdvantages": ["Advantage 1", "Advantage 2"],
  "strategicInsight": "Key insight about optimal positioning",
  "successFactors": ["Factor 1", "Factor 2"],
  "avoidableTraps": ["Trap 1", "Trap 2"]
}`
    }
  ];
}
