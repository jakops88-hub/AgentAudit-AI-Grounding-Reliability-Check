import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const TrustGauge = ({ score }: { score: number }) => {
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
