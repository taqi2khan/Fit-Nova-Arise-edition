
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStats } from '../types';

// --- ASSETS & CONFIGURATION ---

type HairStyle = 'SHORT' | 'SPIKY' | 'HOOD' | 'LONG' | 'MOHAWK' | 'PONYTAIL';
type Outfit = 'STARTER' | 'HUNTER' | 'SHADOW' | 'TANKTOP' | 'SUIT' | 'ARMORED';
type Accessory = 'NONE' | 'MASK' | 'SCARF' | 'HEADBAND' | 'GLASSES' | 'EYEPATCH';

interface AvatarConfig {
  hair: HairStyle;
  outfit: Outfit;
  accessory: Accessory;
}

const DEFAULT_CONFIG: AvatarConfig = {
  hair: 'SHORT',
  outfit: 'STARTER',
  accessory: 'NONE'
};

// SVG PATHS (Normalized to ~200x350 coordinate system)
const ASSETS = {
  BODY_BASE: "M100,30 C115,30 125,40 125,55 L125,65 C145,65 160,75 160,100 L160,180 C160,190 150,200 130,200 L130,300 C130,310 120,320 110,320 L90,320 C80,320 70,310 70,300 L70,200 C50,200 40,190 40,180 L40,100 C40,75 55,65 75,65 L75,55 C75,40 85,30 100,30 Z",
  HEAD_BASE: "M100,10 C115,10 125,20 125,35 C125,50 115,60 100,60 C85,60 75,50 75,35 C75,20 85,10 100,10 Z",
  
  HAIR: {
    SHORT: "M75,35 Q100,15 125,35", // Simple hairline
    SPIKY: "M70,35 L80,15 L90,30 L100,5 L110,30 L120,15 L130,35", // Zigzag top
    HOOD: "M65,60 C55,40 65,5 100,0 C135,5 145,40 135,60", // Large outer curve
    LONG: "M75,35 Q100,15 125,35 M75,35 Q60,80 55,120 M125,35 Q140,80 145,120", // Flowing sides
    MOHAWK: "M92,35 L92,10 L100,5 L108,10 L108,35", // Central spike strip
    PONYTAIL: "M75,35 Q100,15 125,35 M125,30 Q150,40 145,90", // Side pony/tail
  },
  
  OUTFIT: {
    STARTER: "M75,65 L125,65 L125,180 L75,180 Z", // Basic Box
    HUNTER: "M65,65 L135,65 L130,180 L70,180 Z M55,65 L75,65 L75,90 L55,80 Z M125,65 L145,65 L145,80 L125,90 Z", // Armor + Shoulders
    SHADOW: "M70,65 Q100,75 130,65 L140,280 L60,280 Z", // Long Robe
    TANKTOP: "M80,65 Q100,75 120,65 L120,180 L80,180 Z", // Tight fit, scoop neck
    SUIT: "M70,65 L130,65 L130,180 L70,180 Z M95,65 L100,85 L105,65", // Jacket with tie area
    ARMORED: "M65,65 L135,65 L135,180 L65,180 Z M50,55 L80,55 L80,80 L50,75 Z M120,55 L150,55 L150,75 L120,80 Z", // Heavy shoulders
  },

  ACCESSORY: {
    NONE: "",
    MASK: "M85,45 L115,45 L112,58 L88,58 Z", // Mouth cover
    SCARF: "M70,60 Q100,80 130,60 L130,75 Q100,95 70,75 Z", // Neck wrap
    HEADBAND: "M73,28 L127,28 L127,34 L73,34 Z", // Forehead strip
    GLASSES: "M82,42 L98,42 L98,50 L82,50 Z M102,42 L118,42 L118,50 L102,50 Z M98,46 L102,46", // Specs
    EYEPATCH: "M105,38 L122,38 L118,52 L105,52 Z M73,30 L125,45", // Right eye patch + strap
  }
};

