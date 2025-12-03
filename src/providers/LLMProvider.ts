export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  /**
   * Generates a completion based on the system and user prompts.
   * @param systemPrompt The instruction for the system (role, output format).
   * @param userPrompt The specific content to process.
   */
  generate(systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
}
