import { JSON_INSTRUCTION } from './common';
import type { IndustryExpression } from '../../../types';
import type { FrameworkDefinition } from '../../../utils/framework-analyzer';

/**
 * Build inspiration chain context string
 */
function buildChainContext(expression: IndustryExpression, allExpressions: IndustryExpression[]): string {
  const ancestors: string[] = [];

  // Build ancestor chain from inspirations
  if (expression.inspirations && expression.inspirations.length > 0) {
    expression.inspirations.forEach(insp => {
      ancestors.push(`- ${insp.source}: ${insp.mechanism} (twist: ${insp.twist})`);
    });
  }

  return `TARGET INNOVATION: "${expression.name}"
Enabler: ${expression.mutation}
Core Insight: ${expression.insight}

DIRECT INSPIRATIONS:
${ancestors.length > 0 ? ancestors.join('\n') : 'None specified'}

AVAILABLE CONTEXT (${allExpressions.length} related expressions for deeper analysis)`;
}

/**
 * Build all 5 chain analysis framework prompts
 */
export function buildChainFrameworks(expression: IndustryExpression, allExpressions: IndustryExpression[]): FrameworkDefinition[] {
  const chainContext = buildChainContext(expression, allExpressions);

  return [
    {
      type: 'lineage-tracing' as const,
      prompt: `Analyze "${expression.name}" using LINEAGE TRACING framework.
Map the complete genealogy of ideas that led to this innovation.

${chainContext}

${JSON_INSTRUCTION}
{
  "analysisType": "lineage-tracing",
  "targetInnovation": "${expression.name}",
  "genealogy": {
    "directAncestors": [
      {"source": "Immediate inspiration", "contribution": "What it provided", "era": "When it emerged"}
    ],
    "indirectInfluences": [
      {"source": "Earlier influence", "connection": "How it connects", "degree": "1st/2nd/3rd generation"}
    ],
    "foundationalConcepts": ["Core concept 1", "Core concept 2"]
  },
  "lineageDepth": 3,
  "branchingFactor": 2,
  "strategicInsight": "Key insight about this innovation's lineage",
  "heritageStrength": 75,
  "noveltyRatio": 25
}`
    },
    {
      type: 'influence-mapping' as const,
      prompt: `Analyze "${expression.name}" using INFLUENCE MAPPING framework.
Identify which prior innovations had the strongest influence and how.

${chainContext}

${JSON_INSTRUCTION}
{
  "analysisType": "influence-mapping",
  "targetInnovation": "${expression.name}",
  "influenceNetwork": {
    "primaryInfluences": [
      {
        "source": "Key inspiration",
        "influenceType": "Conceptual/Technical/Structural/Market",
        "strength": 85,
        "mechanism": "What specifically was borrowed",
        "transformation": "How it was adapted"
      }
    ],
    "secondaryInfluences": [
      {"source": "Supporting inspiration", "influenceType": "Type", "strength": 40, "role": "Supporting role"}
    ],
    "crossDomainBorrowing": ["Idea from domain X", "Idea from domain Y"]
  },
  "totalInfluenceScore": 80,
  "originalityScore": 70,
  "strategicInsight": "Key insight about influence patterns",
  "dominantInfluenceType": "Conceptual/Technical/etc",
  "innovationMechanism": "How influences were combined"
}`
    },
    {
      type: 'divergence-patterns' as const,
      prompt: `Analyze "${expression.name}" using DIVERGENCE PATTERNS framework.
Identify where this innovation deviates from its inspirations and why.

${chainContext}

${JSON_INSTRUCTION}
{
  "analysisType": "divergence-patterns",
  "targetInnovation": "${expression.name}",
  "keyDivergences": [
    {
      "aspect": "What changed",
      "fromPattern": "Original approach",
      "toPattern": "New approach",
      "divergenceType": "Substitution/Addition/Removal/Transformation",
      "rationale": "Why the change",
      "impact": "Effect of divergence"
    }
  ],
  "divergenceScore": 65,
  "continuityScore": 35,
  "strategicInsight": "Key insight about divergence patterns",
  "breakingPoints": ["Where it breaks from tradition 1", "Where it breaks from tradition 2"],
  "retainedCore": ["What stayed the same 1", "What stayed the same 2"]
}`
    },
    {
      type: 'innovation-velocity' as const,
      prompt: `Analyze "${expression.name}" using INNOVATION VELOCITY framework.
Measure the pace of change and evolution in this innovation chain.

${chainContext}

${JSON_INSTRUCTION}
{
  "analysisType": "innovation-velocity",
  "targetInnovation": "${expression.name}",
  "velocityMetrics": {
    "generationGap": "Time between major innovation cycles",
    "accelerationTrend": "Speeding up/Slowing down/Steady",
    "breakthroughFrequency": "How often major shifts occur",
    "incrementalPace": "Rate of small improvements"
  },
  "velocityDrivers": ["What accelerates change 1", "What accelerates change 2"],
  "frictionFactors": ["What slows change 1", "What slows change 2"],
  "velocityScore": 75,
  "momentumIndicator": "high/medium/low",
  "strategicInsight": "Key insight about innovation velocity",
  "futureTrajectory": "Predicted pace of future evolution",
  "disruptionRisk": "high/medium/low"
}`
    },
    {
      type: 'coherence-assessment' as const,
      prompt: `Analyze "${expression.name}" using COHERENCE ASSESSMENT framework.
Evaluate how well the innovation integrates its various inspirations.

${chainContext}

${JSON_INSTRUCTION}
{
  "analysisType": "coherence-assessment",
  "targetInnovation": "${expression.name}",
  "coherenceMetrics": {
    "integrationQuality": "How well components fit together",
    "internalConsistency": "Degree of logical consistency",
    "purposeAlignment": "How well it serves stated goal",
    "contradictionResolution": "How conflicting elements are resolved"
  },
  "coherenceStrengths": ["Strong integration point 1", "Strong integration point 2"],
  "coherenceWeaknesses": ["Weak integration point 1", "Weak integration point 2"],
  "coherenceScore": 80,
  "synthesisQuality": "high/medium/low",
  "strategicInsight": "Key insight about coherence",
  "stabilityImplications": "How coherence affects long-term viability",
  "improvementOpportunities": ["How to increase coherence 1", "How to increase coherence 2"]
}`
    }
  ];
}
