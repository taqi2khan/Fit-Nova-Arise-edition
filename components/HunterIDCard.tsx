import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface HunterIDCardProps {
  user: User;
}

export const HunterIDCard: React.FC<HunterIDCardProps> = ({ user }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineOpacity, setShineOpacity] = useState(0);
  const [shinePos, setShinePos] = useState({ x: 0, y: 0 });

  // Calculate XP progress
  const xpProgress = (user.xp / (user.level * 100)) * 100;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate values (max 10deg)
    const rotX = ((y - centerY) / centerY) * -10; 
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setShineOpacity(1);
    setShinePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setShineOpacity(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="w-full h-auto mb-6">
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-full aspect-[1.586/1] bg-gray-900 rounded-xl overflow-hidden shadow-2xl group select-none"
            style={{ 
                transformStyle: 'preserve-3d',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' 
            }}
        >
            {/* Background Texture - Metallic Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c20] via-[#0f1012] to-[#050505]" />
            
            {/* Holographic Rainbow Sheen (Static Pattern) */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-color-dodge" 
                style={{
                    background: 'linear-gradient(115deg, transparent 40%, rgba(0,255,255,0.5) 45%, rgba(255,0,255,0.5) 50%, rgba(255,255,0,0.5) 55%, transparent 60%)',
                    backgroundSize: '200% 200%'
                }}
            />

            {/* Dynamic Mouse Shine */}
            <div 
                className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay transition-opacity duration-300"
                style={{
                    opacity: shineOpacity,
                    background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                }}
            />

            {/* CARD CONTENT */}
            <div className="relative z-20 p-4 md:p-5 flex flex-col h-full justify-between font-sans text-gray-200">
                
                {/* TOP HEADER */}
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                    <div className="flex items-center gap-2">
                         {/* Logo / Seal */}
                         <div className="w-8 h-8 rounded-full border border-gray-500/50 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center shadow-inner">
                             <div className="text-[10px] font-black text-gray-300 font-orbitron">HA</div>
                         </div>
                         <div className="leading-tight">
                             <div className="text-[6px] text-gray-400 font-mono tracking-[0.2em] uppercase">International</div>
                             <div className="text-[10px] text-gray-200 font-orbitron font-bold tracking-wider text-shadow-sm">HUNTER LICENSE</div>
                         </div>
                    </div>
                    {/* Chip */}
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-600 to-yellow-300 border border-yellow-700 shadow-sm relative overflow-hidden hidden sm:block">
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiAvPgo8L3N2Zz4=')]"></div>
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-800/50"></div>
                        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-yellow-800/50"></div>
                    </div>
                </div>

                {/* MAIN BODY */}
                <div className="flex gap-4 mt-2 flex-grow items-center">
                    {/* Avatar Frame */}
                    <div className="relative w-20 h-24 bg-gray-800 rounded-sm border border-gray-600 overflow-hidden shadow-inner flex-shrink-0">
                         <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-end justify-center">
                              <svg className="w-16 h-16 text-gray-500 mb-[-5px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         
                         {/* Hologram Overlay on photo */}
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                    </div>

                    {/* Text Details */}
                    <div className="flex flex-col justify-between w-full h-full py-1">
                        <div>
                             <div className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5">Name</div>
                             <div className="text-sm font-bold text-white font-orbitron tracking-wide border-b border-gray-700/50 pb-1 mb-1">{user.name}</div>
                             
                             <div className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5">Title</div>
                             <div className="text-[9px] text-gray-300 font-mono truncate tracking-tight">{user.title}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <div>
                                <div className="text-[7px] text-gray-400 uppercase tracking-widest">Rank</div>
                                <div className={`text-lg font-black font-orbitron italic leading-none mt-0.5 ${user.rank.includes('S') || user.rank.includes('National') ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-neon-blue'}`}>
                                    {user.rank.includes('National') ? 'NAT' : user.rank.split('-')[0]}
                                </div>
                             </div>
                             <div>
                                <div className="text-[7px] text-gray-400 uppercase tracking-widest">Class</div>
                                <div className="text-[9px] font-bold text-neon-purple font-mono uppercase mt-1 leading-tight">
                                    {user.job_class.length > 10 ? user.job_class.substring(0, 10) + '...' : (user.job_class || 'NONE')}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM XP BAR & ID */}
                <div className="mt-auto pt-2">
                    <div className="flex justify-between items-end mb-1">
                         <div className="text-[8px] font-mono text-gray-400">ID: <span className="text-gray-200">{user.id}</span></div>
                         <div className="text-[8px] font-mono text-neon-blue">LVL.{user.level}</div>
                    </div>
                    {/* Custom XP Bar Look */}
                    <div className="w-full h-1 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50 relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                        />
                    </div>
                </div>

            </div>
        </motion.div>
    </div>
  );
};