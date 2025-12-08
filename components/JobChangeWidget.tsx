import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobChangeWidgetProps {
  currentLevel: number;
  targetLevel?: number;
  jobClass: string;
  onPromote: () => void;
}

export const JobChangeWidget: React.FC<JobChangeWidgetProps> = ({ 
  currentLevel, 
  targetLevel = 40, 
  jobClass,
  onPromote 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isReady = currentLevel >= targetLevel;
  const progress = Math.min((currentLevel / targetLevel) * 100, 100);
  const isCompleted = jobClass !== 'None';

  const handlePromote = () => {
    setIsProcessing(true);
    // Simulate dramatic system delay
    setTimeout(() => {
        onPromote();
        setIsProcessing(false);
    }, 2000);
  };

  // If already promoted, maybe show a badge or nothing
  if (isCompleted) {
    return (
        <div className="mb-6 p-4 border border-neon-purple bg-purple-900/10 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <div className="text-[10px] text-neon-purple font-mono uppercase tracking-widest">CURRENT CLASS</div>
                    <div className="text-2xl font-orbitron font-bold text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        {jobClass}
                    </div>
                </div>
                <div className="text-4xl">👑</div>
            </div>
            {/* Ambient Purple Glow */}
            <div className="absolute inset-0 bg-neon-purple/5 animate-pulse" />
        </div>
    );
  }

  return (
    <div className="mb-6 relative">
      {/* Background Container */}
      <div className={`p-5 border-2 transition-all duration-500 overflow-hidden relative ${isReady ? 'border-neon-purple bg-black/80' : 'border-gray-800 bg-black/60'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <h3 className={`font-orbitron font-bold text-sm tracking-widest uppercase ${isReady ? 'text-neon-purple animate-pulse' : 'text-gray-400'}`}>
                    JOB CHANGE QUEST
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                    {isReady ? "STATUS: QUALIFIED FOR ADVANCEMENT" : "STATUS: INSUFFICIENT LEVEL"}
                </p>
            </div>
            <div className="font-mono text-xs">
                <span className={isReady ? "text-neon-purple font-bold" : "text-gray-500"}>LVL {currentLevel}</span>
                <span className="text-gray-600"> / {targetLevel}</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-900 w-full mb-4 overflow-hidden">
            <motion.div 
                className={`absolute top-0 left-0 h-full ${isReady ? 'bg-neon-purple shadow-[0_0_10px_#a855f7]' : 'bg-gray-700'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Glitch lines on bar */}
            {isReady && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay animate-scanline" />}
        </div>

        {/* Interaction Area */}
        <AnimatePresence>
            {isReady ? (
                <motion.button
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePromote}
                    disabled={isProcessing}
                    className="w-full py-3 bg-neon-purple/20 border border-neon-purple text-neon-purple font-orbitron font-bold uppercase tracking-[0.2em] hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] relative overflow-hidden"
                >
                    {isProcessing ? (
                        <span className="animate-pulse">PROCESSING...</span>
                    ) : (
                        <>
                            <span className="relative z-10">ACCEPT CLASS: SHADOW MONARCH</span>
                            <div className="absolute inset-0 bg-neon-purple/20 animate-pulse" />
                        </>
                    )}
                </motion.button>
            ) : (
                <div className="text-center py-2">
                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                        [LOCKED] REACH LEVEL {targetLevel} TO UNLOCK HIDDEN CLASS
                    </p>
                </div>
            )}
        </AnimatePresence>

        {/* Background Effects */}
        {isReady && (
            <>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-transparent pointer-events-none" />
                <motion.div 
                    className="absolute inset-0 bg-neon-purple/5 mix-blend-overlay"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </>
        )}
      </div>
    </div>
  );
};