
import React from 'react';
import { motion } from 'framer-motion';

interface ShadowExtractionProps {
  completedQuests: number;
}

export const ShadowExtraction: React.FC<ShadowExtractionProps> = ({ completedQuests }) => {
  // Determine Shadow Rank based on count
  let rank = "INFANTRY";
  let color = "text-gray-400";
  
  if (completedQuests > 50) { rank = "MARSHAL"; color = "text-neon-purple"; }
  else if (completedQuests > 20) { rank = "ELITE KNIGHT"; color = "text-purple-400"; }
  else if (completedQuests > 10) { rank = "KNIGHT"; color = "text-blue-400"; }
  else if (completedQuests > 0) { rank = "SOLDIER"; color = "text-gray-300"; }

  // Generate visual army grid
  const maxVisual = 24; // grid size
  const soldiers = Array.from({ length: maxVisual }, (_, i) => i < completedQuests);

  return (
    <div className="bg-black/80 border-y-2 border-neon-purple/50 p-4 relative overflow-hidden group min-h-[160px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-neon-purple/30 pb-2 mb-3 relative z-10">
        <div>
            <h3 className="text-neon-purple font-orbitron text-sm font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(188,19,254,0.8)]">
                SHADOW EXTRACTION
            </h3>
            <p className="text-[9px] text-gray-500 font-mono">ARMY STATUS</p>
        </div>
        <div className="text-right">
            <div className={`font-orbitron font-bold text-lg ${color} drop-shadow-[0_0_10px_currentColor]`}>
                {completedQuests}
            </div>
            <div className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                EXTRACTED
            </div>
        </div>
      </div>

      {/* The Army Grid */}
      <div className="grid grid-cols-8 gap-1 relative z-10 flex-grow content-start">
        {soldiers.map((isActive, i) => (
            <div key={i} className="flex items-center justify-center h-4">
                {isActive ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative group/soldier"
                    >
                        {/* Soldier Silhouette (Simple Head/Shoulders) */}
                        <div className="w-3 h-3 bg-neon-purple/20 rounded-t-sm clip-path-soldier relative overflow-hidden">
                             {/* Glowing Eyes */}
                             <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2 + Math.random(), repeat: Infinity }}
                                className="absolute top-[30%] left-[20%] w-[20%] h-[20%] bg-white rounded-full shadow-[0_0_2px_#fff]"
                             />
                             <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: 0.2 }}
                                className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-white rounded-full shadow-[0_0_2px_#fff]"
                             />
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-1 h-1 bg-gray-800 rounded-full" />
                )}
            </div>
        ))}
      </div>

      {/* Rank Display */}
      <div className="mt-auto pt-2 text-center relative z-10">
          <div className="text-[10px] text-gray-500 font-mono">CURRENT GRADE</div>
          <motion.div 
            key={rank}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-orbitron font-black text-xl italic tracking-tighter ${color} uppercase`}
          >
              {rank}
          </motion.div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/10 to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neon-purple/20 blur-[50px] rounded-full pointer-events-none" />
      
      {/* Smoke/Fog Effect */}
      <motion.div 
         className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"
         animate={{ x: [-20, 0, -20], y: [-10, 0, -10] }}
         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
