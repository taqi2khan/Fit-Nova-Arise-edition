
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to generate mock data for the last X days
const generateData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Random intensity 0-4 (biased towards 0-2 for realism)
    const rand = Math.random();
    let level = 0;
    if (rand > 0.85) level = 4;
    else if (rand > 0.65) level = 3;
    else if (rand > 0.45) level = 2;
    else if (rand > 0.2) level = 1;

    data.push({
      date: d,
      dateString: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level: level // 0-4
    });
  }
  return data;
};

const MOCK_HISTORY = generateData(118); // Approx 4 months (17 weeks * 7 days)

export const WorkoutHeatmap: React.FC = () => {
  const [hoveredDay, setHoveredDay] = useState<{ dateString: string; level: number; x: number; y: number } | null>(null);

  const getColor = (level: number) => {
    switch(level) {
        case 1: return 'bg-neon-blue/30 shadow-[0_0_5px_rgba(0,243,255,0.2)]';
        case 2: return 'bg-neon-blue/60 shadow-[0_0_8px_rgba(0,243,255,0.4)]';
        case 3: return 'bg-neon-blue shadow-[0_0_12px_rgba(0,243,255,0.6)]';
        case 4: return 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(0,243,255,0.6)]';
        default: return 'bg-gray-800/30';
    }
  };

  return (
    <div className="bg-black/40 border border-neon-blue/30 backdrop-blur p-4 relative group">
       <h3 className="text-neon-blue font-orbitron text-sm mb-3 uppercase tracking-widest border-b border-gray-800 pb-2 flex justify-between items-center">
          <span>ACTIVITY LOG</span>
          <span className="text-[10px] text-gray-500 font-mono">LAST 4 MONTHS</span>
       </h3>

       {/* The Grid */}
       {/* 7 rows (days), auto-flow column */}
       <div className="flex gap-1 overflow-hidden h-[100px] items-center justify-center relative z-10">
          <div className="grid grid-rows-7 grid-flow-col gap-1">
             {MOCK_HISTORY.map((day, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({ 
                            dateString: day.dateString, 
                            level: day.level,
                            x: rect.left,
                            y: rect.top
                        });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-2.5 h-2.5 rounded-[1px] cursor-pointer hover:border hover:border-white transition-colors duration-200 ${getColor(day.level)}`}
                />
             ))}
          </div>
       </div>

       {/* Legend */}
       <div className="mt-3 flex items-center justify-end gap-2 text-[9px] text-gray-500 font-mono">
           <span>DORMANT</span>
           <div className="flex gap-1">
               <div className="w-2 h-2 bg-gray-800/50"></div>
               <div className="w-2 h-2 bg-neon-blue/30"></div>
               <div className="w-2 h-2 bg-neon-blue/60"></div>
               <div className="w-2 h-2 bg-neon-blue"></div>
               <div className="w-2 h-2 bg-white shadow-[0_0_5px_rgba(0,243,255,1)]"></div>
           </div>
           <span>AWAKENED</span>
       </div>

       {/* Tooltip */}
       <AnimatePresence>
         {hoveredDay && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed z-[9999] pointer-events-none bg-black/90 border border-neon-blue p-2 rounded text-xs font-mono whitespace-nowrap"
                style={{ left: hoveredDay.x - 40, top: hoveredDay.y - 45 }}
             >
                 <div className="text-white font-bold">{hoveredDay.dateString}</div>
                 <div className="text-neon-blue">Intensity: Lvl {hoveredDay.level}</div>
             </motion.div>
         )}
       </AnimatePresence>

       {/* Decorative Scanline */}
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent h-[50%] animate-scanline pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
