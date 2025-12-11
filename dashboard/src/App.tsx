import { useMemo } from 'react';
import { Shield, Activity, CheckCircle, Zap, Lock, AlertTriangle, Terminal } from 'lucide-react';
import { useStats } from './hooks/useStats';
import { VerificationConsole } from './components/VerificationConsole';
import { TrustGauge } from './components/TrustGauge';
import { LogItem } from './components/LogItem';
import { MetricCard } from './components/MetricCard';
import { AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

function App() {
  const { stats, loading, error } = useStats();

  // Provide default values when stats are not available
  const defaultStats = {
    total_verifications: 0,
    successful_verifications: 0,
    failed_verifications: 0,
    average_trust_score: 0,
    recent_logs: []
  };

  const currentStats = stats || defaultStats;

  const successRate = useMemo(() => {
    if (currentStats.total_verifications === 0) return 0;
    return ((currentStats.successful_verifications / currentStats.total_verifications) * 100).toFixed(1);
  }, [currentStats]);

  const getReliabilityLabel = (score: number) => {
    if (score >= 0.8) return { text: "High", color: "text-green-400" };
    if (score >= 0.5) return { text: "Medium", color: "text-yellow-400" };
    return { text: "Low", color: "text-red-400" };
  };

  const getGroundingLabel = (score: number) => {
    if (score >= 0.8) return { text: "Verified", color: "text-green-400" };
    if (score >= 0.5) return { text: "Partial", color: "text-yellow-400" };
    return { text: "Unverified", color: "text-red-400" };
  };

  const reliability = getReliabilityLabel(currentStats.average_trust_score);
  const grounding = getGroundingLabel(currentStats.average_trust_score);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-primary font-mono animate-pulse">INITIALIZING SYSTEM...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#030303] text-white p-3 md:p-4 lg:p-6 relative overflow-hidden flex flex-col">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 premium-grid [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_60%,transparent_100%)] pointer-events-none" />
      
      {/* Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,255,148,0.08),transparent_50%)] pointer-events-none" />
      
      {/* Premium Scanlines */}
      <div className="scanline" />
      
      {/* Floating Particles - Elegant and Smooth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{ bottom: '0' }} />
        ))}
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10 flex flex-col h-full w-full overflow-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-4 gap-2 md:gap-3 flex-shrink-0">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="text-primary" size={24} />
              </div>
              <span>AgentAudit</span>
              <span className="text-gray-600 font-light text-base md:text-xl hidden sm:inline">| Reliability Intelligence</span>
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-xs md:text-sm">SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span></p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <a 
              href="https://rapidapi.com/jakops88/api/agentaudit-ai-hallucination-fact-checker1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative px-6 py-3 md:px-8 md:py-3.5 rounded-xl flex items-center gap-3 text-base md:text-lg font-mono font-bold text-black bg-primary border-2 border-primary hover:bg-primary/90 transition-all cursor-pointer group neon-pulse overflow-hidden shadow-[0_0_30px_rgba(0,255,148,0.5)] hover:shadow-[0_0_50px_rgba(0,255,148,0.8)] hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              <Zap size={20} className="group-hover:scale-125 group-hover:rotate-12 transition-all relative z-10 animate-pulse" />
              <span className="hidden sm:inline relative z-10 tracking-wider">TRY API NOW</span>
              <span className="sm:hidden relative z-10 tracking-wider">TRY API</span>
            </a>
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-mono text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">LIVE FEED</span>
              <span className="sm:hidden">LIVE</span>
            </div>
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-mono text-gray-400">
              <Lock size={14} />
              SECURE
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-hidden">
          {error && (
            <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg flex items-center gap-3 flex-shrink-0">
              <AlertTriangle className="text-yellow-500" size={20} />
              <div>
                <h3 className="text-xs font-bold text-yellow-500">API Connection Issue</h3>
                <p className="text-[10px] text-gray-400">{error} - Dashboard running in offline mode</p>
              </div>
            </div>
          )}
            {/* Top Row: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
              <MetricCard 
                title="Total Verifications" 
                value={currentStats.total_verifications.toLocaleString()} 
                icon={Activity}
                color="text-white"
              />
              <MetricCard 
                title="Success Rate" 
                value={`${successRate}%`} 
                icon={CheckCircle}
                color="text-primary"
              />
              <MetricCard 
                title="Avg Latency" 
                value="142ms" 
                icon={Zap}
                color="text-yellow-400"
              />
            </div>

            {/* Bottom Row: Main Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 flex-1 overflow-hidden">
              {/* Left: Verification Console */}
              <div className="lg:col-span-1 h-full overflow-hidden">
                <VerificationConsole />
              </div>

              {/* Middle: Trust Gauge */}
              <div className="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden h-full" style={{ zIndex: 1 }}>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <h3 className="text-sm md:text-base font-medium text-gray-400 mb-3 md:mb-4 uppercase tracking-widest text-center relative z-10">Global Trust Score</h3>
                <div className="scale-75 sm:scale-90 md:scale-100 relative z-10 flex-shrink-0">
                  <TrustGauge score={currentStats.average_trust_score} />
                </div>
                <div className="mt-3 md:mt-6 grid grid-cols-2 gap-2 md:gap-3 w-full max-w-md relative z-10">
                  <div className="text-center p-3 md:p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-gray-500 uppercase mb-1">Reliability</div>
                    <div className={cn("text-lg md:text-xl font-bold", reliability.color)}>{reliability.text}</div>
                  </div>
                  <div className="text-center p-3 md:p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-gray-500 uppercase mb-1">Grounding</div>
                    <div className={cn("text-lg md:text-xl font-bold", grounding.color)}>{grounding.text}</div>
                  </div>
                </div>
              </div>

              {/* Right: Live Logs */}
              <div className="glass-panel rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 md:mb-4 flex-shrink-0">
                  <h3 className="text-base md:text-lg font-medium text-gray-400 flex items-center gap-2">
                    <Terminal size={16} className="md:w-[18px] md:h-[18px]" />
                    LIVE LOGS
                  </h3>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">REAL-TIME</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {currentStats.recent_logs?.map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                    {(!currentStats.recent_logs || currentStats.recent_logs.length === 0) && (
                      <div className="text-center text-gray-600 py-8 md:py-12 font-mono text-xs md:text-sm">
                        WAITING FOR TRAFFIC...
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
