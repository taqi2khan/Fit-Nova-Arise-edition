import React, { useState } from 'react';
import { UserStats, Rank } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface StatsGridProps {
  stats: UserStats;
  baselineStats?: UserStats;
  currentRank?: Rank;
}

const STAT_DESCRIPTIONS: Record<string, string> = {
  // Physical
  strength: "Determines physical power and carry weight limit.",
  agility: "Affects movement speed, evasion, and reflexes.",
  endurance: "Increases defense and resistance to physical damage.",
  flexibility: "Enhances range of motion and skill execution fluidity.",
  stamina: "Controls the duration of physical exertion before fatigue.",
  vitality: "Governs HP recovery rate and overall health pool.",
  physique_score: "Overall rating of physical body condition.",

  // Mental
  intelligence: "Increases Mana (MP) and magical power.",
  focus: "Improves concentration and critical hit rate.",
  willpower: "Resistance to mental status effects and fear.",
  stress_resilience: "Ability to maintain composure under pressure.",
  consistency_index: "Measure of daily routine adherence.",

  // Special
  shadow_potential: "Capacity to store and command shadow soldiers.",
  awakening_rate: "Progress towards the next awakening stage.",
  aura_control: "Efficiency of magical energy manipulation.",

  // Vitals
  fatigue_level: "Current exhaustion. High fatigue reduces stats.",
  sleep_quality: "Restoration efficiency during sleep cycles.",
  hydration_score: "Water balance. Affects recovery and stamina.",
  reaction_time: "Speed of neural response to threats.",
  power_index: "Composite combat power rating.",
  combativeness: "Aggression and fighting spirit level.",
};

const RANK_MULTIPLIERS: Record<string, number> = {
  [Rank.E]: 1,
  [Rank.D]: 3,
  [Rank.C]: 6,
  [Rank.B]: 12,
  [Rank.A]: 25,
  [Rank.S]: 50,
  [Rank.NATIONAL]: 100
};

const RANK_ORDER = [Rank.E, Rank.D, Rank.C, Rank.B, Rank.A, Rank.S, Rank.NATIONAL];

