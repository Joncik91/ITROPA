import { JSON_INSTRUCTION } from './common';
import type { IndustryExpression } from '../../../types';
import type { FrameworkDefinition } from '../../../utils/framework-analyzer';

/**
 * Build all 5 mechanism extraction framework prompts
 */
export function buildMechanismFrameworks(industry: IndustryExpression): FrameworkDefinition[] {
  return [
    {
      type: 'functional' as const,
      prompt: `Analyze "${industry.name}" using FUNCTIONAL DECOMPOSITION framework.
Break down into 3-5 core functions/principles. Focus on WHAT it does and WHY each function is essential.

${JSON_INSTRUCTION}
{
  "analysisType": "functional",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Highest-level pattern abstracted from this mechanism",
  "keyPrinciples": [
    {"principle": "Core principle 1", "function": "What it does", "criticality": "Why it's essential"},
    {"principle": "Core principle 2", "function": "What it does", "criticality": "Why it's essential"},
    {"principle": "Core principle 3", "function": "What it does", "criticality": "Why it's essential"}
  ],
  "historicalApplications": [
    {"domain": "Historical field 1", "example": "Concrete example", "era": "Time period", "successFactors": "Why it worked", "limitations": "Why it couldn't expand", "evolutionPath": "How it developed"},
    {"domain": "Historical field 2", "example": "Concrete example", "era": "Time period", "successFactors": "Why it worked", "limitations": "Why it couldn't expand", "evolutionPath": "How it developed"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How to apply", "novelty": "What's new", "transferBarriers": "What makes it hard", "requiredAdaptations": "What must change", "impactPotential": "high"},
    {"domain": "Unexplored field 2", "opportunity": "How to apply", "novelty": "What's new", "transferBarriers": "What makes it hard", "requiredAdaptations": "What must change", "impactPotential": "medium"}
  ],
  "combinationPotential": ["Compatible mechanism 1", "Compatible mechanism 2"],
  "transferPotential": 75,
  "abstractionLevel": "high",
  "maturityScore": 80,
  "complexityRating": "medium",
  "universality": "broad",
  "disruptionPotential": "high"
}`
    },
    {
      type: 'structural' as const,
      prompt: `Analyze "${industry.name}" using STRUCTURAL ANALYSIS framework.
Identify 3-5 key components, relationships, and flows. Focus on HOW elements interact.

${JSON_INSTRUCTION}
{
  "analysisType": "structural",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Structural pattern at highest abstraction",
  "structuralElements": [
    {"element": "Component 1", "role": "Its function", "interactions": "How it connects to others"},
    {"element": "Component 2", "role": "Its function", "interactions": "How it connects to others"},
    {"element": "Component 3", "role": "Its function", "interactions": "How it connects to others"}
  ],
  "historicalApplications": [
    {"domain": "Historical field 1", "example": "Concrete example", "era": "Time period", "successFactors": "Why structure worked", "limitations": "Structural weaknesses", "evolutionPath": "How structure evolved"},
    {"domain": "Historical field 2", "example": "Concrete example", "era": "Time period", "successFactors": "Why structure worked", "limitations": "Structural weaknesses", "evolutionPath": "How structure evolved"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How structure applies", "novelty": "Unique structural insight", "transferBarriers": "Structural incompatibilities", "requiredAdaptations": "How to adapt structure", "impactPotential": "high"},
    {"domain": "Unexplored field 2", "opportunity": "How structure applies", "novelty": "Unique structural insight", "transferBarriers": "Structural incompatibilities", "requiredAdaptations": "How to adapt structure", "impactPotential": "medium"}
  ],
  "combinationPotential": ["Complementary structure 1", "Complementary structure 2"],
  "transferPotential": 70,
  "abstractionLevel": "medium",
  "maturityScore": 75,
  "complexityRating": "medium",
  "universality": "moderate",
  "disruptionPotential": "medium"
}`
    },
    {
      type: 'causal' as const,
      prompt: `Analyze "${industry.name}" using CAUSAL CHAIN MAPPING framework.
Map cause-effect sequence from input to output. Identify critical intervention points.

${JSON_INSTRUCTION}
{
  "analysisType": "causal",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Causal pattern at highest abstraction",
  "causalChain": {
    "trigger": "What initiates the process",
    "sequence": ["Step 1: cause → effect", "Step 2: cause → effect", "Step 3: cause → effect"],
    "outcome": "Final result",
    "interventionPoints": ["Where to intervene 1", "Where to intervene 2"]
  },
  "historicalApplications": [
    {"domain": "Historical field 1", "example": "Concrete example", "era": "Time period", "successFactors": "Why causal chain worked", "limitations": "Where chain broke", "evolutionPath": "How chain was refined"},
    {"domain": "Historical field 2", "example": "Concrete example", "era": "Time period", "successFactors": "Why causal chain worked", "limitations": "Where chain broke", "evolutionPath": "How chain was refined"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How causal chain applies", "novelty": "New causal insight", "transferBarriers": "What breaks the chain", "requiredAdaptations": "How to maintain causality", "impactPotential": "high"},
    {"domain": "Unexplored field 2", "opportunity": "How causal chain applies", "novelty": "New causal insight", "transferBarriers": "What breaks the chain", "requiredAdaptations": "How to maintain causality", "impactPotential": "medium"}
  ],
  "combinationPotential": ["Sequential mechanism 1", "Parallel mechanism 2"],
  "transferPotential": 65,
  "abstractionLevel": "medium",
  "maturityScore": 70,
  "complexityRating": "high",
  "universality": "moderate",
  "disruptionPotential": "medium"
}`
    },
    {
      type: 'constraint-opportunity' as const,
      prompt: `Analyze "${industry.name}" using CONSTRAINT-OPPORTUNITY framework.
Identify what limitations/constraints actually ENABLE new opportunities (judo principle).

${JSON_INSTRUCTION}
{
  "analysisType": "constraint-opportunity",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Constraint-opportunity pattern at highest abstraction",
  "constraintOpportunities": [
    {"constraint": "Limitation 1", "opportunity": "What it enables", "application": "How to exploit this"},
    {"constraint": "Limitation 2", "opportunity": "What it enables", "application": "How to exploit this"},
    {"constraint": "Limitation 3", "opportunity": "What it enables", "application": "How to exploit this"}
  ],
  "historicalApplications": [
    {"domain": "Historical field 1", "example": "Concrete example", "era": "Time period", "successFactors": "Which constraints enabled success", "limitations": "Constraints that weren't overcome", "evolutionPath": "How constraints were leveraged"},
    {"domain": "Historical field 2", "example": "Concrete example", "era": "Time period", "successFactors": "Which constraints enabled success", "limitations": "Constraints that weren't overcome", "evolutionPath": "How constraints were leveraged"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How constraints create opportunity", "novelty": "Unexpected constraint leverage", "transferBarriers": "Missing constraints", "requiredAdaptations": "How to create/use constraints", "impactPotential": "high"},
    {"domain": "Unexplored field 2", "opportunity": "How constraints create opportunity", "novelty": "Unexpected constraint leverage", "transferBarriers": "Missing constraints", "requiredAdaptations": "How to create/use constraints", "impactPotential": "medium"}
  ],
  "combinationPotential": ["Constraint-based mechanism 1", "Opportunity-amplifying mechanism 2"],
  "transferPotential": 60,
  "abstractionLevel": "high",
  "maturityScore": 65,
  "complexityRating": "high",
  "universality": "narrow",
  "disruptionPotential": "high"
}`
    },
    {
      type: 'scale-context' as const,
      prompt: `Analyze "${industry.name}" using SCALE-CONTEXT TRANSFER framework.
Explain how mechanism behaves at micro/meso/macro scales and across contexts.

${JSON_INSTRUCTION}
{
  "analysisType": "scale-context",
  "coreMechanism": "Primary mechanism in 1 sentence",
  "abstractPattern": "Scale-invariant pattern at highest abstraction",
  "scaleContextInsights": {
    "microScale": "How mechanism works at individual/small scale",
    "mesoScale": "How mechanism works at organizational/medium scale",
    "macroScale": "How mechanism works at industry/large scale",
    "contextVariations": ["Variation in context 1", "Variation in context 2", "Variation in context 3"]
  },
  "historicalApplications": [
    {"domain": "Historical field 1", "example": "Concrete example", "era": "Time period", "successFactors": "Which scale/context worked", "limitations": "Scale/context boundaries", "evolutionPath": "How it scaled"},
    {"domain": "Historical field 2", "example": "Concrete example", "era": "Time period", "successFactors": "Which scale/context worked", "limitations": "Scale/context boundaries", "evolutionPath": "How it scaled"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How to apply at different scale/context", "novelty": "New scale/context insight", "transferBarriers": "Scale/context incompatibilities", "requiredAdaptations": "How to adapt to new scale/context", "impactPotential": "high"},
    {"domain": "Unexplored field 2", "opportunity": "How to apply at different scale/context", "novelty": "New scale/context insight", "transferBarriers": "Scale/context incompatibilities", "requiredAdaptations": "How to adapt to new scale/context", "impactPotential": "medium"}
  ],
  "combinationPotential": ["Scale-complementary mechanism 1", "Context-bridging mechanism 2"],
  "transferPotential": 80,
  "abstractionLevel": "high",
  "maturityScore": 85,
  "complexityRating": "low",
  "universality": "broad",
  "disruptionPotential": "high"
}`
    }
  ];
}
