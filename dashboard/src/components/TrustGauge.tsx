import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const TrustGauge = ({ score }: { score: number }) => {
  const percentage = score * 100;
  const color = percentage > 80 ? "#00FF94" : percentage > 50 ? "#FFD700" : "#FF003C";
  
  return (
    <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto" style={{ zIndex: 1 }}>
      {/* Outer Ring */}
      <svg className="w-full h-full transform -rotate-90" style={{ display: 'block' }} viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="128"
          r="110"
          stroke="#1a1a1a"
          strokeWidth="10"
          fill="transparent"
        />
        <motion.circle
          cx="128"
          cy="128"
          r="110"
          stroke={color}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={691}
          strokeDashoffset={691 - (691 * percentage) / 100}
          strokeLinecap="round"
          initial={{ strokeDashoffset: 691 }}
          animate={{ strokeDashoffset: 691 - (691 * percentage) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 2 }}>
        <Shield size={36} color={color} className="mb-1 sm:mb-2 opacity-80 drop-shadow-lg sm:w-10 sm:h-10 md:w-12 md:h-12" />
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-white drop-shadow-lg">
          {percentage.toFixed(0)}<span className="text-lg sm:text-xl md:text-2xl text-gray-400">%</span>
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mt-1 sm:mt-2 font-bold">Trust Score</div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: color, zIndex: 0 }}></div>
    </div>
  );
};
