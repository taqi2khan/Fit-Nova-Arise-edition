
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ASSETS & CONFIGURATION ---

type HairStyle = 'SHORT' | 'SPIKY' | 'HOOD';
type Outfit = 'STARTER' | 'HUNTER' | 'SHADOW';
type Accessory = 'NONE' | 'MASK' | 'SCARF';

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
  },
  
  OUTFIT: {
    STARTER: "M75,65 L125,65 L125,180 L75,180 Z", // Basic Box
    HUNTER: "M65,65 L135,65 L130,180 L70,180 Z M55,65 L75,65 L75,90 L55,80 Z M125,65 L145,65 L145,80 L125,90 Z", // Armor + Shoulders
    SHADOW: "M70,65 Q100,75 130,65 L140,280 L60,280 Z", // Long Robe
  },

  ACCESSORY: {
    NONE: "",
    MASK: "M85,45 L115,45 L112,58 L88,58 Z", // Mouth cover
    SCARF: "M70,60 Q100,80 130,60 L130,75 Q100,95 70,75 Z", // Neck wrap
  }
};

export const PlayerAvatar: React.FC = () => {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);

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
      hair: ['SHORT', 'SPIKY', 'HOOD'],
      outfit: ['STARTER', 'HUNTER', 'SHADOW'],
      accessory: ['NONE', 'MASK', 'SCARF']
    };
    
    const currentList = options[type];
    const currentIndex = currentList.indexOf(config[type]);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex < 0) nextIndex = currentList.length - 1;
    if (nextIndex >= currentList.length) nextIndex = 0;
    
    saveConfig({ ...config, [type]: currentList[nextIndex] as any });
  };

  const equipmentSlots = [
      { id: 'head', label: 'HAIR', x: 50, y: 10, item: config.hair },
      { id: 'chest', label: 'OUTFIT', x: 80, y: 40, item: config.outfit },
      { id: 'acc', label: 'ACCESSORY', x: 20, y: 50, item: config.accessory },
      { id: 'feet', label: 'BOOTS', x: 50, y: 90, item: 'STANDARD' },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-black/40 border border-neon-blue/20 backdrop-blur-sm group transition-all duration-500">
       
       {/* Background Grid for 3D effect */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [perspective:500px]" />

       <div className={`relative w-[200px] h-[350px] [perspective:1000px] transition-all duration-500 ${isEditing ? 'scale-110 translate-y-[-20px]' : ''}`}>
           {/* Rotating Container */}
           <motion.div 
              animate={{ rotateY: isEditing ? 0 : 360 }}
              transition={{ duration: isEditing ? 0.5 : 15, repeat: isEditing ? 0 : Infinity, ease: "linear" }}
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
                             <path d={ASSETS.BODY_BASE} fill="none" stroke="#00f3ff" strokeWidth="1" className={!isEditing ? "animate-pulse" : ""} />
                             <path d={ASSETS.HEAD_BASE} fill="rgba(0, 243, 255, 0.1)" stroke="#00f3ff" strokeWidth="1" />
                             
                             {/* Custom Outfit */}
                             <path d={ASSETS.OUTFIT[config.outfit]} fill={config.outfit === 'SHADOW' ? "rgba(0, 243, 255, 0.2)" : "none"} stroke="#00f3ff" strokeWidth="1.5" />

                             {/* Custom Hair */}
                             <path d={ASSETS.HAIR[config.hair]} fill="none" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round" />

                             {/* Custom Accessory */}
                             {config.accessory !== 'NONE' && (
                                <path d={ASSETS.ACCESSORY[config.accessory]} fill="rgba(0,243,255,0.3)" stroke="#00f3ff" strokeWidth="1" />
                             )}

                             {/* Internal Tech Lines (Only visible on Starter/Hunter) */}
                             {config.outfit !== 'SHADOW' && (
                                <>
                                  <line x1="100" y1="65" x2="100" y2="180" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                                  <line x1="75" y1="100" x2="125" y2="100" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                                </>
                             )}
                        </svg>
                   </div>
               ))}

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
               <div className="bg-black/80 border border-neon-blue backdrop-blur p-4 flex flex-col gap-3 min-w-[300px]">
                  <div className="text-center text-neon-blue font-orbitron text-xs font-bold border-b border-gray-800 pb-2">AVATAR MODIFICATION</div>
                  
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
             {isEditing ? 'SAVE CHANGES' : 'CUSTOMIZE'}
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
           MODEL_RENDER_V4.3 // [ONLINE]
       </div>
    </div>
  );
};
