import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlitchOverlayProps {
  active: boolean;
  intensity?: 'low' | 'high';
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ active, intensity = 'low' }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-mono">
      
      {/* --- LEVEL 1: COLOR SHIFT (Chromatic Aberration) --- */}
      <motion.div 
        className="absolute inset-0 bg-transparent mix-blend-color-dodge opacity-30"
        animate={{ x: [-2, 2, -2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{ 
            textShadow: '2px 0 #ff0000, -2px 0 #0000ff',
            boxShadow: 'inset 0 0 20px rgba(255,0,0,0.2)'
        }}
      />

      {/* --- LEVEL 2: SCANLINE DISPLACEMENT --- */}
      <div className="absolute inset-0 w-full h-full bg-neon-dark/20 animate-glitch-1 glitch-layer" 
           style={{ backgroundColor: intensity === 'high' ? 'rgba(255,0,0,0.1)' : 'transparent' }}
      ></div>
      
      <div className="absolute inset-0 w-full h-full bg-neon-blue/10 animate-glitch-2 glitch-layer" 
           style={{ animationDirection: 'reverse' }}
      ></div>

      {/* --- LEVEL 3: WARNING TEXT (High Intensity Only) --- */}
      {intensity === 'high' && (
         <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 0.5, repeat: Infinity }}
               className="text-red-500 font-black font-orbitron text-4xl md:text-8xl tracking-widest text-center border-4 border-red-500 p-8 bg-black/80 backdrop-blur-sm transform rotate-[-5deg]"
            >
               CRITICAL ERROR
               <div className="text-xl md:text-3xl mt-4 font-mono">FATIGUE LEVELS CRITICAL</div>
               <div className="text-sm mt-2 font-mono text-red-300">SYSTEM FAILURE IMMINENT</div>
            </motion.div>
         </div>
      )}

      {/* --- LEVEL 4: STATIC NOISE --- */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};