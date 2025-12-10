import type {
  AIAssistantResponse
} from "../types";
import { DBService } from "./db.service";
import { apiClient } from "./api-client.service";

class AIAssistantService {
  // Context builders
  private async buildNeedContext(needId: string) {
    const need = await DBService.getNeed(needId);
    if (!need) throw new Error("Need not found");

    const mechanisms = await DBService.getMechanismsByNeed(needId);
    const deepDives = await DBService.getDeepDivesByNeed(needId);
    // Cross-pollinations are tracked in the expressions themselves
    const crossPollinations: any[] = [];

    return {
      need,
      mechanisms,
      deepDives,
      crossPollinations,
      predictionCount: this.countPredictions(need.eras),
    };
  }

  private async buildMechanismContext(mechanismId: string) {
    const mechanism = await DBService.getMechanism(mechanismId);
    if (!mechanism) throw new Error("Mechanism not found");

    const need = await DBService.getNeed(mechanism.needId);
    const allMechanisms = await DBService.getAllMechanisms();
    const similarPatterns = allMechanisms.filter((m: any) => 
      m.details?.abstractPattern === mechanism.details?.abstractPattern && m.id !== mechanismId
    );

    return {
      mechanism,
      parentNeed: need,
      similarPatterns,
    };
  }

  private async buildDeepDiveContext(deepDiveId: string) {
    // Find deep dive by ID across all needs
    const allDeepDives = await DBService.getAllDeepDives();
    const deepDive = allDeepDives.find(dd => dd.id === deepDiveId);
    if (!deepDive) throw new Error("Deep dive not found");

    const need = await DBService.getNeed(deepDive.needId);
    const mechanisms = await DBService.getMechanismsByNeed(deepDive.needId);

    return {
      deepDive,
      parentNeed: need,
      mechanisms,
    };
  }

  private countPredictions(eras: any[]): number {
    let count = 0;
    const countInExpressions = (expressions: any[]) => {
      for (const expr of expressions) {
        count++;
        if (expr.children?.length > 0) {
          countInExpressions(expr.children);
        }
      }
    };
    
    for (const era of eras) {
      if (Array.isArray(era.expressions) && era.expressions.length > 0) {
        countInExpressions(era.expressions);
      }
    }
    
    return count;
  }

  // AI Action Suggestions
  async suggestMechanismActions(mechanismId: string): Promise<AIAssistantResponse> {
    const context = await this.buildMechanismContext(mechanismId);

    const prompt = `You are an intelligent research assistant helping analyze a technical mechanism.

CONTEXT:
Mechanism: ${context.mechanism.expressionName}
Core Mechanism: ${context.mechanism.details?.coreMechanism || 'N/A'}
Pattern Type: ${context.mechanism.details?.abstractPattern || 'N/A'}
Parent Need: ${context.parentNeed?.name || "Unknown"}
Similar Patterns Found: ${context.similarPatterns.length}

MECHANISM DETAILS:
${JSON.stringify(context.mechanism.details, null, 2)}

TASK:
Analyze this mechanism and suggest 2-4 actionable next steps the user should take.

Available actions:
1. create_need - Create a new research need from an enabler/requirement
2. branch - Branch to explore a specific aspect deeper
3. find_similar - Find similar mechanisms in the pattern library
4. analyze - Generate a deep dive business analysis for this mechanism
5. compare - Compare this mechanism with similar patterns

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description (e.g., 'Explore thermal management')",
      "reasoning": "Why this action is valuable",
      "actionType": "create_need|branch|find_similar|analyze|compare",
      "params": {
        "title": "...",
        "description": "...",
        // other relevant params
      }
    }
  ],
  "reasoning": "Overall assessment of this mechanism's viability and key considerations"
}

Focus on practical, high-value actions. Be concise but insightful.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 2000);
      
      return data as AIAssistantResponse;
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      throw new Error(`Failed to generate suggestions: ${e.message}`);
    }
  }

  async suggestDeepDiveActions(deepDiveId: string): Promise<AIAssistantResponse> {
    const context = await this.buildDeepDiveContext(deepDiveId);

    const prompt = `You are an intelligent research assistant helping analyze a business opportunity.

CONTEXT:
Deep Dive: ${context.deepDive.expressionName}
Parent Need: ${context.parentNeed?.name || "Unknown"}
Market Opportunity: ${context.deepDive.details?.marketOpportunity || 'N/A'}
Key Enablers: ${context.deepDive.details?.keyEnablers?.length || 0}
Challenges: ${context.deepDive.details?.challenges?.length || 0}
Related Mechanisms: ${context.mechanisms.length}

DEEP DIVE DETAILS:
${JSON.stringify(context.deepDive.details, null, 2)}

TASK:
Analyze this business opportunity and suggest 2-4 actionable next steps.

Available actions:
1. extract - Extract enablers or challenges as new research needs
2. create_need - Create a specific need from an identified gap
3. find_similar - Find mechanisms that address these challenges
4. compare - Compare this opportunity with other deep dives
5. analyze - Generate mechanism analysis for technical feasibility

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description",
      "reasoning": "Why this action is valuable",
      "actionType": "extract|create_need|find_similar|compare|analyze",
      "params": {
        "enablerIndex": 0,  // if extracting enabler
        "challengeIndex": 0,  // if extracting challenge
        "title": "...",
        "description": "...",
        // other relevant params
      }
    }
  ],
  "reasoning": "Overall viability assessment and recommended focus areas"
}

