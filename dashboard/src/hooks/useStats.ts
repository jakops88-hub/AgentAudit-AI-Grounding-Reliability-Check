import { useState, useEffect } from 'react';

export interface LogEntry {
  id: number;
  timestamp: string;
  endpoint: string;
  status: number;
  trust_score: number;
  latency_ms: number;
}

export interface Stats {
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  average_trust_score: number;
  recent_logs: LogEntry[];
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'x-api-key': 'test-key-123' };
        
        const [statsRes, historyRes] = await Promise.all([
          fetch('https://agent-audit-ai-grounding-reliabilit.vercel.app/api/v1/stats', { headers }),
          fetch('https://agent-audit-ai-grounding-reliabilit.vercel.app/api/v1/history', { headers })
        ]);

        if (!statsRes.ok || !historyRes.ok) throw new Error('Failed to fetch data');

        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        // Transform to match our UI state
        const total = statsData.total_requests || 0;
        const hallucinationRate = parseFloat(statsData.hallucination_rate) || 0;
        const failed = Math.round(total * (hallucinationRate / 100));
        const successful = total - failed;

        const transformedStats: Stats = {
          total_verifications: total,
          successful_verifications: successful,
          failed_verifications: failed,
          average_trust_score: statsData.average_trust_score || 0,
          recent_logs: (historyData.logs || []).map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            endpoint: log.question ? (log.question.substring(0, 40) + (log.question.length > 40 ? '...' : '')) : 'Unknown',
            status: log.trust_score > 0.7 ? 200 : 422,
            trust_score: log.trust_score,
            latency_ms: log.latency_ms || 0
          }))
        };

        setStats(transformedStats);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('System Offline');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds to avoid rate limits
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
