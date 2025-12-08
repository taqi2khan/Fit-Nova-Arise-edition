import React from 'react';
import { motion } from 'framer-motion';

export const SystemBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-neon-dark overflow-hidden pointer-events-none select-none">
      
      {/* --- LAYER 1: 3D GRID FLOOR --- */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--neon-blue) 1px, transparent 1px),
            linear-gradient(to bottom, var(--neon-blue) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(3)',
          transformOrigin: 'top center',
        }}
      />

      {/* --- LAYER: COMMAND CENTER OVERLAY --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Bracket */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-32 md:h-64 border-l-2 border-t-2 border-neon-blue/20 rounded-tl-3xl opacity-50" />
        <div className="absolute top-6 left-6 md:top-8 md:left-8 font-mono text-[8px] md:text-[10px] text-neon-blue/40 tracking-[0.2em]">
           CMD_CENTER_V4 // ONLINE
        </div>

        {/* Top Right Bracket */}
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 border-r-2 border-t-2 border-neon-blue/20 rounded-tr-3xl opacity-50" />
        
        {/* Bottom Left Bracket */}
        <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 border-l-2 border-b-2 border-neon-blue/20 rounded-bl-3xl opacity-50" />
        
        {/* Bottom Right Bracket */}
        <div className="absolute bottom-0 right-0 w-32 md:w-64 h-32 md:h-64 border-r-2 border-b-2 border-neon-blue/20 rounded-br-3xl opacity-50" />

        {/* Crosshairs */}
        <div className="absolute top-1/2 left-4 md:left-8 w-4 h-4 border border-neon-blue/30 flex items-center justify-center opacity-50">
            <div className="w-[1px] h-full bg-neon-blue/30" />
            <div className="h-[1px] w-full bg-neon-blue/30" />
        </div>
        <div className="absolute top-1/2 right-4 md:right-8 w-4 h-4 border border-neon-blue/30 flex items-center justify-center opacity-50">
            <div className="w-[1px] h-full bg-neon-blue/30" />
            <div className="h-[1px] w-full bg-neon-blue/30" />
        </div>
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 border border-neon-blue/30 flex items-center justify-center opacity-50">
             <div className="w-[1px] h-full bg-neon-blue/30" />
             <div className="h-[1px] w-full bg-neon-blue/30" />
        </div>

        {/* Tactical Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
                 backgroundImage: 'radial-gradient(circle, var(--neon-blue) 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }} 
        />
        <div className="absolute inset-4 md:inset-20 border border-neon-blue/5 rounded-3xl pointer-events-none" />
      </div>

      {/* --- LAYER 2: ROTATING HUD ELEMENTS (Central) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
         {/* Outer Ring */}
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[90vh] h-[90vh] rounded-full border border-neon-blue border-dashed shadow-[0_0_50px_rgba(var(--neon-blue-rgb),0.2)]"
         />
         {/* Middle Ring (Counter-rotate) */}
         <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[60vh] h-[60vh] rounded-full border-2 border-neon-blue border-dotted opacity-50"
         />
         {/* Inner Ring */}
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[30vh] h-[30vh] rounded-full border border-neon-blue opacity-80"
         />
         {/* Magic Square */}
         <motion.div 
            animate={{ rotate: 180 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-[20vh] h-[20vh] border border-neon-blue opacity-30"
         />
      </div>

      {/* --- LAYER 3: FLOATING DATA STREAMS --- */}
      {/* Left Column - System Checks */}
      <div className="absolute top-1/3 left-4 md:left-12 font-mono text-[8px] md:text-[10px] text-neon-blue/20 flex flex-col gap-2">
         {[...Array(12)].map((_, i) => (
             <motion.div key={`l-${i}`} 
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
             >
                {`> SYS_PROCESS_${i.toString().padStart(2, '0')} [ACTIVE]`}
             </motion.div>
         ))}
      </div>
      
      {/* Right Column - Hex Data */}
      <div className="absolute bottom-1/3 right-4 md:right-12 font-mono text-[8px] md:text-[10px] text-neon-blue/20 flex flex-col gap-2 text-right">
         {[...Array(12)].map((_, i) => (
             <motion.div key={`r-${i}`} 
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
             >
                {`0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0')} :: MEM_ADDR`}
             </motion.div>
         ))}
      </div>

      {/* --- LAYER 4: VIGNETTE & GRADIENTS --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-dark via-transparent to-neon-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-neon-dark via-transparent to-neon-dark" />

      {/* --- LAYER 5: PARTICLES --- */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 bg-neon-blue rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: typeof window !== 'undefined' ? window.innerHeight + 10 : 1000,
            opacity: 0 
          }}
          animate={{ 
            y: -100,
            opacity: [0, 0.8, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 10, 
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}

      {/* --- LAYER 6: SCANLINE & NOISE --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent h-[15%] w-full animate-scanline pointer-events-none" />
      
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
      />
      
      {/* Occasional Screen Flicker/Distortion */}
      <motion.div 
        className="absolute inset-0 bg-neon-blue/5 mix-blend-color-dodge pointer-events-none"
        animate={{ opacity: [0, 0.05, 0, 0, 0.02, 0] }}
        transition={{ duration: 4, times: [0, 0.1, 0.2, 0.8, 0.9, 1], repeat: Infinity, ease: "linear" }}
      />

    </div>
  );
};