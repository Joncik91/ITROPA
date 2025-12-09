import type { Need, PriorArt, IndustryExpression, MechanismDetails, DeepDiveDetails } from "../types";
import { apiClient } from "./api-client.service";

class GeminiService {
  constructor() {
    // No longer needs API key - using backend API
  }

  private async callAPI(prompt: string, maxTokens: number = 8000, retries: number = 1): Promise<any> {
    return apiClient.callGemini(prompt, maxTokens, retries);
  }

  private extractJSON(text: string): any {
    // Remove markdown code blocks
    let jsonStr = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    // Find the first and last braces/brackets
    const firstBrace = jsonStr.search(/[\[{]/);
    const lastBrace = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (e: any) {
      // Try to fix common JSON issues
      // Remove trailing commas before closing brackets/braces
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      // Fix unescaped quotes in strings (basic attempt)
      jsonStr = jsonStr.replace(/([^\\])"([^"]*)":/g, '$1\\"$2\\":');
      
      try {
        return JSON.parse(jsonStr);
      } catch (e2) {
        console.error("Failed to parse JSON:", jsonStr.substring(0, 500));
        throw new Error(`JSON Parse Error: ${e.message}`);
      }
    }
  }

  async fetchPriorArt(need: string): Promise<PriorArt> {
    const prompt = `You are researching existing solutions for the human need: "${need}"

Respond with ONLY valid JSON (no explanations, no markdown, no trailing commas):

{
  "currentLeaders": [
    {"name": "Solution 1", "domain": "Industry", "mechanism": "How it works", "limitation": "What it misses"}
  ],
  "historicalPrecedents": [
    {"name": "Historical solution", "era": "Time period", "mechanism": "Why it worked", "lesson": "Key insight"}
  ],
  "adjacentDomains": [
    {"name": "Solution from other field", "originalDomain": "Field", "mechanism": "Core principle", "transferPotential": "How to apply"}
  ],
  "natureSolutions": [
    {"name": "Natural example", "mechanism": "How nature does it", "biomimicryPotential": "Application"}
  ]
}

Provide 3-4 comprehensive items per category with detailed descriptions. Ensure all JSON is valid with no trailing commas.`;
    
    return this.callAPI(prompt, 3000);
  }

  async generateNeed(needName: string, priorArt: PriorArt): Promise<Need> {
    const prompt = `Generate future industries for the human need "${needName}". Each prediction should recombine ideas from existing solutions.

Prior art context: ${JSON.stringify(priorArt)}

Respond with ONLY a JSON object (no explanation, no markdown):

{
  "id": "${needName.toLowerCase().replace(/\s+/g, '-')}",
  "name": "${needName}",
  "icon": "Users",
  "description": "Brief description of this need",
  "priorArt": ${JSON.stringify(priorArt)},
  "eras": [
    {"name": "Pre-Industrial", "expressions": ["Example 1", "Example 2"]},
    {"name": "Industrial", "expressions": ["Example 1", "Example 2"]},
    {"name": "Digital (2000s-2020)", "expressions": ["Example 1", "Example 2"]},
    {
      "name": "Post-AI Era (2025+)",
      "expressions": [
        {"id": "1", "type": "future", "name": "Future Industry 1", "mutation": "What enables it", "insight": "Why it emerges", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "2", "type": "future", "name": "Future Industry 2", "mutation": "What enables it", "insight": "Why it emerges", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "3", "type": "future", "name": "Future Industry 3", "mutation": "What enables it", "insight": "Why it emerges", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "4", "type": "future", "name": "Future Industry 4", "mutation": "What enables it", "insight": "Why it emerges", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "5", "type": "future", "name": "Future Industry 5", "mutation": "What enables it", "insight": "Why it emerges", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []}
      ]
    }
  ],
  "relatedNeeds": ["Related Need 1", "Related Need 2", "Related Need 3"]
}

Use icon from: Users, Zap, Brain, Heart, Shield, Leaf, Sparkles. Generate 5-7 diverse future industries with rich inspirations from prior art.`;
    
    return this.callAPI(prompt, 6000);
  }

  async branchIndustry(parent: IndustryExpression): Promise<IndustryExpression[]> {
    const prompt = `Generate 3 sub-industries that branch from "${parent.name}" (${parent.mutation}).

Respond with ONLY a JSON array (no explanation, no markdown):

[
  {"id": "${parent.id}-1", "type": "future", "name": "Sub-industry 1", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []},
  {"id": "${parent.id}-2", "type": "future", "name": "Sub-industry 2", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []},
  {"id": "${parent.id}-3", "type": "future", "name": "Sub-industry 3", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []}
]`;
    
    return this.callAPI(prompt, 2500);
  }

  async extractMechanism(industry: IndustryExpression): Promise<MechanismDetails[]> {
    // Use multiple analytical frameworks to extract mechanism from different perspectives
    // This provides comprehensive understanding for cross-domain transfer
    
    const frameworks = [
      {
        type: 'functional' as const,
        prompt: `Analyze "${industry.name}" using FUNCTIONAL DECOMPOSITION framework.
Break down into 3-5 core functions/principles. Focus on WHAT it does and WHY each function is essential.

Respond with ONLY valid JSON (no markdown, no explanation):
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

Respond with ONLY valid JSON (no markdown, no explanation):
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

Respond with ONLY valid JSON (no markdown, no explanation):
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

Respond with ONLY valid JSON (no markdown, no explanation):
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

Respond with ONLY valid JSON (no markdown, no explanation):
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

    // Generate all 5 mechanism analyses in parallel
    const analyses = await Promise.all(
      frameworks.map(({ type, prompt }) => 
        this.callAPI(prompt, 3000).catch(err => {
          console.error(`Failed to generate ${type} analysis:`, err);
          return null;
        })
      )
    );

    // Filter out failed analyses and return successful ones
    return analyses.filter((analysis): analysis is MechanismDetails => analysis !== null);
  }

  async analyzePatterns(
    patternName: string,
    mechanisms: Array<{
      expressionName: string;
      needName: string;
      coreMechanism: string;
    }>
  ): Promise<any[]> {
    // Multi-framework pattern analysis across needs
    // Provides strategic insights about recurring patterns
    
    const mechanismsContext = mechanisms.map(m => 
      `- "${m.expressionName}" (${m.needName}): ${m.coreMechanism}`
    ).join('\n');
    
    const frameworks = [
      {
        type: 'frequency-distribution' as const,
        prompt: `Analyze the pattern "${patternName}" using FREQUENCY & DISTRIBUTION framework.
Map where this pattern appears and identify concentration zones.

PATTERN INSTANCES (${mechanisms.length} total):
${mechanismsContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "frequency-distribution",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${mechanisms.length},
  "distributionMap": {
    "needs": [
      {"needName": "Need 1", "count": 3, "dominance": 75},
      {"needName": "Need 2", "count": 2, "dominance": 50}
    ],
    "industries": [
      {"industryName": "Industry 1", "context": "How pattern manifests here"},
      {"industryName": "Industry 2", "context": "How pattern manifests here"}
    ],
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

PATTERN INSTANCES (${mechanisms.length} total):
${mechanismsContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "need-mapping",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${mechanisms.length},
  "needAdaptations": [
    {
      "needName": "Need 1",
      "adaptation": "How pattern specifically serves this need",
      "effectiveness": "high",
      "uniqueCharacteristics": "What makes it unique for this need",
      "examples": ["Example 1", "Example 2"]
    },
    {
      "needName": "Need 2",
      "adaptation": "How pattern specifically serves this need",
      "effectiveness": "medium",
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

PATTERN INSTANCES (${mechanisms.length} total):
${mechanismsContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "evolution-trajectory",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${mechanisms.length},
  "evolutionStages": {
    "earlyAdopters": [
      {"industry": "Pioneer industry 1", "innovation": "What they innovated", "era": "Time period"},
      {"industry": "Pioneer industry 2", "innovation": "What they innovated", "era": "Time period"}
    ],
    "mainstreamPhase": {
      "description": "How pattern became mainstream",
      "timeframe": "When it happened",
      "catalysts": ["Catalyst 1", "Catalyst 2", "Catalyst 3"]
    },
    "maturityIndicators": ["Indicator 1", "Indicator 2", "Indicator 3"],
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

PATTERN INSTANCES (${mechanisms.length} total):
${mechanismsContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "combination-synergies",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${mechanisms.length},
  "synergyPatterns": {
    "strongPairings": [
      {
        "pattern": "Compatible pattern 1",
        "synergyType": "Type of synergy (complementary/amplifying/sequential)",
        "benefit": "What combining them achieves",
        "examples": ["Example 1", "Example 2"]
      },
      {
        "pattern": "Compatible pattern 2",
        "synergyType": "Type of synergy",
        "benefit": "What combining them achieves",
        "examples": ["Example 1", "Example 2"]
      }
    ],
    "antiPatterns": [
      {
        "pattern": "Conflicting pattern",
        "conflict": "Why they conflict",
        "mitigation": "How to resolve the conflict"
      }
    ],
    "optimalStacks": [
      {
        "stackName": "Stack name 1",
        "patterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
        "useCase": "Best use case for this stack"
      },
      {
        "stackName": "Stack name 2",
        "patterns": ["Pattern A", "Pattern B"],
        "useCase": "Best use case for this stack"
      }
    ],
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
Identify where this pattern should be applied next.

PATTERN INSTANCES (${mechanisms.length} total):
${mechanismsContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "transfer-potential",
  "patternName": "${patternName}",
  "abstractDescription": "High-level description of this pattern",
  "occurrenceCount": ${mechanisms.length},
  "transferTargets": [
    {
      "targetNeed": "Underutilized need 1",
      "targetIndustry": "Specific industry opportunity",
      "transferDifficulty": "medium",
      "expectedImpact": "high",
      "requiredAdaptations": ["Adaptation 1", "Adaptation 2"],
      "marketGap": "Gap this would fill",
      "timeToImplementation": "Realistic timeline"
    },
    {
      "targetNeed": "Underutilized need 2",
      "targetIndustry": "Specific industry opportunity",
      "transferDifficulty": "low",
      "expectedImpact": "medium",
      "requiredAdaptations": ["Adaptation 1"],
      "marketGap": "Gap this would fill",
      "timeToImplementation": "Realistic timeline"
    }
  ],
  "strengthScore": 80,
  "universalityScore": 85,
  "maturityLevel": 75,
  "adoptionRate": 70,
  "needCoverage": "broad",
  "stabilityRating": "stable",
  "combinationAffinity": "high",
  "transferReadiness": "high",
  "keyInsight": "Key insight about transfer opportunities",
  "strategicImplications": ["Implication 1", "Implication 2", "Implication 3"],
  "risks": ["Risk 1"]
}`
      }
    ];

    // Generate all 5 pattern analyses in parallel
    const analyses = await Promise.all(
      frameworks.map(({ type, prompt }) => 
        this.callAPI(prompt, 3000).catch(err => {
          console.error(`Failed to generate ${type} pattern analysis:`, err);
          return null;
        })
      )
    );

    // Filter out failed analyses and return successful ones
    return analyses.filter((analysis): analysis is any => analysis !== null);
  }

  async analyzePriorArt(needName: string, priorArt: any): Promise<any[]> {
    // Multi-framework prior art analysis for competitive intelligence
    // Provides strategic insights about market landscape and opportunities
    
    const priorArtContext = `
Current Leaders: ${JSON.stringify(priorArt.currentLeaders || [])}
Historical Precedents: ${JSON.stringify(priorArt.historicalPrecedents || [])}
Adjacent Domains: ${JSON.stringify(priorArt.adjacentDomains || [])}
Nature's Solutions: ${JSON.stringify(priorArt.natureSolutions || [])}
`;
    
    const frameworks = [
      {
        type: 'competitive-landscape' as const,
        prompt: `Analyze the competitive landscape for "${needName}" using COMPETITIVE LANDSCAPE MAPPING framework.
Identify market leaders, their positioning, and competitive dynamics.

PRIOR ART CONTEXT:
${priorArtContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "competitive-landscape",
  "needName": "${needName}",
  "competitiveSegments": [
    {"segmentName": "Segment 1", "players": ["Player A", "Player B"], "marketShare": "Estimated share", "competitiveIntensity": "high"},
    {"segmentName": "Segment 2", "players": ["Player C"], "marketShare": "Estimated share", "competitiveIntensity": "medium"}
  ],
  "leaderProfiles": [
    {"name": "Leader 1", "position": "Market position", "keyStrength": "What they excel at", "vulnerability": "Their weakness"},
    {"name": "Leader 2", "position": "Market position", "keyStrength": "What they excel at", "vulnerability": "Their weakness"}
  ],
  "competitiveDynamics": {
    "primaryBattlegrounds": ["Where competition is fiercest 1", "Where competition is fiercest 2"],
    "emergingThreats": ["New threat 1", "New threat 2"],
    "consolidationTrends": "Industry consolidation patterns"
  },
  "competitiveIntensity": 75,
  "marketMaturity": 70,
  "innovationOpportunity": 65,
  "whiteSpaceScore": 60,
  "disruptionPotential": 70,
  "entryBarrier": "medium",
  "competitiveStructure": "oligopoly",
  "innovationPace": "moderate",
  "customerSatisfaction": "medium",
  "keyInsight": "Key insight about competitive landscape",
  "strategicImperatives": ["Strategic priority 1", "Strategic priority 2"],
  "criticalRisks": ["Risk 1", "Risk 2"]
}`
      },
      {
        type: 'gap-analysis' as const,
        prompt: `Analyze gaps and opportunities for "${needName}" using GAP ANALYSIS framework.
Identify unmet needs, underserved segments, and white space opportunities.

PRIOR ART CONTEXT:
${priorArtContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "gap-analysis",
  "needName": "${needName}",
  "unmetNeeds": [
    {"need": "Unmet need 1", "severity": "high", "affectedSegment": "Who feels this pain", "currentWorkarounds": "How they cope today"},
    {"need": "Unmet need 2", "severity": "medium", "affectedSegment": "Who feels this pain", "currentWorkarounds": "How they cope today"}
  ],
  "underservedSegments": [
    {"segment": "Segment 1", "size": "Market size estimate", "whyUnderserved": "Why no one serves them", "opportunity": "What could be built"},
    {"segment": "Segment 2", "size": "Market size estimate", "whyUnderserved": "Why no one serves them", "opportunity": "What could be built"}
  ],
  "whiteSpaces": [
    {"opportunity": "White space 1", "description": "Detailed description", "accessibilityRating": "medium", "potentialImpact": "high"},
    {"opportunity": "White space 2", "description": "Detailed description", "accessibilityRating": "high", "potentialImpact": "medium"}
  ],
  "competitiveIntensity": 60,
  "marketMaturity": 65,
  "innovationOpportunity": 85,
  "whiteSpaceScore": 80,
  "disruptionPotential": 75,
  "entryBarrier": "low",
  "competitiveStructure": "fragmented",
  "innovationPace": "rapid",
  "customerSatisfaction": "low",
  "keyInsight": "Key insight about market gaps",
  "strategicImperatives": ["Priority 1", "Priority 2", "Priority 3"],
  "criticalRisks": ["Risk 1"]
}`
      },
      {
        type: 'evolution-pattern' as const,
        prompt: `Analyze evolution patterns for "${needName}" using EVOLUTION PATTERN RECOGNITION framework.
Trace how solutions have evolved and predict future stages.

PRIOR ART CONTEXT:
${priorArtContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "evolution-pattern",
  "needName": "${needName}",
  "evolutionTimeline": [
    {"era": "Era 1", "dominantSolution": "What dominated", "keyInnovation": "Innovation that mattered", "limitation": "Why it wasn't enough"},
    {"era": "Era 2", "dominantSolution": "What dominated", "keyInnovation": "Innovation that mattered", "limitation": "Why it wasn't enough"},
    {"era": "Era 3", "dominantSolution": "What dominated", "keyInnovation": "Innovation that mattered", "limitation": "Current limitations"}
  ],
  "evolutionDrivers": {
    "technological": ["Tech driver 1", "Tech driver 2"],
    "social": ["Social driver 1", "Social driver 2"],
    "economic": ["Economic driver 1", "Economic driver 2"]
  },
  "futureStages": [
    {"stage": "Near future (1-3 years)", "timeframe": "2025-2027", "triggers": ["Trigger 1", "Trigger 2"], "implications": "What this means"},
    {"stage": "Medium term (3-5 years)", "timeframe": "2027-2030", "triggers": ["Trigger 1", "Trigger 2"], "implications": "What this means"}
  ],
  "disruptiveTriggers": ["Trigger that could disrupt 1", "Trigger that could disrupt 2", "Trigger that could disrupt 3"],
  "competitiveIntensity": 70,
  "marketMaturity": 80,
  "innovationOpportunity": 65,
  "whiteSpaceScore": 55,
  "disruptionPotential": 85,
  "entryBarrier": "high",
  "competitiveStructure": "oligopoly",
  "innovationPace": "rapid",
  "customerSatisfaction": "medium",
  "keyInsight": "Key insight about evolution trajectory",
  "strategicImperatives": ["Imperative 1", "Imperative 2"],
  "criticalRisks": ["Risk 1", "Risk 2"]
}`
      },
      {
        type: 'innovation-potential' as const,
        prompt: `Assess innovation potential for "${needName}" using INNOVATION POTENTIAL ASSESSMENT framework.
Identify breakthrough opportunities, risk levels, and resource requirements.

PRIOR ART CONTEXT:
${priorArtContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "innovation-potential",
  "needName": "${needName}",
  "innovationOpportunities": [
    {"type": "incremental", "description": "Opportunity 1", "riskLevel": "low", "expectedImpact": "medium", "timeToMarket": "6-12 months", "resourceRequirements": "Minimal resources"},
    {"type": "adjacent", "description": "Opportunity 2", "riskLevel": "medium", "expectedImpact": "high", "timeToMarket": "1-2 years", "resourceRequirements": "Moderate investment"},
    {"type": "breakthrough", "description": "Opportunity 3", "riskLevel": "high", "expectedImpact": "high", "timeToMarket": "3-5 years", "resourceRequirements": "Significant R&D"}
  ],
  "quickWins": [
    {"opportunity": "Quick win 1", "effort": "Low effort", "impact": "Medium impact"},
    {"opportunity": "Quick win 2", "effort": "Low effort", "impact": "High impact"}
  ],
  "longTermBets": [
    {"opportunity": "Long-term bet 1", "rationale": "Why this could be huge", "investmentHorizon": "5+ years"},
    {"opportunity": "Long-term bet 2", "rationale": "Why this could be huge", "investmentHorizon": "3-5 years"}
  ],
  "competitiveIntensity": 65,
  "marketMaturity": 60,
  "innovationOpportunity": 90,
  "whiteSpaceScore": 75,
  "disruptionPotential": 80,
  "entryBarrier": "medium",
  "competitiveStructure": "fragmented",
  "innovationPace": "rapid",
  "customerSatisfaction": "low",
  "keyInsight": "Key insight about innovation opportunities",
  "strategicImperatives": ["Imperative 1", "Imperative 2", "Imperative 3"],
  "criticalRisks": ["Risk 1", "Risk 2"]
}`
      },
      {
        type: 'strategic-positioning' as const,
        prompt: `Provide strategic positioning recommendations for "${needName}" using STRATEGIC POSITIONING framework.
Recommend positioning strategies, differentiation approaches, and entry tactics.

PRIOR ART CONTEXT:
${priorArtContext}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "analysisType": "strategic-positioning",
  "needName": "${needName}",
  "positioningStrategies": [
    {"strategy": "Strategy 1", "rationale": "Why this works", "targetSegment": "Who to target", "successFactors": ["Factor 1", "Factor 2"]},
    {"strategy": "Strategy 2", "rationale": "Why this works", "targetSegment": "Who to target", "successFactors": ["Factor 1", "Factor 2"]}
  ],
  "differentiationPillars": [
    {"pillar": "Pillar 1", "howToDifferentiate": "Specific approach", "competitiveAdvantage": "Why it's defensible"},
    {"pillar": "Pillar 2", "howToDifferentiate": "Specific approach", "competitiveAdvantage": "Why it's defensible"},
    {"pillar": "Pillar 3", "howToDifferentiate": "Specific approach", "competitiveAdvantage": "Why it's defensible"}
  ],
  "entryTactics": [
    {"tactic": "Tactic 1", "approach": "How to execute", "risks": ["Risk 1", "Risk 2"], "mitigations": ["Mitigation 1", "Mitigation 2"]},
    {"tactic": "Tactic 2", "approach": "How to execute", "risks": ["Risk 1"], "mitigations": ["Mitigation 1"]}
  ],
  "partnershipOpportunities": [
    {"partner": "Partner type 1", "value": "What they bring", "synergy": "How it creates value"},
    {"partner": "Partner type 2", "value": "What they bring", "synergy": "How it creates value"}
  ],
  "competitiveIntensity": 70,
  "marketMaturity": 75,
  "innovationOpportunity": 70,
  "whiteSpaceScore": 65,
  "disruptionPotential": 75,
  "entryBarrier": "medium",
  "competitiveStructure": "oligopoly",
  "innovationPace": "moderate",
  "customerSatisfaction": "medium",
  "keyInsight": "Key insight about strategic positioning",
  "strategicImperatives": ["Imperative 1", "Imperative 2"],
  "criticalRisks": ["Risk 1", "Risk 2", "Risk 3"]
}`
      }
    ];

    // Generate all 5 prior art analyses in parallel
    const analyses = await Promise.all(
      frameworks.map(({ type, prompt }) => 
        this.callAPI(prompt, 3000).catch(err => {
          console.error(`Failed to generate ${type} prior art analysis:`, err);
          return null;
        })
      )
    );

    // Filter out failed analyses and return successful ones
    return analyses.filter((analysis): analysis is any => analysis !== null);
  }

  async analyzeInspirationChain(expression: IndustryExpression, allExpressions: IndustryExpression[]): Promise<any[]> {
    // Build chain context - get ancestors and descendants
    const getAncestors = (expr: IndustryExpression): string[] => {
      return expr.inspirations?.map(ins => ins.source) || [];
    };

    const getDescendants = (expr: IndustryExpression, all: IndustryExpression[]): string[] => {
      return expr.children?.map(child => child.name) || [];
    };

    const buildChainContext = () => {
      const chain = {
        focal: expression.name,
        ancestors: getAncestors(expression),
        descendants: getDescendants(expression, allExpressions),
        siblings: allExpressions.filter(e => e.id !== expression.id).map(e => e.name).slice(0, 10),
        depth: 0, // Could calculate actual depth
        branchCount: expression.children?.length || 0,
        inspirationSources: expression.inspirations?.map(ins => `${ins.source} (${ins.mechanism})`) || []
      };
      return chain;
    };

    const chainContext = buildChainContext();
    const allNodes = [chainContext.focal, ...chainContext.ancestors, ...chainContext.descendants, ...chainContext.siblings].filter((v, i, a) => a.indexOf(v) === i);

    const frameworks = [
      {
        type: 'lineage-tracing',
        prompt: `You are analyzing the genealogy and evolutionary lineage of an innovation chain.

CHAIN CONTEXT:
Focal Node: ${chainContext.focal}
Direct Ancestors: ${chainContext.ancestors.join(', ') || 'None (root node)'}
Direct Descendants: ${chainContext.descendants.join(', ') || 'None (leaf node)'}
Related Nodes: ${chainContext.siblings.slice(0, 5).join(', ')}
Branch Count: ${chainContext.branchCount}

TASK: Trace the lineage and evolutionary pathways of this innovation chain.

Respond with ONLY valid JSON (no explanations):

{
  "analysisType": "lineage-tracing",
  "summary": "2-3 sentence overview of the lineage structure",
  "generationDepth": 3,
  "totalNodes": ${allNodes.length},
  "longestPath": [
    {"node": "Ancestor", "depth": 0},
    {"node": "Parent", "depth": 1},
    {"node": "${chainContext.focal}", "depth": 2}
  ],
  "branchingPoints": [
    {"node": "${chainContext.focal}", "branchCount": ${chainContext.branchCount}, "generation": 2}
  ],
  "evolutionaryPathways": [
    {"path": ["Node1", "Node2", "Node3"], "theme": "Progressive refinement", "coherence": "high"},
    {"path": ["Node1", "Node4", "Node5"], "theme": "Divergent exploration", "coherence": "medium"}
  ],
  "ancestorInfluence": [
    {"ancestor": "Key Ancestor", "descendantCount": 3, "influenceScore": 85}
  ],
  "chainComplexity": "moderate",
  "innovationPotential": 75,
  "strategicValue": "high",
  "keyInsights": [
    "Insight about lineage structure",
    "Insight about evolutionary patterns",
    "Insight about generational progression"
  ],
  "recommendedActions": [
    "Action to strengthen lineage",
    "Action to diversify branches"
  ]
}`
      },
      {
        type: 'influence-mapping',
        prompt: `You are mapping influence flows and network centrality in an innovation chain.

CHAIN CONTEXT:
Focal Node: ${chainContext.focal}
Inspiration Sources: ${chainContext.inspirationSources.join('; ') || 'Direct creation'}
Influenced Nodes: ${chainContext.descendants.join(', ') || 'None yet'}
Network Size: ${allNodes.length} nodes

TASK: Map the influence patterns and identify central/peripheral nodes.

Respond with ONLY valid JSON:

{
  "analysisType": "influence-mapping",
  "summary": "2-3 sentence overview of influence patterns",
  "centralNodes": [
    {"node": "${chainContext.focal}", "centralityScore": 75, "influenceRadius": 3, "role": "hub"}
  ],
  "inspirationSources": [
    {"source": "Source Name", "frequency": 2, "domains": ["Domain1", "Domain2"], "impactScore": 80}
  ],
  "influenceFlows": [
    {"from": "Ancestor", "to": ["${chainContext.focal}", "Sibling"], "mechanism": "Pattern transfer", "strength": "strong"}
  ],
  "networkDensity": 65,
  "chainComplexity": "moderate",
  "innovationPotential": 70,
  "strategicValue": "high",
  "keyInsights": [
    "Insight about influence patterns",
    "Insight about central nodes",
    "Insight about network structure"
  ],
  "recommendedActions": [
    "Leverage high-influence nodes",
    "Bridge disconnected clusters"
  ]
}`
      },
      {
        type: 'divergence-patterns',
        prompt: `You are analyzing branching patterns and diversity in an innovation chain.

CHAIN CONTEXT:
Focal Node: ${chainContext.focal}
Branches Created: ${chainContext.branchCount}
Children: ${chainContext.descendants.join(', ') || 'None'}
Innovation Type: ${expression.mutation || 'Unknown'}

TASK: Analyze how the chain diverges and creates diversity.

Respond with ONLY valid JSON:

{
  "analysisType": "divergence-patterns",
  "summary": "2-3 sentence overview of divergence patterns",
  "branchingStrategy": "exploratory",
  "diversityScore": 72,
  "specializationNodes": [
    {"node": "Node Name", "specializationType": "deep", "depth": 3}
  ],
  "generalizationNodes": [
    {"node": "Node Name", "breadth": 4, "applicability": "Wide across domains"}
  ],
  "noveltyHotspots": [
    {"node": "${chainContext.focal}", "noveltyScore": 78, "innovationType": "adjacent"}
  ],
  "convergencePoints": [
    {"node": "Node Name", "convergedFrom": ["Branch1", "Branch2"], "synthesis": "Combined approach"}
  ],
  "chainComplexity": "moderate",
  "innovationPotential": 75,
  "strategicValue": "high",
  "keyInsights": [
    "Insight about branching patterns",
    "Insight about specialization vs generalization",
    "Insight about novelty distribution"
  ],
  "recommendedActions": [
    "Explore underutilized branches",
    "Create convergence opportunities"
  ]
}`
      },
      {
        type: 'innovation-velocity',
        prompt: `You are measuring the speed and momentum of innovation in a chain.

CHAIN CONTEXT:
Focal Node: ${chainContext.focal}
Branch Activity: ${chainContext.branchCount} immediate children
Innovation Description: ${expression.mutation}

TASK: Analyze innovation velocity, acceleration zones, and stagnation.

Respond with ONLY valid JSON:

{
  "analysisType": "innovation-velocity",
  "summary": "2-3 sentence overview of innovation velocity",
  "overallVelocity": "steady",
  "velocityScore": 68,
  "accelerationZones": [
    {"nodes": ["Node1", "Node2"], "period": "Recent", "triggerEvent": "Technology breakthrough", "velocityChange": "2x increase"}
  ],
  "stagnationZones": [
    {"nodes": ["Node3"], "reason": "Technical barrier", "duration": "6 months", "recoveryPotential": "medium"}
  ],
  "innovationWaves": [
    {"wave": 1, "nodes": ["Wave1Node1", "Wave1Node2"], "theme": "Initial exploration", "momentum": "building"}
  ],
  "maturityCurve": [
    {"stage": "Emerging", "nodes": ["Node1"], "characteristics": "Experimental, high uncertainty"}
  ],
  "chainComplexity": "moderate",
  "innovationPotential": 72,
  "strategicValue": "high",
  "keyInsights": [
    "Insight about innovation speed",
    "Insight about acceleration factors",
    "Insight about stagnation risks"
  ],
  "recommendedActions": [
    "Accelerate high-potential zones",
    "Revitalize stagnant branches"
  ]
}`
      },
      {
        type: 'coherence-assessment',
        prompt: `You are assessing the logical coherence and connection strength of an innovation chain.

CHAIN CONTEXT:
Focal Node: ${chainContext.focal}
Inspirations: ${chainContext.inspirationSources.join('; ') || 'Original concept'}
Derived Innovations: ${chainContext.descendants.join(', ') || 'None'}

TASK: Evaluate how well-connected and logically coherent the chain is.

Respond with ONLY valid JSON:

{
  "analysisType": "coherence-assessment",
  "summary": "2-3 sentence overview of chain coherence",
  "overallCoherence": "coherent",
  "coherenceScore": 76,
  "logicalGaps": [
    {"between": ["Node1", "Node2"], "gapType": "Missing transition", "missingLink": "Intermediate technology", "severity": "moderate"}
  ],
  "strongConnections": [
    {"nodes": ["${chainContext.focal}", "Child"], "connectionType": "Direct evolution", "strength": 85, "rationale": "Clear mechanism transfer"}
  ],
  "weakConnections": [
    {"nodes": ["Node1", "Node2"], "reason": "Unclear relationship", "improvementSuggestion": "Add bridging innovation"}
  ],
  "thematicClusters": [
    {"theme": "Automation", "nodes": ["Node1", "Node2"], "cohesion": 80}
  ],
  "chainComplexity": "moderate",
  "innovationPotential": 70,
  "strategicValue": "high",
  "keyInsights": [
    "Insight about connection strength",
    "Insight about logical flow",
    "Insight about thematic coherence"
  ],
  "recommendedActions": [
    "Fill identified gaps",
    "Strengthen weak connections"
  ]
}`
      }
    ];

    // Generate all 5 chain analyses in parallel
    const analyses = await Promise.all(
      frameworks.map(({ type, prompt }) => 
        this.callAPI(prompt, 2500).catch(err => {
          console.error(`Failed to generate ${type} chain analysis:`, err);
          return null;
        })
      )
    );

    // Filter out failed analyses and return successful ones
    return analyses.filter((analysis): analysis is any => analysis !== null);
  }

  async crossPollinate(a: IndustryExpression, b: IndustryExpression): Promise<IndustryExpression[]> {
    // Multi-phase cross-pollination algorithm
    const prompt = `You are an innovation strategist using systematic combination methods. Analyze and combine "${a.name}" and "${b.name}" using multiple strategies.

INPUT ANALYSIS:
Industry A: ${a.name}
- Mutation/Enabler: ${a.mutation}
- Core Value: ${a.insight}
- Mechanisms: ${a.inspirations?.map(i => i.mechanism).join(', ') || 'None specified'}

Industry B: ${b.name}
- Mutation/Enabler: ${b.mutation}
- Core Value: ${b.insight}
- Mechanisms: ${b.inspirations?.map(i => i.mechanism).join(', ') || 'None specified'}

COMBINATION STRATEGIES:
Generate exactly 5 novel industries using these distinct strategies:

1. ADDITIVE INTEGRATION: Both work side-by-side, complementing each other (like Uber + Eats = UberEats)
2. SUBSTITUTION: Replace a core component of A with B's strength (like TV + Internet = Streaming)
3. COMPLEMENTARY: One fills critical gaps of the other (like Hardware + Software ecosystems)
4. SEQUENTIAL ENABLEMENT: A creates conditions that enable B (like Smartphone enabling Mobile Apps)
5. CONTRADICTION SYNTHESIS: Resolve apparent conflicts to create new category (like Expensive + Cheap = Affordable Luxury)

For each combination, provide:
- A clear name that captures the hybrid nature
- The specific combination strategy used
- Synergy score (0-100): How well components amplify each other
- Novelty score (0-100): How unique and non-obvious this is
- Market fit: Who benefits and why
- Key challenges: 2-3 major obstacles to overcome

Respond with ONLY a JSON array (no explanation, no markdown):

[
  {
    "id": "cross-1",
    "type": "future",
    "name": "Clear hybrid name",
    "mutation": "What specifically enables this combination (technology, market shift, etc)",
    "insight": "Why this combination creates exponentially more value than either alone",
    "combinationType": "Additive Integration",
    "synergyScore": 85,
    "noveltyFactor": 75,
    "marketFit": "Specific target audience and use case",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "inspirations": [
      {"source": "${a.name}", "mechanism": "Specific element from A", "twist": "How it transforms in combination"},
      {"source": "${b.name}", "mechanism": "Specific element from B", "twist": "How it transforms in combination"}
    ],
    "children": []
  },
  {
    "id": "cross-2",
    "type": "future",
    "name": "Different hybrid using Substitution strategy",
    "mutation": "What enables this",
    "insight": "Why valuable",
    "combinationType": "Substitution",
    "synergyScore": 78,
    "noveltyFactor": 82,
    "marketFit": "Target audience",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element from A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element from B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-3",
    "type": "future",
    "name": "Complementary combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Complementary",
    "synergyScore": 88,
    "noveltyFactor": 70,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-4",
    "type": "future",
    "name": "Sequential enablement combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Sequential Enablement",
    "synergyScore": 80,
    "noveltyFactor": 85,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-5",
    "type": "future",
    "name": "Contradiction synthesis combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Contradiction Synthesis",
    "synergyScore": 92,
    "noveltyFactor": 95,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  }
]`;
    
    return this.callAPI(prompt, 4000);
  }

  async deepDive(industry: IndustryExpression): Promise<DeepDiveDetails> {
    const prompt = `Provide detailed business analysis for the emerging industry "${industry.name}".

Context:
- Mutation/Enabler: ${industry.mutation}
- Core Insight: ${industry.insight}

Respond with ONLY a JSON object (no explanation, no markdown):

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
    
    return this.callAPI(prompt, 3000);
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
};

export default GeminiService;
