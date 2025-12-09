// API Client for calling backend Vercel functions
// Use environment variable to determine if we're using local or production API

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class APIClient {
  private async callAPI(
    endpoint: string, 
    prompt: string, 
    maxTokens: number = 8000, 
    temperature: number = 0.9,
    retries: number = 1
  ): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            maxTokens,
            temperature,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return this.extractJSON(data.text);
      } catch (e: any) {
        console.error(`Attempt ${attempt + 1} failed:`, e.message);
        
        // Check for quota/rate limit errors
        if (e.message?.includes("quota") || e.message?.includes("429")) {
          throw new Error("API quota exceeded. Please wait a minute or upgrade your Gemini API plan at https://ai.google.dev/pricing");
        }
        
        if (attempt === retries) {
          throw new Error(`API Error: ${e.message || "Unknown error"}`);
        }
        
        await new Promise(r => setTimeout(r, 2000));
      }
    }
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
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      try {
        return JSON.parse(jsonStr);
      } catch (e2) {
        console.error("Failed to parse JSON:", jsonStr.substring(0, 500));
        throw new Error(`JSON Parse Error: ${e.message}`);
      }
    }
  }

  // Gemini API calls (for main content generation)
  async callGemini(prompt: string, maxTokens: number = 8000, retries: number = 1): Promise<any> {
    return this.callAPI('gemini', prompt, maxTokens, 0.9, retries);
  }

  // AI Assistant API calls (for chat/assistance)
  async callAIAssistant(prompt: string, maxTokens: number = 8000, retries: number = 1): Promise<any> {
    return this.callAPI('ai-assistant', prompt, maxTokens, 0.7, retries);
  }
}

// Singleton instance
export const apiClient = new APIClient();
