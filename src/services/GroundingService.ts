import { LLMProvider } from '../providers/LLMProvider';
import { GroundingResult } from '../types';
import { z } from 'zod';

// Schema for validating the LLM output
const GroundingResponseSchema = z.object({
  pass: z.boolean(),
  score: z.number().min(0).max(1),
  reason: z.string(),
  unsupported_claims: z.array(z.string()),
});

export class GroundingService {
  private provider: LLMProvider;
  private readonly MAX_RETRIES = 1;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  /**
   * Verifies if the agent's output is grounded in the provided context.
   */
  async verifyGrounding(
    input: string,
    output: string,
    context: string
  ): Promise<GroundingResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input, output, context);

    return this.callJudgeWithRetry(systemPrompt, userPrompt);
  }

  private buildSystemPrompt(): string {
    return `You are an impartial auditor and fact-checker. 
Your task is to verify if the 'AGENT ANSWER' is fully supported by the provided 'CONTEXT'.
You must be strict. Any claim in the answer that is not explicitly supported or directly inferable from the context is a hallucination.

Return your analysis in valid JSON format with the following structure:
{
  "pass": boolean, // true if fully grounded, false otherwise.
  "score": number, // 0.0 to 1.0 confidence score. 1.0 means perfectly grounded.
  "reason": "string", // A concise explanation of your decision.
  "unsupported_claims": ["string"] // List of specific sentences or claims from the answer that are not supported. Empty if pass is true.
}

Do not include any markdown formatting (like \`\`\`json) in your response, just the raw JSON string.`;
  }

  private buildUserPrompt(input: string, output: string, context: string): string {
    return `
USER QUERY:
"${input}"

CONTEXT:
"""
${context}
"""

AGENT ANSWER:
"""
${output}
"""

Analyze the AGENT ANSWER against the CONTEXT.`;
  }

  private async callJudgeWithRetry(
    systemPrompt: string,
    userPrompt: string,
    attempt: number = 1
  ): Promise<GroundingResult> {
    try {
      const response = await this.provider.generate(systemPrompt, userPrompt);
      const cleanContent = this.cleanJsonOutput(response.content);
      
      const parsed = JSON.parse(cleanContent);
      
      // Validate structure with Zod
      const validated = GroundingResponseSchema.parse(parsed);
      return validated;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt <= this.MAX_RETRIES) {
        console.log(`Retrying... (${attempt}/${this.MAX_RETRIES})`);
        return this.callJudgeWithRetry(systemPrompt, userPrompt, attempt + 1);
      }

      // Fallback if all retries fail
      return {
        pass: false,
        score: 0,
        reason: `Audit failed due to technical error: ${(error as Error).message}`,
        unsupported_claims: ["System Error: Unable to verify content."],
      };
    }
  }

  private cleanJsonOutput(content: string): string {
    // Remove markdown code blocks if present
    return content.replace(/```json\n?|\n?```/g, '').trim();
  }
}
