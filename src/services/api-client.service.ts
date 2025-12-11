// API Client for calling backend Vercel functions or direct Gemini API in dev mode
// Use environment variable to determine if we're using local or production API

import { extractJSON } from "../utils/json-parser";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const IS_DEV_MODE = !API_BASE_URL && GEMINI_API_KEY;

// Log the mode on initialization
if (IS_DEV_MODE) {
  console.log('🔧 Development Mode: Using direct Gemini API calls');
} else {
  console.log('🚀 Production Mode: Using backend API endpoints');
}

class APIClient {
  private async callDirectGemini(prompt: string, maxTokens: number, temperature: number): Promise<any> {
    if (!GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY not found in environment variables");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          systemInstruction: {
            parts: [{
              text: "You are a JSON API. You MUST respond with ONLY valid JSON - no markdown code blocks, no explanations, no conversational text like 'Okay' or 'Sure'. Start your response directly with { or [. Any non-JSON text will cause a system error."
            }]
          },
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No response text from Gemini API");
    }

    return extractJSON(text);
  }

  private async callAPI(
    endpoint: string, 
    prompt: string, 
    maxTokens: number = 8000, 
    temperature: number = 0.9,
    retries: number = 1
  ): Promise<any> {
    // In dev mode, call Gemini directly
    if (IS_DEV_MODE) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await this.callDirectGemini(prompt, maxTokens, temperature);
        } catch (e: any) {
          console.error(`Direct API attempt ${attempt + 1} failed:`, e.message);
          
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

    // In production, call backend API
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
        return extractJSON(data.text);
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
