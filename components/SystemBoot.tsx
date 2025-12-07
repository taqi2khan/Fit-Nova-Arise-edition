import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  "INITIALIZING SYSTEM CORE...",
  "CHECKING BIOMETRIC DATA...",
  "SYNCHRONIZING WITH HUNTER ID...",
  "LOADING ASSETS [TEXTURES_V4.0]...",
  "ESTABLISHING SERVER CONNECTION...",
  "CALIBRATING SENSORS...",
  "CHECKING QUEST DATABASE...",
  "SYSTEM INTEGRITY: 100%",
  "WELCOME, PLAYER."
];

interface SystemBootProps {
  onComplete: () => void;
}

export const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'LOGS' | 'LOGO' | 'ACCESS'>('LOGS');

  useEffect(() => {
    // Phase 1: Rapid Logs
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length - 1) {
        setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
        setProgress(prev => prev + 10);
      } else {
        clearInterval(logInterval);
        setPhase('LOGO');
      }
    }, 150);

    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (phase === 'LOGO') {
      // Phase 2: Logo Reveal & Final Loading
      const timer = setTimeout(() => {
         setProgress(100);
         setPhase('ACCESS');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
      if (phase === 'ACCESS') {
          // Phase 3: Short delay then unmount
          const timer = setTimeout(() => {
              onComplete();
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [phase, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden cursor-none"
      exit={{ 
          opacity: 0, 
          scale: 1.1, 
          filter: "blur(20px)",
          transition: { duration: 0.8, ease: "easeInOut" }
      }}
    >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

        <div className="relative z-10 w-full max-w-2xl px-8">
            <AnimatePresence mode='wait'>
                {phase === 'LOGS' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="font-mono text-neon-blue text-xs md:text-sm space-y-1 h-48 overflow-hidden flex flex-col justify-end border-l-2 border-neon-blue pl-4 bg-black/50 backdrop-blur-sm"
                    >
                        {logs.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <span className="mr-2 opacity-50">{`[${(Math.random()*100).toFixed(2)}ms]`}</span>
                                {log}
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {phase === 'LOGO' && (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="text-center"
                    >
                        <motion.h1 
                            animate={{ textShadow: ["0 0 10px #00f3ff", "0 0 30px #00f3ff", "0 0 10px #00f3ff"] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-6xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-blue"
                        >
                            FITNOVA
                        </motion.h1>
                        <div className="text-neon-blue font-mono tracking-[1em] mt-4 text-xs">SYSTEM REBOOT</div>
                    </motion.div>
                )}

                {phase === 'ACCESS' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <div className="text-green-500 font-bold font-orbitron text-2xl tracking-widest border border-green-500 px-8 py-4 bg-green-500/10">
                            ACCESS GRANTED
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="mt-12 w-full h-1 bg-gray-900 overflow-hidden relative">
                <motion.div 
                    className="h-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between mt-2 font-mono text-[10px] text-gray-500">
                <span>SYSTEM CHECK</span>
                <span>{progress}%</span>
            </div>
        </div>
    </motion.div>
  );
};