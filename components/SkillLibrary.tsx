
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SKILLS } from '../constants';
import { SystemWindow, SystemButton } from './HoloUI';

interface Skill {
  id: string;
  name: string;
  type: string; // 'ACTIVE' | 'PASSIVE'
  description: string;
  cooldown: number; // in seconds
  status: string; // 'READY' | 'LOCKED' | 'COOLDOWN'
  iconStr: string;
}

interface SkillLibraryProps {
  mode?: 'WIDGET' | 'FULL';
}

const Hexagon: React.FC<{ 
  skill: Skill; 
  onClick: (skill: Skill) => void;
  cooldownProgress: number; 
  size?: 'sm' | 'md';
}> = ({ skill, onClick, cooldownProgress, size = 'md' }) => {
  const isLocked = skill.status === 'LOCKED';
  const isOnCooldown = skill.status === 'COOLDOWN' || cooldownProgress > 0;
  
  const dim = size === 'sm' ? 'w-16 h-20' : 'w-24 h-28';
  const fontSize = size === 'sm' ? 'text-xl' : 'text-3xl';

  return (
    <div className={`relative ${dim} mx-2 my-[-5px] md:my-[-10px] group cursor-pointer`} onClick={() => onClick(skill)}>
      {/* Hexagon Clip Container */}
      <div 
        className={`w-full h-full transition-all duration-300 flex items-center justify-center 
            ${isLocked ? 'bg-gray-900 opacity-50 grayscale' : 'bg-black'}
        `}
        style={{ 
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
         {/* Border simulation (Inner Hex) */}
         <div 
            className={`absolute inset-[2px] transition-colors duration-300 flex flex-col items-center justify-center
                ${isLocked ? 'bg-gray-800' : 'bg-black/80 hover:bg-neon-blue/20'}
            `}
            style={{ 
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
         >
            {/* Skill Icon */}
            <span className={`${fontSize} mb-1 ${isLocked ? 'text-gray-600' : 'text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]'}`}>
                {skill.iconStr}
            </span>
            
            {/* Cooldown Overlay */}
            {isOnCooldown && (
                 <motion.div 
                    initial={{ height: '0%' }}
                    animate={{ height: `${cooldownProgress}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-neon-blue/40 z-10"
                    style={{ 
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                 />
            )}
         </div>
         
         {/* Locked Overlay Icon */}
         {isLocked && <div className="absolute inset-0 flex items-center justify-center z-20 text-gray-500 text-xs">🔒</div>}
      </div>
      
      {/* Outer Glow Border for Active Skills */}
      {!isLocked && (
        <div 
            className="absolute inset-0 pointer-events-none border-neon-blue/50 z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                background: 'rgba(0,243,255,0.2)',
                clipPath: 'polygon(50% -2%, 102% 24%, 102% 76%, 50% 102%, -2% 76%, -2% 24%)',
                filter: 'blur(5px)'
            }}
        />
      )}

      {/* Tooltip (Only in Widget Mode) */}
      {size === 'sm' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black/90 border border-neon-blue/50 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none backdrop-blur-md hidden group-hover:block">
              <div className="text-neon-blue font-orbitron text-[10px] font-bold uppercase mb-1">{skill.name}</div>
          </div>
      )}
    </div>
  );
};

export const SkillLibrary: React.FC<SkillLibraryProps> = ({ mode = 'WIDGET' }) => {
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  // Track active cooldowns: { skillId: remainingTimeMs }
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({}); 

  // Timer loop
  useEffect(() => {
      const interval = setInterval(() => {
          setCooldowns(prev => {
              const next = { ...prev };
              let changed = false;
              Object.keys(next).forEach(key => {
                  if (next[key] > 0) {
                      next[key] -= 100; // Remove 100ms
                      changed = true;
                  } else {
                      delete next[key];
                      changed = true;
                  }
              });
              return changed ? next : prev;
          });
      }, 100);
      return () => clearInterval(interval);
  }, []);

  const handleSkillClick = (skill: Skill) => {
      if (mode === 'FULL') {
          setSelectedSkill(skill);
      } else {
          // In widget mode, just trigger cooldown if ready
          if (skill.status === 'READY' && (!cooldowns[skill.id] || cooldowns[skill.id] <= 0)) {
               triggerCooldown(skill);
          }
      }
  };

  const triggerCooldown = (skill: Skill) => {
    if (skill.cooldown > 0) {
        setCooldowns(prev => ({
            ...prev,
            [skill.id]: skill.cooldown * 1000
        }));
    }
  };

  const displayedSkills = mode === 'WIDGET' ? skills.slice(0, 6) : skills;

  return (
    <div className={`flex flex-col h-full ${mode === 'WIDGET' ? 'bg-black/40 border border-neon-blue/20 p-4' : 'p-0'}`}>
        {mode === 'WIDGET' && (
            <h3 className="text-neon-blue font-orbitron text-sm mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center justify-between">
                <span>SKILL RUNES</span>
                <span className="text-[10px] text-gray-500 font-mono">slots: {skills.filter(s => s.status !== 'LOCKED').length}/{skills.length}</span>
            </h3>
        )}
        
        <div className={`flex-grow flex flex-wrap content-start justify-center gap-y-2 ${mode === 'WIDGET' ? 'px-2 py-4' : 'px-4 py-8 gap-x-4'}`}>
            {displayedSkills.map(skill => (
                <Hexagon 
                    key={skill.id} 
                    skill={skill} 
                    onClick={handleSkillClick}
                    cooldownProgress={cooldowns[skill.id] ? (cooldowns[skill.id] / (skill.cooldown * 1000)) * 100 : 0}
                    size={mode === 'FULL' ? 'md' : 'sm'}
                />
            ))}
        </div>

        {/* DETAILS MODAL */}
        <AnimatePresence>
            {selectedSkill && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={() => setSelectedSkill(null)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <SystemWindow title="SKILL INFO" subtitle={`[ID: ${selectedSkill.id.toUpperCase()}]`}>
                            <div className="flex gap-6 items-start">
                                {/* Large Icon */}
                                <div className="w-24 h-24 border border-neon-blue bg-black flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                                    {selectedSkill.iconStr}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold font-orbitron text-white mb-1">{selectedSkill.name}</h2>
                                    <div className="flex gap-2 mb-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-mono border ${selectedSkill.type === 'ACTIVE' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                            {selectedSkill.type}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-mono border border-gray-600 text-gray-400">
                                            CD: {selectedSkill.cooldown}s
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-gray-300 leading-relaxed">
                                        {selectedSkill.description}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-8 border-t border-gray-800 pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Mastery Level</div>
                                    <div className="text-neon-blue font-mono">Lv. 1 [0%]</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rune Rarity</div>
                                    <div className="text-purple-400 font-mono">Epic</div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <SystemButton variant="secondary" onClick={() => setSelectedSkill(null)}>CLOSE</SystemButton>
                                {selectedSkill.status !== 'LOCKED' && (
                                    <SystemButton onClick={() => {
                                        triggerCooldown(selectedSkill);
                                        setSelectedSkill(null);
                                    }}>
                                        ACTIVATE
                                    </SystemButton>
                                )}
                            </div>
                        </SystemWindow>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
