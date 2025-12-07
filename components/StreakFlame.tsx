
import React from 'react';
import { motion } from 'framer-motion';

interface StreakFlameProps {
  streak: number;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({ streak }) => {
  // Scale intensity based on streak (cap at 30 days for max visual)
  const intensity = Math.min(streak, 30) / 30; 
  const scale = 0.8 + (intensity * 0.5); // Range 0.8 to 1.3
  
  // Color shift based on streak: Blue (System) -> Purple (Shadow) -> Gold (God)?
  // For now, let's stick to the System Blue with varying brightness
  
  return (
    <div className="relative w-full h-32 bg-black/40 border border-neon-blue/30 backdrop-blur overflow-hidden flex items-center justify-between px-6 group">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent" />
      
      {/* Text Info */}
      <div className="relative z-10">
          <div className="text-[10px] text-gray-400 font-mono uppercase mb-1">Consistency</div>
          <div className="text-3xl font-orbitron font-bold text-white flex items-baseline gap-2">
              {streak} <span className="text-sm font-normal text-neon-blue">DAYS</span>
          </div>
          <div className="text-[9px] text-neon-blue/70 font-mono mt-1">
              MULTIPLIER: x{(1 + (streak * 0.05)).toFixed(2)}
          </div>
      </div>

      {/* Flame Container */}
      <div className="relative w-20 h-24 flex items-end justify-center">
         <motion.div 
            className="absolute bottom-0 w-16 h-16 bg-neon-blue rounded-full blur-[20px] opacity-40 mix-blend-screen"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
         />
         
         {/* Main Flame Core */}
         <motion.div
           className="relative w-12 h-16"
           style={{ scale }}
         >
             {/* Creating a procedural flame using multiple oscillating blobs */}
             {[0, 1, 2].map((i) => (
                 <motion.div
                    key={i}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-400 rounded-full blur-md opacity-80 mix-blend-screen"
                    animate={{ 
                        y: [-10, -50 - (intensity * 20)], 
                        scale: [1, 0],
                        x: ['-50%', `${-50 + (Math.random() * 40 - 20)}%`]
                    }}
                    transition={{ 
                        duration: 1 + Math.random(), 
                        repeat: Infinity, 
                        ease: "easeOut",
                        delay: i * 0.3
                    }}
                 />
             ))}
             
             {/* Inner White Hot Core */}
             <motion.div 
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-8 bg-white rounded-full blur-sm"
                animate={{ height: [30, 45, 30] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
             />
         </motion.div>
      </div>
      
      {/* Spark Particles */}
      {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 right-[20%] w-[2px] h-[2px] bg-white rounded-full"
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
                y: -80, 
                opacity: [0, 1, 0],
                x: Math.random() * 40 - 20 
            }}
            transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity, 
                delay: Math.random() * 2 
            }}
          />
      ))}
    </div>
  );
};