Prioritize actions that address critical enablers or major challenges.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 2000);
      
      return data as AIAssistantResponse;
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      throw new Error(`Failed to generate suggestions: ${e.message}`);
    }
  }

  async suggestNeedActions(needId: string): Promise<AIAssistantResponse> {
    const context = await this.buildNeedContext(needId);

    const prompt = `You are an intelligent research assistant helping guide research exploration.

CONTEXT:
Need: ${context.need.name}
Description: ${context.need.description}
Total Predictions: ${context.predictionCount}
Mechanisms Analyzed: ${context.mechanisms.length}
Deep Dives Conducted: ${context.deepDives.length}
Cross-Pollinations: ${context.crossPollinations.length}

NEED DETAILS:
${JSON.stringify({
  name: context.need.name,
  description: context.need.description,
  erasCount: context.need.eras.length,
  relatedNeeds: context.need.relatedNeeds,
}, null, 2)}

TASK:
Analyze this research tree and suggest 2-4 actionable next steps to advance the research.

Available actions:
1. analyze - Suggest which prediction to analyze next (mechanism or deep dive)
2. compare - Compare predictions or branches for viability
3. find_similar - Find gaps by comparing with pattern library
4. branch - Suggest promising predictions to branch deeper
5. create_need - Identify missing research areas

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description",
      "reasoning": "Why this action is valuable",
      "actionType": "analyze|compare|find_similar|branch|create_need",
      "params": {
        "predictionPath": "Era > Prediction name",  // if targeting specific prediction
        "analysisType": "mechanism|deepdive",
        "gap": "description of gap found",
        // other relevant params
      }
    }
  ],
  "reasoning": "Overall research progress assessment and strategic recommendations"
}

Focus on filling gaps, deepening promising areas, and advancing toward actionable insights.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 3000);
      
      return data as AIAssistantResponse;
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      throw new Error(`Failed to generate suggestions: ${e.message}`);
    }
  }

  async suggestPatternActions(patternType: string, currentNeedId?: string): Promise<AIAssistantResponse> {
    const allMechanisms = await DBService.getAllMechanisms();
    const patternInstances = allMechanisms.filter((m: any) => m.abstractPattern === patternType);
    
    let currentNeed = null;
    if (currentNeedId) {
      currentNeed = await DBService.getNeed(currentNeedId);
    }

    const prompt = `You are an intelligent research assistant helping apply patterns across domains.

CONTEXT:
Pattern Type: ${patternType}
Instances Found: ${patternInstances.length}
Current Need: ${currentNeed?.name || "None"}

PATTERN INSTANCES:
${JSON.stringify(patternInstances.slice(0, 5).map((m: any) => ({
  prediction: m.predictionName,
  mechanism: m.coreMechanism,
  untappedDomains: m.untappedDomains?.length || 0,
})), null, 2)}

TASK:
Suggest 2-3 ways to apply this pattern.

Available actions:
1. apply_pattern - Apply this pattern to current need
2. create_need - Create new need inspired by this pattern
3. find_similar - Find related patterns that could combine
4. compare - Compare pattern effectiveness across instances

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description",
      "reasoning": "Why this action is valuable",
      "actionType": "apply_pattern|create_need|find_similar|compare",
      "params": {
        "targetNeedId": "${currentNeedId || ''}",
        "patternType": "${patternType}",
        "context": "...",
        // other relevant params
      }
    }
  ],
  "reasoning": "Pattern insights and application recommendations"
}`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 2000);
      
      return data as AIAssistantResponse;
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      throw new Error(`Failed to generate suggestions: ${e.message}`);
    }
  }
}

// Singleton instance
let aiAssistantService: AIAssistantService | null = null;

export const initializeAIAssistant = () => {
  aiAssistantService = new AIAssistantService();
};

export const getAIAssistant = (): AIAssistantService => {
  if (!aiAssistantService) {
    aiAssistantService = new AIAssistantService();
  }
  return aiAssistantService;
};

export { aiAssistantService };
