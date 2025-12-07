
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  type: 'ACTIVE' | 'PASSIVE';
  description: string;
  cooldown: number; // in seconds
  status: 'READY' | 'LOCKED' | 'COOLDOWN';
  iconStr: string;
}

const MOCK_SKILLS: Skill[] = [
  { id: 's1', name: "SPRINT", type: 'ACTIVE', description: "Increase movement speed by 30%.", cooldown: 60, status: 'READY', iconStr: "⚡" },
  { id: 's2', name: "STEALTH", type: 'ACTIVE', description: "Become invisible for 10 seconds.", cooldown: 120, status: 'LOCKED', iconStr: "👁" },
  { id: 's3', name: "VITAL STRIKE", type: 'ACTIVE', description: "Deal critical damage to weak points.", cooldown: 15, status: 'READY', iconStr: "⚔" },
  { id: 's4', name: "BLOODLUST", type: 'PASSIVE', description: "Induce fear in enemies weaker than you.", cooldown: 0, status: 'READY', iconStr: "🩸" },
  { id: 's5', name: "SHADOW SWAP", type: 'ACTIVE', description: "Switch positions with a shadow soldier.", cooldown: 180, status: 'COOLDOWN', iconStr: "👤" },
  { id: 's6', name: "DOMINATOR'S TOUCH", type: 'ACTIVE', description: "Control objects with your mind.", cooldown: 45, status: 'READY', iconStr: "✋" },
];

const Hexagon: React.FC<{ 
  skill: Skill; 
  onClick: (id: string) => void;
  cooldownProgress: number; 
}> = ({ skill, onClick, cooldownProgress }) => {
  const isLocked = skill.status === 'LOCKED';
  const isOnCooldown = skill.status === 'COOLDOWN' || cooldownProgress > 0;

  return (
    <div className="relative w-20 h-24 mx-1 my-[-10px] group cursor-pointer" onClick={() => !isLocked && onClick(skill.id)}>
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
            <span className={`text-2xl mb-1 ${isLocked ? 'text-gray-600' : 'text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]'}`}>
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

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black/90 border border-neon-blue/50 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none backdrop-blur-md hidden group-hover:block">
          <div className="text-neon-blue font-orbitron text-[10px] font-bold uppercase mb-1">{skill.name}</div>
          <div className="text-gray-400 font-mono text-[9px]">{skill.description}</div>
          {!isLocked && skill.cooldown > 0 && (
              <div className="text-neon-purple font-mono text-[9px] mt-1">CD: {skill.cooldown}s</div>
          )}
          {isLocked && <div className="text-red-500 font-mono text-[9px] mt-1">[LOCKED]</div>}
      </div>
    </div>
  );
};

export const SkillLibrary: React.FC = () => {
  const [skills, setSkills] = useState(MOCK_SKILLS);
  // Track active cooldowns: { skillId: remainingTimeMs }
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({}); 

  // Initial setup for mocked cooldowns
  useEffect(() => {
     const initialCd: Record<string, number> = {};
     skills.forEach(s => {
         if (s.status === 'COOLDOWN') {
             initialCd[s.id] = s.cooldown * 1000 * 0.5; // Simulate halfway done
         }
     });
     setCooldowns(initialCd);
  }, []);

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

  const triggerSkill = (id: string) => {
      const skill = skills.find(s => s.id === id);
      if (!skill || skill.status === 'LOCKED' || cooldowns[id] > 0) return;
      
      // Start cooldown
      if (skill.cooldown > 0) {
          setCooldowns(prev => ({
              ...prev,
              [id]: skill.cooldown * 1000
          }));
      }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-neon-blue/20 p-4">
        <h3 className="text-neon-blue font-orbitron text-sm mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center justify-between">
            <span>SKILL RUNES</span>
            <span className="text-[10px] text-gray-500 font-mono">slots: {skills.filter(s => s.status !== 'LOCKED').length}/{skills.length}</span>
        </h3>
        
        <div className="flex-grow flex flex-wrap content-start justify-center gap-y-2 px-2 py-4">
            {skills.map(skill => (
                <Hexagon 
                    key={skill.id} 
                    skill={skill} 
                    onClick={triggerSkill}
                    cooldownProgress={cooldowns[skill.id] ? (cooldowns[skill.id] / (skill.cooldown * 1000)) * 100 : 0}
                />
            ))}
        </div>
    </div>
  );
};
