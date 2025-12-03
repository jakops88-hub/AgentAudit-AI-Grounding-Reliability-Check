import { Request, Response } from 'express';
import { GroundingService } from '../services/GroundingService';
import { OpenAIProvider } from '../providers/OpenAIProvider';

// Initialize services (Dependency Injection would be better in a larger app)
const llmProvider = new OpenAIProvider();
const groundingService = new GroundingService(llmProvider);

export const verifyContent = async (req: Request, res: Response) => {
  try {
    const { question, answer, context } = req.body;

    // 1. Call GroundingService
    const groundingResult = await groundingService.verifyGrounding(question, answer, context);

    // 2. Calculate Trust Score & Action
    // If pass is true, we use the score directly. If false, we cap it at 0.4 or use the returned low score.
    const trustScore = groundingResult.pass ? groundingResult.score : Math.min(groundingResult.score, 0.4);
    
    const action = trustScore >= 0.7 ? "APPROVE" : "REJECT";

    // 3. Construct Response
    const response = {
      trust_score: trustScore,
      action: action,
      tests: {
        grounding: {
          pass: groundingResult.pass,
          reason: groundingResult.reason,
          unsupported_claims: groundingResult.unsupported_claims
        }
      },
      retry_suggestion: action === "REJECT" 
        ? `The answer contains unsupported claims: ${groundingResult.unsupported_claims.join(', ')}. Please revise.` 
        : null
    };

    res.json(response);

  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during verification'
    });
  }
};
