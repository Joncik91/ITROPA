import { apiClient } from '../api-client.service';

/**
 * Low-level API client for Gemini calls.
 * Provides a thin wrapper around the backend API client.
 */
export class GeminiClient {
  /**
   * Call the Gemini API through the backend proxy
   * @param prompt - The prompt to send
   * @param maxTokens - Maximum tokens in response (default: 8000)
   * @param retries - Number of retries on failure (default: 1)
   */
  async callAPI(prompt: string, maxTokens: number = 8000, retries: number = 1): Promise<any> {
    return apiClient.callGemini(prompt, maxTokens, retries);
  }
}

// Singleton instance
export const geminiClient = new GeminiClient();
