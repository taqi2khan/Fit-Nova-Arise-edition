import React, { useState, useEffect } from 'react';

export const PenaltyTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-red-900/20 border border-red-500 p-4 mb-4 relative overflow-hidden animate-pulse-fast group">
        <div className="flex justify-between items-center relative z-10">
            <div>
                <h3 className="text-red-500 font-orbitron font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">PENALTY ZONE</h3>
                <p className="text-[10px] text-red-300 font-mono">SURVIVE UNTIL COMPLETION</p>
            </div>
            <div className="text-2xl font-mono font-bold text-red-500 tabular-nums drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                {formatTime(timeLeft)}
            </div>
        </div>
        
        {/* Background Grain/Static Effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        {/* Sliding Warning Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-full animate-[scanline_2s_linear_infinite]" />
    </div>
  );
};