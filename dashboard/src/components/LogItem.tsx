import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { LogEntry } from '../hooks/useStats';

export const LogItem = ({ log }: { log: LogEntry }) => (
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
