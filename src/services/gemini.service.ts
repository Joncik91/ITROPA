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

  async extractMechanism(industry: IndustryExpression): Promise<MechanismDetails> {
    const prompt = `Extract the core transferable mechanism from "${industry.name}".

Respond with ONLY a JSON object (no explanation, no markdown):

{
  "coreMechanism": "The fundamental principle that makes this work",
  "abstractPattern": "The pattern at highest abstraction level",
  "historicalApplications": [
    {"domain": "Field 1", "example": "How this pattern appeared before", "era": "Time period"},
    {"domain": "Field 2", "example": "Another historical example", "era": "Time period"}
  ],
  "untappedDomains": [
    {"domain": "Unexplored field 1", "opportunity": "How the mechanism could apply", "novelty": "What makes this new"},
    {"domain": "Unexplored field 2", "opportunity": "How the mechanism could apply", "novelty": "What makes this new"}
  ],
  "combinationPotential": ["Compatible mechanism 1", "Compatible mechanism 2", "Compatible mechanism 3"]
}`;
    
    return this.callAPI(prompt, 2500);
  }

  async crossPollinate(a: IndustryExpression, b: IndustryExpression): Promise<IndustryExpression[]> {
    const prompt = `Combine elements from "${a.name}" and "${b.name}" to generate 3 novel industries.

Respond with ONLY a JSON array (no explanation, no markdown):

[
  {"id": "cross-1", "type": "future", "name": "Combined Industry 1", "mutation": "What enables this combination", "insight": "Why combining these creates value", "inspirations": [{"source": "${a.name}", "mechanism": "Element from A", "twist": "How it transforms"}, {"source": "${b.name}", "mechanism": "Element from B", "twist": "How it transforms"}], "children": []},
  {"id": "cross-2", "type": "future", "name": "Combined Industry 2", "mutation": "What enables this combination", "insight": "Why combining these creates value", "inspirations": [{"source": "${a.name}", "mechanism": "Element from A", "twist": "How it transforms"}, {"source": "${b.name}", "mechanism": "Element from B", "twist": "How it transforms"}], "children": []},
  {"id": "cross-3", "type": "future", "name": "Combined Industry 3", "mutation": "What enables this combination", "insight": "Why combining these creates value", "inspirations": [{"source": "${a.name}", "mechanism": "Element from A", "twist": "How it transforms"}, {"source": "${b.name}", "mechanism": "Element from B", "twist": "How it transforms"}], "children": []}
]`;
    
    return this.callAPI(prompt, 3000);
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
