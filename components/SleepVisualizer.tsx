import React from 'react';
import { motion } from 'framer-motion';

interface SleepVisualizerProps {
  sleepQuality: number;
}

export const SleepVisualizer: React.FC<SleepVisualizerProps> = ({ sleepQuality }) => {
  // Mock sleep cycles (bars) for visual representation
  const cycles = [20, 45, 30, 80, 50, 90, 40, 60, 30, 70, 40, 20, 55, 35, 85, 45, 25];

  return (
    <div className="bg-black/60 border border-blue-900/50 p-4 mt-4 relative group">
        <div className="flex justify-between items-end mb-3 border-b border-blue-900/30 pb-2">
            <h3 className="text-blue-300 font-orbitron text-xs uppercase tracking-widest">SLEEP RECOVERY</h3>
            <div className="flex items-baseline gap-1">
                <span className={`font-bold font-mono text-lg ${sleepQuality > 70 ? 'text-neon-blue' : 'text-yellow-500'}`}>
                    {sleepQuality}%
                </span>
                <span className="text-[9px] text-gray-500">EFFICIENCY</span>
            </div>
        </div>

        <div className="h-16 flex items-end justify-between gap-[2px] relative overflow-hidden">
            {cycles.map((height, i) => (
                <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-blue-500/20 hover:bg-neon-blue/60 transition-colors rounded-t-[1px] relative group/bar"
                >
                     {/* Top cap glow */}
                     <div className="absolute top-0 w-full h-[1px] bg-neon-blue/50 shadow-[0_0_5px_#00f3ff]" />
                </motion.div>
            ))}
            
            {/* Grid Lines */}
            <div className="absolute top-1/4 w-full h-[1px] bg-blue-500/10 pointer-events-none" />
            <div className="absolute top-2/4 w-full h-[1px] bg-blue-500/10 pointer-events-none" />
            <div className="absolute top-3/4 w-full h-[1px] bg-blue-500/10 pointer-events-none" />
        </div>
        
        <div className="mt-2 flex justify-between text-[8px] text-gray-600 font-mono uppercase tracking-wider">
             <span>23:00</span>
             <span>02:00</span>
             <span>05:00</span>
             <span>08:00</span>
        </div>
    </div>
  );
};