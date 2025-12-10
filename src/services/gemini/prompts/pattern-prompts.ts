import { JSON_INSTRUCTION } from './common';
import type { FrameworkDefinition } from '../../../utils/framework-analyzer';

/**
 * Build mechanism context string for pattern analysis
 */
function buildMechanismsContext(mechanisms: Array<{ expressionName: string; needName: string; coreMechanism: string }>): string {
  return mechanisms.map(m => `- "${m.expressionName}" (${m.needName}): ${m.coreMechanism}`).join('\n');
}

/**
 * Build all 5 pattern analysis framework prompts
 */
export function buildPatternFrameworks(
  patternName: string,
  mechanisms: Array<{ expressionName: string; needName: string; coreMechanism: string }>
): FrameworkDefinition[] {
  const mechanismsContext = buildMechanismsContext(mechanisms);
  const count = mechanisms.length;

  return [
    {
      type: 'frequency-distribution' as const,
      prompt: `Analyze the pattern "${patternName}" using FREQUENCY & DISTRIBUTION framework.
Map where this pattern appears and identify concentration zones.

PATTERN INSTANCES (${count} total):
${mechanismsContext}

${JSON_INSTRUCTION}
{
  "analysisType": "frequency-distribution",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${count},
  "distributionMap": {
    "needs": [{"needName": "Need 1", "count": 3, "dominance": 75}],
    "industries": [{"industryName": "Industry 1", "context": "How pattern manifests here"}],
    "hotZones": ["Needs with high concentration"],
    "coldZones": ["Underutilized needs where pattern could expand"],
    "densityScore": 65
  },
  "strengthScore": 75,
  "universalityScore": 80,
  "maturityLevel": 70,
  "adoptionRate": 65,
  "needCoverage": "broad",
  "stabilityRating": "stable",
  "combinationAffinity": "high",
  "transferReadiness": "medium",
  "keyInsight": "Main insight about this pattern's distribution",
  "strategicImplications": ["Implication 1", "Implication 2"],
  "risks": ["Risk 1", "Risk 2"]
}`
    },
    {
      type: 'need-mapping' as const,
      prompt: `Analyze the pattern "${patternName}" using NEED-MAPPING framework.
Examine HOW this pattern serves different human needs.

PATTERN INSTANCES (${count} total):
${mechanismsContext}

${JSON_INSTRUCTION}
{
  "analysisType": "need-mapping",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${count},
  "needAdaptations": [
    {
      "needName": "Need 1",
      "adaptation": "How pattern specifically serves this need",
      "effectiveness": "high",
      "uniqueCharacteristics": "What makes it unique for this need",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "strengthScore": 70,
  "universalityScore": 85,
  "maturityLevel": 75,
  "adoptionRate": 60,
  "needCoverage": "broad",
  "stabilityRating": "evolving",
  "combinationAffinity": "high",
  "transferReadiness": "high",
  "keyInsight": "Key insight about pattern's versatility across needs",
  "strategicImplications": ["Implication 1", "Implication 2"],
  "risks": ["Risk 1"]
}`
    },
    {
      type: 'evolution-trajectory' as const,
      prompt: `Analyze the pattern "${patternName}" using EVOLUTION TRAJECTORY framework.
Trace how this pattern has evolved and predict its next stage.

PATTERN INSTANCES (${count} total):
${mechanismsContext}

${JSON_INSTRUCTION}
{
  "analysisType": "evolution-trajectory",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${count},
  "evolutionStages": {
    "earlyAdopters": [{"industry": "Pioneer industry 1", "innovation": "What they innovated", "era": "Time period"}],
    "mainstreamPhase": {"description": "How pattern became mainstream", "timeframe": "When it happened", "catalysts": ["Catalyst 1"]},
    "maturityIndicators": ["Indicator 1", "Indicator 2"],
    "nextEvolution": "Predicted next evolution stage",
    "evolutionSpeed": "moderate"
  },
  "strengthScore": 80,
  "universalityScore": 70,
  "maturityLevel": 85,
  "adoptionRate": 75,
  "needCoverage": "moderate",
  "stabilityRating": "stable",
  "combinationAffinity": "medium",
  "transferReadiness": "medium",
  "keyInsight": "Key insight about pattern's evolution",
  "strategicImplications": ["Implication 1", "Implication 2"],
  "risks": ["Risk 1", "Risk 2"]
}`
    },
    {
      type: 'combination-synergies' as const,
      prompt: `Analyze the pattern "${patternName}" using COMBINATION SYNERGIES framework.
Identify which other patterns work well (or poorly) with this one.

PATTERN INSTANCES (${count} total):
${mechanismsContext}

${JSON_INSTRUCTION}
{
  "analysisType": "combination-synergies",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${count},
  "synergyPatterns": {
    "strongPairings": [
      {
        "pattern": "Compatible pattern 1",
        "synergyType": "Type of synergy",
        "benefit": "What combining them achieves",
        "examples": ["Example 1"]
      }
    ],
    "antiPatterns": [{"pattern": "Conflicting pattern", "conflict": "Why they conflict", "mitigation": "How to resolve"}],
    "optimalStacks": [{"stackName": "Stack name 1", "patterns": ["Pattern 1", "Pattern 2"], "useCase": "Best use case"}],
    "coOccurrenceRate": 70
  },
  "strengthScore": 75,
  "universalityScore": 80,
  "maturityLevel": 70,
  "adoptionRate": 65,
  "needCoverage": "moderate",
  "stabilityRating": "evolving",
  "combinationAffinity": "high",
  "transferReadiness": "high",
  "keyInsight": "Key insight about pattern combinations",
  "strategicImplications": ["Implication 1", "Implication 2"],
  "risks": ["Risk 1"]
}`
    },
    {
      type: 'transfer-potential' as const,
      prompt: `Analyze the pattern "${patternName}" using TRANSFER POTENTIAL framework.
Evaluate how easily this pattern can be transferred to new domains and needs.

PATTERN INSTANCES (${count} total):
${mechanismsContext}

${JSON_INSTRUCTION}
{
  "analysisType": "transfer-potential",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${count},
  "transferMetrics": {
    "abstractionLevel": "high",
    "dependencyComplexity": "low",
    "contextSensitivity": "medium",
    "transferBarriers": ["Barrier 1", "Barrier 2"],
    "successFactors": ["Factor 1", "Factor 2"]
  },
  "promisingDomains": [
    {
      "domain": "Target domain 1",
      "transferFit": 85,
      "adaptationsNeeded": ["Adaptation 1", "Adaptation 2"],
      "expectedImpact": "high",
      "pioneersNeeded": "Technical expertise required"
    }
  ],
  "strengthScore": 80,
  "universalityScore": 90,
  "maturityLevel": 75,
  "adoptionRate": 70,
  "needCoverage": "broad",
  "stabilityRating": "stable",
  "combinationAffinity": "high",
  "transferReadiness": "high",
  "keyInsight": "Key insight about pattern transferability",
  "strategicImplications": ["Implication 1", "Implication 2"],
  "risks": ["Risk 1"]
}`
    }
  ];
}
