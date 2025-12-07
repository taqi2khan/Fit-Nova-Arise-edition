import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_LOGS = [
    "Checking biometrics...",
    "Heart rate: NORMAL",
    "Mana core stability: 98%",
    "Muscle density increasing...",
    "System synchronization complete.",
    "Scanning for external threats...",
    "Quest database updated.",
    "Connecting to Hunter Association network...",
    "Shadow extraction potential: DORMANT",
    "Fatigue accumulation: 12%",
    "Hydration levels: OPTIMAL",
    "Server connection established [Ping: 2ms]",
];

export const SystemLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Logs
    setLogs(MOCK_LOGS.slice(0, 4));

    const interval = setInterval(() => {
       const randomLog = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
       const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
       
       setLogs(prev => {
           const newLogs = [...prev, `[${timestamp}] ${randomLog}`];
           if (newLogs.length > 8) newLogs.shift();
           return newLogs;
       });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
      if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
  }, [logs]);

  return (
    <div className="h-full bg-black/80 border border-neon-blue/30 font-mono text-[10px] p-3 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        
        <div ref={containerRef} className="overflow-y-auto space-y-1 scrollbar-hide h-full">
            <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-green-500/80 truncate"
                    >
                        <span className="text-green-800 mr-2">{'>'}</span>
                        {log}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
};