// Reusable Tooltip Component
const StatTooltip: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 5, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 5, scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className="absolute bottom-full left-0 mb-3 z-[60] w-56 bg-black/95 border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)] p-3 backdrop-blur-xl pointer-events-none"
  >
    {/* Arrow pointing down */}
    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-black border-r border-b border-neon-blue rotate-45 transform" />
    
    <div className="relative z-10">
        <h4 className="text-neon-blue font-orbitron text-[10px] uppercase font-bold mb-1 pb-1 border-b border-neon-blue/30 flex justify-between">
            <span>[INFO]</span>
            <span className="text-white/50">{title}</span>
        </h4>
        <p className="text-gray-300 font-mono text-[11px] leading-snug">
            {description}
        </p>
    </div>
  </motion.div>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, baselineStats, currentRank }) => {
  const statGroups = [
    { name: "Physical", keys: ["strength", "agility", "endurance", "flexibility", "stamina", "vitality", "physique_score"] },
    { name: "Mental", keys: ["intelligence", "focus", "willpower", "stress_resilience", "consistency_index"] },
    { name: "Special", keys: ["shadow_potential", "awakening_rate", "aura_control"] },
    { name: "Vitals", keys: ["fatigue_level", "sleep_quality", "hydration_score", "reaction_time", "power_index", "combativeness"] },
  ];

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'growth' | 'target'>('view');

  const getTargetStats = (): Partial<UserStats> | null => {
    if (!currentRank || !baselineStats) return null;
    const currentIndex = RANK_ORDER.indexOf(currentRank);
    const nextRank = RANK_ORDER[currentIndex + 1];
    
    if (!nextRank) return null; // Already max rank

    const multiplier = RANK_MULTIPLIERS[nextRank] || 2;
    const targetStats: any = {};
    
    Object.keys(baselineStats).forEach(key => {
        const k = key as keyof UserStats;
        if (typeof baselineStats[k] === 'number') {
            targetStats[k] = (baselineStats[k] as number) * multiplier;
        }
    });
    return targetStats as UserStats;
  };

  const targetStats = getTargetStats();

  const cycleMode = () => {
      if (mode === 'view') setMode('growth');
      else if (mode === 'growth' && targetStats) setMode('target');
      else setMode('view');
  };

  const getModeLabel = () => {
      switch(mode) {
          case 'growth': return 'MODE: GROWTH (vs LVL 1)';
          case 'target': return 'MODE: TARGET (NEXT RANK)';
          default: return 'MODE: NORMAL VIEW';
      }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      {baselineStats && (
        <div className="flex justify-between items-end border-b border-gray-800 pb-2">
           <div className="text-[10px] text-gray-500 font-mono">
              SYSTEM ANALYSIS MODULE
           </div>
           <button 
            onClick={cycleMode}
            className={`text-[10px] font-mono border px-3 py-1 uppercase tracking-wider transition-all duration-300 ${
              mode !== 'view'
                ? 'border-neon-blue text-black bg-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
            }`}
          >
             {getModeLabel()}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {statGroups.map((group, groupIndex) => (
          <motion.div 
            key={group.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="bg-black/40 border border-gray-800 p-4 relative"
          >
            <h3 className="text-neon-blue font-orbitron text-sm mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-neon-blue rounded-full" />
              {group.name} Parameters
            </h3>
            <div className="space-y-3">
              {group.keys.map((key) => {
                const value = stats[key as keyof UserStats];
                
                // Comparison Logic
                let diff = null;
                let isBetter = false;
                let displaySymbol = '';

                if (mode === 'growth' && baselineStats) {
                    const baseVal = baselineStats[key as keyof UserStats];
                    if (typeof value === 'number' && typeof baseVal === 'number') {
                        const numericDiff = value - baseVal;
                        if (numericDiff !== 0) {
                            diff = numericDiff;
                            // For Growth: Higher is better (usually), Reaction time lower is better
                            isBetter = key === 'reaction_time' ? numericDiff < 0 : numericDiff > 0;
                            displaySymbol = numericDiff > 0 ? '+' : '';
                        }
                    }
                } else if (mode === 'target' && targetStats) {
                    const targetVal = targetStats[key as keyof UserStats];
                    if (typeof value === 'number' && typeof targetVal === 'number') {
                        const numericDiff = value - targetVal;
                        // For Target: We want to reach it, so usually value < target. Diff will be negative.
                        diff = numericDiff; 
                        // If diff >= 0, we met target (Good). If diff < 0, we are under (Bad/Neutral).
                        isBetter = key === 'reaction_time' ? numericDiff <= 0 : numericDiff >= 0;
                        displaySymbol = numericDiff > 0 ? '+' : '';
                    }
                }

                return (
                  <div key={key} className="relative group">
                      <motion.div 
                          className="flex justify-between items-center p-2.5 rounded cursor-help border border-transparent relative z-10 bg-black/20"
                          onMouseEnter={() => setHoveredStat(key)}
                          onMouseLeave={() => setHoveredStat(null)}
                          whileHover={{ 
                              scale: 1.02,
                              borderColor: "rgba(0, 243, 255, 0.6)",
                              boxShadow: "0 0 15px rgba(0, 243, 255, 0.15), inset 0 0 10px rgba(0, 243, 255, 0.05)",
                              backgroundColor: "rgba(0, 243, 255, 0.02)"
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                          <span className="text-gray-400 font-mono text-xs uppercase transition-colors duration-300 group-hover:text-white">
                              {key.replace(/_/g, ' ')}
                          </span>
                          
                          <div className="flex items-center gap-2">
                              {/* Comparison Indicator */}
                              {diff !== null && (
                                  <motion.span 
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`font-mono text-[10px] flex items-center gap-1 ${isBetter ? 'text-green-500' : 'text-red-500'}`}
                                  >
                                      <span>{displaySymbol}{diff?.toFixed(0)}</span>
                                      <span className="text-[8px]">{isBetter ? '▲' : '▼'}</span>
                                  </motion.span>
                              )}

                              <span className={`font-mono font-bold drop-shadow-[0_0_5px_rgba(0,243,255,0.6)] ${mode === 'target' && !isBetter ? 'text-yellow-500' : 'text-neon-blue'}`}>
                                  {typeof value === 'number' && key !== 'reaction_time' ? value.toFixed(0) : value}
                                  {key === 'reaction_time' && 'ms'}
                                  {key === 'awakening_rate' && '%'}
                              </span>
                          </div>
                      </motion.div>

                      <AnimatePresence>
                          {hoveredStat === key && (
                              <StatTooltip 
                                  title={key.replace(/_/g, ' ')} 
                                  description={STAT_DESCRIPTIONS[key] || "System data unavailable."} 
                              />
                          )}
                      </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};