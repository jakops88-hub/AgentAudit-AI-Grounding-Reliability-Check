import { Request, Response } from 'express';
import { GroundingService } from '../services/GroundingService';
import { CitationService } from '../services/CitationService';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import prisma from '../config/prisma';

// Initialize services (Dependency Injection would be better in a larger app)
const llmProvider = new OpenAIProvider();
const groundingService = new GroundingService(llmProvider);
const citationService = new CitationService();

export const verifyContent = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { question, answer, context } = req.body;
    const apiKey = req.headers['x-api-key'] as string || 'unknown';

    // Run checks in parallel for performance
    const [groundingResult, citationResult] = await Promise.all([
      groundingService.verifyGrounding(question, answer, context),
      citationService.verifyCitations(answer, context)
    ]);

    // 2. Calculate Trust Score & Action
    // Weighted average: Grounding (80%), Citations (20%)
    // If grounding fails, trust score is heavily penalized regardless of citations.
    let trustScore = 0;
    
    if (groundingResult.pass) {
      trustScore = (groundingResult.score * 0.8) + (citationResult.score * 0.2);
    } else {
      // Cap score if grounding fails
      trustScore = Math.min(groundingResult.score, 0.4);
    }
    
    const action = trustScore >= 0.7 ? "APPROVE" : "REJECT";

    // 3. Construct Response
    const response = {
      trust_score: Number(trustScore.toFixed(2)),
      action: action,
      tests: {
        grounding: {
          pass: groundingResult.pass,
          reason: groundingResult.reason,
          unsupported_claims: groundingResult.unsupported_claims
        },
        citation: {
          pass: citationResult.pass,
          score: Number(citationResult.score.toFixed(2)),
          missing_sources: citationResult.missing_sources
        }
      },
      retry_suggestion: action === "REJECT" 
        ? constructRetrySuggestion(groundingResult, citationResult)
        : null
    };

    // 4. Async Logging (Fire and forget)
    const durationMs = Date.now() - startTime;
    prisma.verificationLog.create({
      data: {
        apiKey,
        durationMs,
        input_question: question,
        input_answer: answer,
        result_action: action as 'APPROVE' | 'REJECT',
        result_score: response.trust_score,
        result_details: response.tests
      }
    }).catch(err => console.error('Failed to log verification:', err));

    res.json(response);

  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during verification'
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.verificationLog.findMany({
      where: {
        apiKey,
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        result_action: true,
        result_score: true
      }
    });

    const totalRequests = logs.length;
    const approvedRequests = logs.filter(l => l.result_action === 'APPROVE').length;
    const passRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;
    
    const totalScore = logs.reduce((sum, log) => sum + log.result_score, 0);
    const averageTrustScore = totalRequests > 0 ? totalScore / totalRequests : 0;

    res.json({
      period: '30d',
      total_requests: totalRequests,
      pass_rate_percentage: Number(passRate.toFixed(2)),
      average_trust_score: Number(averageTrustScore.toFixed(2))
    });

  } catch (error) {
    console.error('Stats retrieval failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving stats'
    });
  }
};

function constructRetrySuggestion(grounding: any, citation: any): string {
  const suggestions = [];
  if (!grounding.pass) {
    suggestions.push(`Unsupported claims: ${grounding.unsupported_claims.join(', ')}`);
  }
  if (!citation.pass) {
    suggestions.push(`Invalid citations: ${citation.missing_sources.join(', ')}`);
  }
  return suggestions.join('. ') + ". Please revise.";
}
