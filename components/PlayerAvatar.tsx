
import React from 'react';
import { motion } from 'framer-motion';

export const PlayerAvatar: React.FC = () => {
  // Simplified SVG paths for a mannequin/humanoid figure
  const bodyPath = "M100,30 C115,30 125,40 125,55 L125,65 C145,65 160,75 160,100 L160,180 C160,190 150,200 130,200 L130,300 C130,310 120,320 110,320 L90,320 C80,320 70,310 70,300 L70,200 C50,200 40,190 40,180 L40,100 C40,75 55,65 75,65 L75,55 C75,40 85,30 100,30 Z";
  
  const headPath = "M100,10 C115,10 125,20 125,35 C125,50 115,60 100,60 C85,60 75,50 75,35 C75,20 85,10 100,10 Z";

  const equipmentSlots = [
      { id: 'head', label: 'HEAD', x: 50, y: 10, item: 'NONE' },
      { id: 'chest', label: 'BODY', x: 80, y: 40, item: 'Basic Tee' },
      { id: 'main', label: 'MAIN HAND', x: 20, y: 50, item: 'Iron Fists' },
      { id: 'feet', label: 'BOOTS', x: 50, y: 90, item: 'Running Shoes' },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden bg-black/40 border border-neon-blue/20 backdrop-blur-sm group">
       
       {/* Background Grid for 3D effect */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [perspective:500px]" />

       <div className="relative w-[200px] h-[350px] [perspective:1000px]">
           {/* Rotating Container */}
           <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
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
                             <path d={bodyPath} fill="none" stroke="#00f3ff" strokeWidth="1" className="animate-pulse" />
                             <path d={headPath} fill="rgba(0, 243, 255, 0.1)" stroke="#00f3ff" strokeWidth="1" />
                             {/* Internal Tech Lines */}
                             <line x1="100" y1="65" x2="100" y2="200" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                             <line x1="75" y1="100" x2="125" y2="100" stroke="#00f3ff" strokeWidth="0.5" strokeDasharray="4 2" />
                        </svg>
                   </div>
               ))}

               {/* Central Core Glow */}
               <div className="absolute top-[100px] left-[95px] w-[10px] h-[10px] bg-neon-blue rounded-full shadow-[0_0_20px_#00f3ff]" />
           </motion.div>

           {/* Floor Disc */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[180px] border border-neon-blue rounded-full [transform:rotateX(70deg)_translateZ(-50px)] opacity-30 animate-[spin_10s_linear_infinite]" />
       </div>

       {/* Floating Equipment Slots (Static UI Overlay) */}
       {equipmentSlots.map((slot, i) => (
           <motion.div 
             key={slot.id}
             initial={{ opacity: 0, x: slot.x > 50 ? 20 : -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.2 }}
             className="absolute"
             style={{ top: `${slot.y}%`, left: `${slot.x}%`, transform: 'translate(-50%, -50%)' }}
           >
               {/* Line Connector */}
               <div className={`absolute top-1/2 w-16 h-[1px] bg-neon-blue/40 ${slot.x > 50 ? 'right-full' : 'left-full'}`} />
               
               <div className={`flex flex-col ${slot.x > 50 ? 'items-start pl-20' : 'items-end pr-20'}`}>
                   <span className="text-[10px] text-neon-blue font-mono border border-neon-blue/30 px-1 bg-black/80">{slot.label}</span>
                   <span className="text-xs text-white font-orbitron mt-0.5">{slot.item}</span>
               </div>
           </motion.div>
       ))}

       {/* Scanning Beam */}
       <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-neon-blue/50 shadow-[0_0_20px_#00f3ff] z-10 pointer-events-none"
       />
       
       <div className="absolute bottom-2 left-4 text-[10px] text-neon-blue/50 font-mono">
           MODEL_RENDER_V4.2 // [ONLINE]
       </div>
    </div>
  );
};
