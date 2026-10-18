import type {
  AIAssistantResponse
} from "../types";
import { DBService } from "./db.service";
import { apiClient } from "./api-client.service";
import { normalizeAssistantResponse } from "../utils/ai-normalizers";
import { getAllExpressionsFromNeed } from "../utils/tree-search";

/** Mechanism records store one entry per analytical framework; older records stored a single object. */
const primaryMechanism = (details: unknown): { coreMechanism?: string; abstractPattern?: string } =>
  (Array.isArray(details) ? details[0] : details) ?? {};

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
      predictionNames: getAllExpressionsFromNeed(need).map((e) => e.name),
    };
  }

  private async buildMechanismContext(mechanismId: string) {
    const mechanism = await DBService.getMechanism(mechanismId);
    if (!mechanism) throw new Error("Mechanism not found");

    const need = await DBService.getNeed(mechanism.needId);
    const allMechanisms = await DBService.getAllMechanisms();
    const pattern = primaryMechanism(mechanism.details).abstractPattern;
    const similarPatterns = allMechanisms.filter((m) =>
      !!pattern && primaryMechanism(m.details).abstractPattern === pattern && m.id !== mechanismId
    );

    return {
      mechanism,
      parentNeed: need,
      similarPatterns,
    };
  }

  private async buildDeepDiveContext(deepDiveId: string) {
    const deepDive = await DBService.getDeepDiveById(deepDiveId);
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
Core Mechanism: ${primaryMechanism(context.mechanism.details).coreMechanism || 'N/A'}
Pattern Type: ${primaryMechanism(context.mechanism.details).abstractPattern || 'N/A'}
Parent Need: ${context.parentNeed?.name || "Unknown"}
Similar Patterns Found: ${context.similarPatterns.length}

MECHANISM DETAILS:
${JSON.stringify(context.mechanism.details).slice(0, 12000)}

TASK:
Analyze this mechanism and suggest 2-4 actionable next steps the user should take.

Available actions:
1. create_need - Create a new research need (params.needName, params.needDescription)
2. branch - Branch this industry into sub-industries (params.expressionName)
3. extract - Generate a deep dive business analysis (params.expressionName)

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description (e.g., 'Explore thermal management')",
      "reasoning": "Why this action is valuable",
      "actionType": "create_need|branch|extract",
      "params": { "needName": "...", "needDescription": "...", "expressionName": "${context.mechanism.expressionName}" }
    }
  ],
  "reasoning": "Overall assessment of this mechanism's viability and key considerations"
}

Focus on practical, high-value actions. Be concise but insightful.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 2000);
      
      return normalizeAssistantResponse(data);
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
${JSON.stringify(context.deepDive.details).slice(0, 12000)}

TASK:
Analyze this business opportunity and suggest 2-4 actionable next steps.

Available actions:
1. create_need - Turn an enabler, challenge or gap into a new research need (params.needName, params.needDescription)
2. analyze - Extract the transferable mechanism of this industry (params.expressionName)
3. branch - Branch this industry into sub-industries (params.expressionName)

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description",
      "reasoning": "Why this action is valuable",
      "actionType": "create_need|analyze|branch",
      "params": { "needName": "...", "needDescription": "...", "expressionName": "${context.deepDive.expressionName}" }
    }
  ],
  "reasoning": "Overall viability assessment and recommended focus areas"
}

Prioritize actions that address critical enablers or major challenges.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 2000);
      
      return normalizeAssistantResponse(data);
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

Available actions (use exact prediction names from the list below for params.expressionName):
1. analyze - Extract the mechanism of a prediction (params.expressionName)
2. extract - Deep dive business analysis of a prediction (params.expressionName)
3. branch - Branch a promising prediction deeper (params.expressionName)
4. create_need - Open a missing research area (params.needName, params.needDescription)

PREDICTIONS:
${context.predictionNames.slice(0, 60).join('\n')}

Respond with ONLY valid JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "action": "Short action description",
      "reasoning": "Why this action is valuable",
      "actionType": "analyze|extract|branch|create_need",
      "params": { "expressionName": "...", "needName": "...", "needDescription": "..." }
    }
  ],
  "reasoning": "Overall research progress assessment and strategic recommendations"
}

Focus on filling gaps, deepening promising areas, and advancing toward actionable insights.`;

    try {
      const data = await apiClient.callAIAssistant(prompt, 3000);
      
      return normalizeAssistantResponse(data);
    } catch (e: any) {
      console.error("AI Assistant Error:", e);
      throw new Error(`Failed to generate suggestions: ${e.message}`);
    }
  }
}

const aiAssistantService = new AIAssistantService();

export const getAIAssistant = (): AIAssistantService => aiAssistantService;
