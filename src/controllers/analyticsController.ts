import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const apiKey = (req.headers['x-api-key'] as string) || (req.query.api_key as string);
    
    const logs = await prisma.auditLog.findMany({
      where: { apiKey },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({
      count: logs.length,
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        question: log.input_question,
        action: log.result_action,
        trust_score: log.result_score,
        latency_ms: log.durationMs
      }))
    });
  } catch (error) {
    console.error('History retrieval failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving history'
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const apiKey = (req.headers['x-api-key'] as string) || (req.query.api_key as string);

    const logs = await prisma.auditLog.findMany({
      where: { apiKey },
      select: {
        result_action: true,
        result_score: true
      }
    });

    const totalRequests = logs.length;
    const rejectedRequests = logs.filter(l => l.result_action === 'REJECT' || l.result_action === 'RETRY').length;
    const hallucinationRate = totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0;
    
    const totalScore = logs.reduce((sum, log) => sum + log.result_score, 0);
    const averageTrustScore = totalRequests > 0 ? totalScore / totalRequests : 0;

    res.json({
      total_requests: totalRequests,
      average_trust_score: Number(averageTrustScore.toFixed(2)),
      hallucination_rate: Number(hallucinationRate.toFixed(2)) + '%'
    });

  } catch (error) {
    console.error('Stats retrieval failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving stats'
    });
  }
};
