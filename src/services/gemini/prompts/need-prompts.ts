import { buildContextSection, JSON_ONLY } from './common';
import type { PriorArt } from '../../../types';

/**
 * Generate prompt for fetching prior art
 */
export function buildFetchPriorArtPrompt(need: string, userDescription?: string): string {
  const contextSection = buildContextSection(
    userDescription,
    need,
    `FIRST: Interpret what the user means by: "${need}"
- If it's a common phrase, use standard interpretation
- If it's specialized/technical jargon, interpret based on context clues
- If it describes a tool/role/concept, identify the underlying human need it serves`
  );

  return `You are researching existing solutions.

${contextSection}

THEN: Research solutions for that interpreted need.

Examples:
- "vibecoder" → Someone without coding skills who uses AI to program → Need: "Enable non-programmers to create software"
- "social media manager" → Need: "Build and maintain online audience engagement"
- "therapy" → Need: "Process emotions and improve mental wellbeing"

${JSON_ONLY}

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
}

/**
 * Generate prompt for creating a need with future predictions
 */
export function buildGenerateNeedPrompt(needName: string, priorArt: PriorArt, userDescription?: string): string {
  const contextSection = buildContextSection(
    userDescription,
    needName,
    `IMPORTANT: Interpret what the user ACTUALLY MEANS:
- If it's a role/tool/concept, identify the underlying need it serves
- Focus predictions on how that CORE NEED will evolve
- Example: "vibecoder" (non-programmer using AI) → Predict evolution of "enabling non-experts to create software"`
  );

  return `Generate future industries based on the user's input: "${needName}"

${contextSection}

Prior art context: ${JSON.stringify(priorArt)}

${JSON_ONLY}

{
  "id": "${needName.toLowerCase().replace(/\s+/g, '-')}",
  "name": "${needName}",
  "icon": "Users",
  "description": "Brief description of the CORE NEED this serves (not just the literal term)",
  "priorArt": ${JSON.stringify(priorArt)},
  "eras": [
    {"name": "Pre-Industrial", "expressions": ["Example 1", "Example 2"]},
    {"name": "Industrial", "expressions": ["Example 1", "Example 2"]},
    {"name": "Digital (2000s-2020)", "expressions": ["Example 1", "Example 2"]},
    {
      "name": "Post-AI Era (2025+)",
      "expressions": [
        {"id": "1", "type": "future", "name": "Future Industry 1", "mutation": "What enables it", "insight": "Why it emerges from the CORE NEED", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "2", "type": "future", "name": "Future Industry 2", "mutation": "What enables it", "insight": "Why it emerges from the CORE NEED", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "3", "type": "future", "name": "Future Industry 3", "mutation": "What enables it", "insight": "Why it emerges from the CORE NEED", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "4", "type": "future", "name": "Future Industry 4", "mutation": "What enables it", "insight": "Why it emerges from the CORE NEED", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []},
        {"id": "5", "type": "future", "name": "Future Industry 5", "mutation": "What enables it", "insight": "Why it emerges from the CORE NEED", "inspirations": [{"source": "Prior art name", "mechanism": "What is borrowed", "twist": "How it is changed"}], "children": []}
      ]
    }
  ],
  "relatedNeeds": ["Related Need 1", "Related Need 2", "Related Need 3"]
}

Use icon from: Users, Zap, Brain, Heart, Shield, Leaf, Sparkles. Generate 5-7 diverse future industries that evolve from the CORE NEED, not just the literal term. Draw rich inspirations from prior art.`;
}
