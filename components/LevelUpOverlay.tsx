import React from 'react';
import { motion } from 'framer-motion';

interface LevelUpOverlayProps {
  level: number;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ level }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden">
      
      {/* 1. Flash Overlay (Brief white flash) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.5, times: [0, 0.1, 1] }}
        className="absolute inset-0 bg-white mix-blend-overlay"
      />

      {/* 2. Vertical Pillar of Light */}
      <motion.div 
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-xl"
      />
      
      {/* 3. Central Burst Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 2], opacity: [1, 0.5, 0], rotate: 45 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] border-2 border-neon-blue rounded-full opacity-0"
      />
      
      {/* 4. Rising Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full blur-[1px]"
          initial={{ 
            x: (Math.random() - 0.5) * 400, 
            y: 200, 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            y: -300, 
            opacity: [0, 1, 0],
            scale: [0, 1, 0] 
          }}
          transition={{ 
            duration: 1.5 + Math.random(), 
            ease: "easeOut",
            delay: Math.random() * 0.5 
          }}
        />
      ))}

      {/* 5. Main Text Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* "LEVEL UP" Text */}
        <motion.h1
          initial={{ y: 50, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-6xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] tracking-tighter italic"
        >
          LEVEL UP!
        </motion.h1>

        {/* Level Number */}
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mt-2"
        >
             <div className="h-[2px] w-12 bg-neon-blue shadow-[0_0_10px_#00f3ff]" />
             <div className="text-4xl md:text-5xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                {level}
             </div>
             <div className="h-[2px] w-12 bg-neon-blue shadow-[0_0_10px_#00f3ff]" />
        </motion.div>

        {/* Subtext */}
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 text-neon-blue font-mono text-sm tracking-[0.5em] uppercase bg-black/60 px-4 py-1 border border-neon-blue/30 backdrop-blur-md"
        >
            Stats Increased
        </motion.p>

      </div>
    </div>
  );
};