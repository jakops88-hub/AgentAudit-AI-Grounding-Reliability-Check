import React, { useMemo } from 'react';
import { Activity, Shield, Zap, Server, AlertTriangle, CheckCircle, Clock, Terminal, Lock } from 'lucide-react';
import { useStats, LogEntry } from './hooks/useStats';
import { VerificationConsole } from './components/VerificationConsole';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

// --- Components ---

const MetricCard = ({ title, value, icon: Icon, trend, color = "text-primary" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-6 rounded-xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} />
    </div>
    <div className="flex items-center gap-3 mb-2 text-gray-400">
      <Icon size={18} />
      <span className="text-sm font-medium uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-end gap-3">
      <span className={cn("text-4xl font-bold font-mono", color)}>{value}</span>
      {trend && (
        <span className={cn("text-sm mb-1", trend > 0 ? "text-green-400" : "text-red-400")}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
  </motion.div>
);

const TrustGauge = ({ score }: { score: number }) => {
  const percentage = score * 100;
  const color = percentage > 80 ? "#00FF94" : percentage > 50 ? "#FFD700" : "#FF003C";
  
  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      {/* Outer Ring */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="#1a1a1a"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={753}
          strokeDashoffset={753 - (753 * percentage) / 100}
          strokeLinecap="round"
          initial={{ strokeDashoffset: 753 }}
          animate={{ strokeDashoffset: 753 - (753 * percentage) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Shield size={48} color={color} className="mb-2 opacity-80" />
        <div className="text-5xl font-bold font-mono text-white">
          {percentage.toFixed(0)}<span className="text-2xl text-gray-500">%</span>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mt-2">Trust Score</div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: color }}></div>
    </div>
  );
};

const LogItem = ({ log }: { log: LogEntry }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 p-3 border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-sm"
  >
    <div className={cn(
      "w-2 h-2 rounded-full",
      log.status === 200 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
    )} />
    <span className="text-gray-500 w-24">{new Date(log.timestamp).toLocaleTimeString()}</span>
    <span className="text-blue-400 w-20">POST</span>
    <span className="flex-1 text-gray-300 truncate">{log.endpoint}</span>
    <span className={cn("w-16 text-right", log.trust_score > 0.8 ? "text-green-400" : "text-yellow-400")}>
      {(log.trust_score * 100).toFixed(0)}%
    </span>
    <span className="text-gray-500 w-16 text-right">{log.latency_ms}ms</span>
  </motion.div>
);

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

  const successRate = useMemo(() => {
    if (!stats || stats.total_verifications === 0) return 0;
    return ((stats.successful_verifications / stats.total_verifications) * 100).toFixed(1);
  }, [stats]);

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

  const reliability = getReliabilityLabel(stats?.average_trust_score || 0);
  const grounding = getGroundingLabel(stats?.average_trust_score || 0);

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
    <div className="min-h-screen bg-[#030303] text-white p-8 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="text-primary" size={24} />
              </div>
              AgentAudit <span className="text-gray-600 font-light">| Reliability Intelligence</span>
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-sm">SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span></p>
          </div>
          <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-mono text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE FEED
            </div>
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-mono text-gray-400">
              <Lock size={14} />
              SECURE
            </div>
          </div>
        </header>

        {error ? (
          <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-xl text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-500 mb-2">Connection Failed</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Row: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Verifications" 
                value={stats?.total_verifications.toLocaleString()} 
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
              {/* Left: Verification Console */}
              <VerificationConsole />

              {/* Middle: Trust Gauge */}
              <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <h3 className="text-lg font-medium text-gray-400 mb-8 uppercase tracking-widest">Global Trust Score</h3>
                <TrustGauge score={stats?.average_trust_score || 0} />
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <div className="text-xs text-gray-500 uppercase mb-1">Reliability</div>
                    <div className={cn("text-xl font-bold", reliability.color)}>{reliability.text}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <div className="text-xs text-gray-500 uppercase mb-1">Grounding</div>
                    <div className={cn("text-xl font-bold", grounding.color)}>{grounding.text}</div>
                  </div>
                </div>
              </div>

              {/* Right: Live Logs */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-400 flex items-center gap-2">
                    <Terminal size={18} />
                    LIVE LOGS
                  </h3>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">REAL-TIME</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {stats?.recent_logs?.map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                    {(!stats?.recent_logs || stats.recent_logs.length === 0) && (
                      <div className="text-center text-gray-600 py-12 font-mono text-sm">
                        WAITING FOR TRAFFIC...
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
