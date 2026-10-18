import { apiClient } from '../api-client.service';

/**
 * Low-level client for Gemini calls through the server-side proxy.
 * Returns parsed-but-unvalidated JSON; operations normalize it.
 */
export class GeminiClient {
  async callAPI(prompt: string, maxTokens = 4000, retries = 1): Promise<unknown> {
    return apiClient.callGemini<unknown>(prompt, maxTokens, retries);
  }
}

export const geminiClient = new GeminiClient();
