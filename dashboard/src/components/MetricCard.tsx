import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const MetricCard = ({ title, value, icon: Icon, trend, color = "text-primary" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-3 md:p-4 rounded-lg md:rounded-xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={48} className="md:w-16 md:h-16" />
    </div>
    <div className="flex items-center gap-2 mb-1 text-gray-400">
      <Icon size={14} className="md:w-4 md:h-4" />
      <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className={cn("text-2xl md:text-3xl font-bold font-mono", color)}>{value}</span>
      {trend && (
        <span className={cn("text-xs mb-1", trend > 0 ? "text-green-400" : "text-red-400")}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
  </motion.div>
);
