import { LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../config/env';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.OPENAI_API_KEY;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    // TODO: Replace with actual OpenAI API call
    // For now, returning a mock response to allow the controller to function
    console.log('Mock OpenAI Call:', { systemPrompt, userPrompt });
    
    return {
      content: JSON.stringify({
        pass: true,
        score: 0.95,
        reason: "The answer accurately reflects the context provided.",
        unsupported_claims: []
      }),
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      }
    };
  }
}
