
import React, { useState } from 'react';
import { UserStats, Rank } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface StatsGridProps {
  stats: UserStats;
  baselineStats?: UserStats;
  currentRank?: Rank;
  compact?: boolean; // New prop for dashboard view
}

// ... (Keeping Tooltip & descriptions same as before)
const STAT_DESCRIPTIONS: Record<string, string> = {
  strength: "Determines physical power and carry weight limit.",
  agility: "Affects movement speed, evasion, and reflexes.",
  endurance: "Increases defense and resistance to physical damage.",
  flexibility: "Enhances range of motion and skill execution fluidity.",
  stamina: "Controls the duration of physical exertion before fatigue.",
  vitality: "Governs HP recovery rate and overall health pool.",
  physique_score: "Overall rating of physical body condition.",
  intelligence: "Increases Mana (MP) and magical power.",
  focus: "Improves concentration and critical hit rate.",
  willpower: "Resistance to mental status effects and fear.",
  stress_resilience: "Ability to maintain composure under pressure.",
  consistency_index: "Measure of daily routine adherence.",
  shadow_potential: "Capacity to store and command shadow soldiers.",
  awakening_rate: "Progress towards the next awakening stage.",
  aura_control: "Efficiency of magical energy manipulation.",
  fatigue_level: "Current exhaustion. High fatigue reduces stats.",
  sleep_quality: "Restoration efficiency during sleep cycles.",
  hydration_score: "Water balance. Affects recovery and stamina.",
  reaction_time: "Speed of neural response to threats.",
  power_index: "Composite combat power rating.",
  combativeness: "Aggression and fighting spirit level.",
};

// Reusable Tooltip Component
const StatTooltip: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 5, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 5, scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className="absolute bottom-full left-0 mb-3 z-[60] w-48 bg-black/95 border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)] p-3 backdrop-blur-xl pointer-events-none rounded-lg"
  >
    <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-black border-r border-b border-neon-blue rotate-45 transform" />
    <div className="relative z-10">
        <h4 className="text-neon-blue font-orbitron text-[10px] uppercase font-bold mb-1 pb-1 border-b border-neon-blue/30 flex justify-between">
            <span>[INFO]</span>
        </h4>
        <p className="text-gray-300 font-mono text-[10px] leading-snug">{description}</p>
    </div>
  </motion.div>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, compact = false }) => {
  // Only showing Core stats in compact mode
  const keysToDisplay = compact 
    ? ["strength", "agility", "vitality", "intelligence", "focus"] 
    : Object.keys(stats);

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  // Grouping specifically for the "Metric Card" look
  const coreStats = ["strength", "agility", "vitality", "intelligence", "focus"];

  return (
    <div className="w-full">
        {/* Render simple list for the dashboard card */}
        <div className="grid grid-cols-1 gap-3">
          {coreStats.map((key, index) => {
            const value = stats[key as keyof UserStats];
            // Calculate a fake "max" for the progress bar based on value (e.g. value / 100)
            const progress = Math.min((value as number) || 0, 100); 

            return (
              <div key={key} className="relative group">
                  <div 
                      className="flex items-center gap-4 py-1"
                      onMouseEnter={() => setHoveredStat(key)}
                      onMouseLeave={() => setHoveredStat(null)}
                  >
                      {/* Icon / Label */}
                      <div className="w-24 flex-shrink-0">
                          <span className="text-xs text-gray-400 font-mono uppercase group-hover:text-white transition-colors">
                              {key}
                          </span>
                      </div>
                      
                      {/* Bar */}
                      <div className="flex-grow h-2 bg-gray-800/50 rounded-full overflow-hidden relative">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             transition={{ delay: index * 0.1, duration: 1 }}
                             className={`h-full rounded-full ${
                                 key === 'strength' ? 'bg-red-500' :
                                 key === 'agility' ? 'bg-green-500' :
                                 key === 'intelligence' ? 'bg-blue-500' :
                                 key === 'vitality' ? 'bg-yellow-500' :
                                 'bg-purple-500'
                             }`}
                          />
                      </div>

                      {/* Value */}
                      <div className="w-8 text-right font-mono font-bold text-white text-sm">
                          {value}
                      </div>
                  </div>

                  <AnimatePresence>
                      {hoveredStat === key && (
                          <StatTooltip 
                              title={key} 
                              description={STAT_DESCRIPTIONS[key] || "No Data"} 
                          />
                      )}
                  </AnimatePresence>
              </div>
            );
          })}
        </div>
    </div>
  );
};
