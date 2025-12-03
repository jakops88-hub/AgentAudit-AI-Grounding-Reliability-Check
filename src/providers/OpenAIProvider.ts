import OpenAI from 'openai';
import { LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../config/env';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content || "";
      
      if (!content) {
        throw new Error("OpenAI returned empty content");
      }

      return {
        content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        }
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to generate response from OpenAI: ${(error as Error).message}`);
    }
  }
}
