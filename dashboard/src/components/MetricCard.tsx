import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const MetricCard = ({ title, value, icon: Icon, trend, color = "text-primary" }: any) => (
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