interface PlayerAvatarProps {
  stats?: UserStats;
  onStatUpdate?: (stat: keyof UserStats, value: number) => void;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ stats, onStatUpdate }) => {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'COSMETIC' | 'TRAINING'>('COSMETIC');
  
  // Animation State: 'NONE' | 'STRENGTH' | 'AGILITY' | 'VITALITY' | 'INTELLIGENCE'
  const [animEffect, setAnimEffect] = useState<string>('NONE');

  // Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('fitnova_avatar_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load avatar config", e);
      }
    }
  }, []);

  const saveConfig = (newConfig: AvatarConfig) => {
    setConfig(newConfig);
    localStorage.setItem('fitnova_avatar_config', JSON.stringify(newConfig));
  };

  const cycleOption = (type: keyof AvatarConfig, direction: 1 | -1) => {
    const options: Record<string, string[]> = {
      hair: ['SHORT', 'SPIKY', 'HOOD', 'LONG', 'MOHAWK', 'PONYTAIL'],
      outfit: ['STARTER', 'HUNTER', 'SHADOW', 'TANKTOP', 'SUIT', 'ARMORED'],
      accessory: ['NONE', 'MASK', 'SCARF', 'HEADBAND', 'GLASSES', 'EYEPATCH']
    };
    
    const currentList = options[type];
    const currentIndex = currentList.indexOf(config[type]);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex < 0) nextIndex = currentList.length - 1;
    if (nextIndex >= currentList.length) nextIndex = 0;
    
    saveConfig({ ...config, [type]: currentList[nextIndex] as any });
  };

  const handleStatChange = (stat: keyof UserStats) => {
    if (onStatUpdate) {
      onStatUpdate(stat, 1);
      
      // Trigger Animation
      const effectMap: Record<string, string> = {
        strength: 'STRENGTH',
        agility: 'AGILITY',
        vitality: 'VITALITY',
        intelligence: 'INTELLIGENCE',
        endurance: 'VITALITY' // Map endurance to Vitality visual
      };
      
      const effect = effectMap[stat] || 'NONE';
      setAnimEffect(effect);
      
      // Reset after animation duration
      setTimeout(() => setAnimEffect('NONE'), 1200);
    }
  };

  const equipmentSlots = [
      { id: 'head', label: 'HAIR', x: 50, y: 10, item: config.hair },
      { id: 'chest', label: 'OUTFIT', x: 80, y: 40, item: config.outfit },
      { id: 'acc', label: 'ACCESSORY', x: 20, y: 50, item: config.accessory },
      { id: 'feet', label: 'BOOTS', x: 50, y: 90, item: 'STANDARD' },
  ];

  // Define motion variants for different effects
  const avatarVariants = {
    NONE: { scale: 1, rotate: 0, x: 0, filter: "brightness(1) drop-shadow(0 0 5px rgba(0,243,255,0.5))" },
    STRENGTH: { 
      scale: [1, 1.1, 1.05, 1.1, 1], 
      rotate: [0, -1, 1, -1, 0],
      filter: "brightness(1.5) drop-shadow(0 0 20px rgba(255,50,50,0.8)) hue-rotate(-50deg)",
      transition: { duration: 0.5 }
    },
    AGILITY: {
      x: [0, -20, 20, -10, 10, 0],
      skewX: [0, -20, 20, 0],
      opacity: [1, 0.5, 0.8, 0.5, 1],
      filter: "blur(1px) drop-shadow(0 0 10px rgba(0,255,255,0.8))",
      transition: { duration: 0.6 }
    },
    VITALITY: {
      scale: [1, 1.05, 1],
      filter: "brightness(1.2) drop-shadow(0 0 30px rgba(50,255,50,0.6)) hue-rotate(100deg)",
      transition: { duration: 1, repeat: 1 }
    },
    INTELLIGENCE: {
      filter: "brightness(1.3) drop-shadow(0 0 25px rgba(100,50,255,0.8))",
      y: [0, -5, 0],
      transition: { duration: 1 }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-black/40 border border-neon-blue/20 backdrop-blur-sm group transition-all duration-500">
       
       {/* Background Grid for 3D effect */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [perspective:500px]" />

       <div className={`relative w-[200px] h-[350px] [perspective:1000px] transition-all duration-500 ${isEditing ? 'scale-110 translate-y-[-20px]' : ''}`}>
           {/* Rotating Container */}
           <motion.div 
              animate={animEffect === 'NONE' ? { rotateY: isEditing ? 0 : 360 } : avatarVariants[animEffect as keyof typeof avatarVariants]}
              transition={animEffect === 'NONE' ? { duration: isEditing ? 0.5 : 15, repeat: isEditing ? 0 : Infinity, ease: "linear" } : undefined}
              className="w-full h-full relative [transform-style:preserve-3d]"
           >
               {/* THE BODY - Multiple layers to simulate volume */}
               {[0, 1, 2, 3].map((i) => (
                   <div 
                      key={i} 
                      className="absolute inset-0 flex items-center justify-center opacity-60"
                      style={{ transform: `rotateY(${i * 45}deg) translateZ(${i === 0 ? 0 : '10px'})` }}
                   >
                        <svg viewBox="0 0 200 350" className="w-full h-full drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                             {/* Base Body */}
                             <path d={ASSETS.BODY_BASE} fill="none" stroke="#00f3ff" strokeWidth="1" className={!isEditing && animEffect === 'NONE' ? "animate-pulse" : ""} />
                             <path d={ASSETS.HEAD_BASE} fill="rgba(0, 243, 255, 0.1)" stroke="#00f3ff" strokeWidth="1" />
                             
                             {/* Custom Outfit */}
                             <path d={ASSETS.OUTFIT[config.outfit]} fill={config.outfit === 'SHADOW' ? "rgba(0, 243, 255, 0.2)" : "rgba(0, 0, 0, 0.5)"} stroke="#00f3ff" strokeWidth="1.5" />

                             {/* Custom Hair */}
                             <path d={ASSETS.HAIR[config.hair]} fill="none" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round" />

                             {/* Custom Accessory */}
                             {config.accessory !== 'NONE' && (
                                <path d={ASSETS.ACCESSORY[config.accessory]} fill={config.accessory === 'GLASSES' ? 'rgba(0,243,255,0.2)' : 'rgba(0,243,255,0.3)'} stroke="#00f3ff" strokeWidth="1" />
                             )}

                             {/* Internal Tech Lines (Only visible on specific outfits) */}
                             {(config.outfit === 'STARTER' || config.outfit === 'HUNTER' || config.outfit === 'TANKTOP') && (
                                <>
                                  <line x1="100" y1="65" x2="100" y2="180" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                                  <line x1="75" y1="100" x2="125" y2="100" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                                </>
                             )}
                        </svg>
                   </div>
               ))}

               {/* Effects Layer (Aura etc) */}
               {animEffect === 'INTELLIGENCE' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute top-[20px] left-[50px] w-[100px] h-[100px] border border-blue-500 rounded-full bg-blue-500/20"
                  />
               )}
               {animEffect === 'VITALITY' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                  />
               )}

               {/* Central Core Glow */}
               <div className="absolute top-[100px] left-[95px] w-[10px] h-[10px] bg-neon-blue rounded-full shadow-[0_0_20px_#00f3ff]" />
           </motion.div>

           {/* Floor Disc */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[180px] border border-neon-blue rounded-full [transform:rotateX(70deg)_translateZ(-50px)] opacity-30 animate-[spin_10s_linear_infinite]" />
       </div>

       {/* Floating Equipment Slots (Hidden when Editing) */}
       <AnimatePresence>
         {!isEditing && equipmentSlots.map((slot, i) => (
             <motion.div 
               key={slot.id}
               initial={{ opacity: 0, x: slot.x > 50 ? 20 : -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0 }}
               transition={{ delay: i * 0.1 }}
               className="absolute pointer-events-none"
               style={{ top: `${slot.y}%`, left: `${slot.x}%`, transform: 'translate(-50%, -50%)' }}
             >
                 {/* Line Connector */}
                 <div className={`absolute top-1/2 w-16 h-[1px] bg-neon-blue/40 ${slot.x > 50 ? 'right-full' : 'left-full'}`} />
                 
                 <div className={`flex flex-col ${slot.x > 50 ? 'items-start pl-20' : 'items-end pr-20'}`}>
                     <span className="text-[10px] text-neon-blue font-mono border border-neon-blue/30 px-1 bg-black/80">{slot.label}</span>
                     <span className="text-xs text-white font-orbitron mt-0.5 whitespace-nowrap">{slot.item}</span>
                 </div>
             </motion.div>
         ))}
       </AnimatePresence>

       {/* EDIT CONTROLS OVERLAY */}
       <AnimatePresence>
         {isEditing && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-16 left-0 right-0 p-4 flex justify-center gap-4 z-20"
            >
               <div className="bg-black/90 border border-neon-blue backdrop-blur p-4 flex flex-col gap-3 min-w-[300px] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  {/* TAB SWITCHER */}
                  <div className="flex border-b border-gray-800 mb-2">
                      <button 
                        onClick={() => setEditMode('COSMETIC')}
                        className={`flex-1 text-[10px] font-orbitron font-bold py-1 ${editMode === 'COSMETIC' ? 'text-black bg-neon-blue' : 'text-gray-500 hover:text-white'}`}
                      >
                        APPEARANCE
                      </button>
                      <button 
                        onClick={() => setEditMode('TRAINING')}
                        className={`flex-1 text-[10px] font-orbitron font-bold py-1 ${editMode === 'TRAINING' ? 'text-black bg-neon-blue' : 'text-gray-500 hover:text-white'}`}
                      >
                        TRAINING
                      </button>
                  </div>

                  {editMode === 'COSMETIC' ? (
                    <>
                      {/* HAIR CONTROL */}
                      <div className="flex items-center justify-between font-mono text-xs text-white">
                          <span className="text-gray-400 w-16">HAIR</span>
                          <div className="flex items-center gap-2">
                              <button onClick={() => cycleOption('hair', -1)} className="hover:text-neon-blue px-2">&lt;</button>
                              <span className="w-20 text-center text-neon-blue">{config.hair}</span>
                              <button onClick={() => cycleOption('hair', 1)} className="hover:text-neon-blue px-2">&gt;</button>
                          </div>
                      </div>

                      {/* OUTFIT CONTROL */}
                      <div className="flex items-center justify-between font-mono text-xs text-white">
                          <span className="text-gray-400 w-16">OUTFIT</span>
                          <div className="flex items-center gap-2">
                              <button onClick={() => cycleOption('outfit', -1)} className="hover:text-neon-blue px-2">&lt;</button>
                              <span className="w-20 text-center text-neon-blue">{config.outfit}</span>
                              <button onClick={() => cycleOption('outfit', 1)} className="hover:text-neon-blue px-2">&gt;</button>
                          </div>
                      </div>

                      {/* ACCESSORY CONTROL */}
                      <div className="flex items-center justify-between font-mono text-xs text-white">
                          <span className="text-gray-400 w-16">GEAR</span>
                          <div className="flex items-center gap-2">
                              <button onClick={() => cycleOption('accessory', -1)} className="hover:text-neon-blue px-2">&lt;</button>
                              <span className="w-20 text-center text-neon-blue">{config.accessory}</span>
                              <button onClick={() => cycleOption('accessory', 1)} className="hover:text-neon-blue px-2">&gt;</button>
                          </div>
                      </div>
                    </>
                  ) : (
                    <>
                       <div className="text-[9px] text-gray-500 text-center mb-1 font-mono">SIMULATE STAT GROWTH</div>
                       
                       <div className="grid grid-cols-2 gap-2">
                           <button onClick={() => handleStatChange('strength')} className="border border-red-500/50 hover:bg-red-900/30 text-red-400 text-xs font-mono py-1 flex justify-between px-2">
                              <span>STR</span> <span className="font-bold">+</span>
                           </button>
                           <button onClick={() => handleStatChange('agility')} className="border border-green-500/50 hover:bg-green-900/30 text-green-400 text-xs font-mono py-1 flex justify-between px-2">
                              <span>AGI</span> <span className="font-bold">+</span>
                           </button>
                           <button onClick={() => handleStatChange('intelligence')} className="border border-blue-500/50 hover:bg-blue-900/30 text-blue-400 text-xs font-mono py-1 flex justify-between px-2">
                              <span>INT</span> <span className="font-bold">+</span>
                           </button>
                           <button onClick={() => handleStatChange('vitality')} className="border border-yellow-500/50 hover:bg-yellow-900/30 text-yellow-400 text-xs font-mono py-1 flex justify-between px-2">
                              <span>VIT</span> <span className="font-bold">+</span>
                           </button>
                       </div>
                    </>
                  )}

               </div>
            </motion.div>
         )}
       </AnimatePresence>

       {/* Toggle Edit Button */}
       <div className="absolute bottom-4 w-full flex justify-center z-30">
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`px-6 py-2 border font-orbitron text-xs font-bold uppercase tracking-widest transition-all
               ${isEditing 
                  ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_15px_#00f3ff]' 
                  : 'bg-black/50 text-neon-blue border-neon-blue/50 hover:bg-neon-blue/20'
               }`}
          >
             {isEditing ? 'DONE' : 'CUSTOMIZE'}
          </button>
       </div>

       {/* Scanning Beam (Only when not editing) */}
       {!isEditing && (
         <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-neon-blue/50 shadow-[0_0_20px_#00f3ff] z-10 pointer-events-none"
         />
       )}
       
       <div className="absolute bottom-2 left-4 text-[10px] text-neon-blue/50 font-mono">
           MODEL_RENDER_V4.5 // [ONLINE]
       </div>
    </div>
  );
};
