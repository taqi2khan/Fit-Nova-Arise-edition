
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { generateHunterProfileImage } from '../services/geminiService';
import { SystemModal, SystemWindow, SystemInput, SystemButton } from './HoloUI';

interface HunterIDCardProps {
  user: User;
}

export const HunterIDCard: React.FC<HunterIDCardProps> = ({ user }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineOpacity, setShineOpacity] = useState(0);
  const [shinePos, setShinePos] = useState({ x: 0, y: 0 });
  
  // Image State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customAppearance, setCustomAppearance] = useState("");

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

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleGeneratePhoto = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const imgData = await generateHunterProfileImage(user, customAppearance);
    if (imgData) {
        setProfileImage(imgData);
    }
    setIsGenerating(false);
  };

  // --- RANK BASED VISUALS ---
  const getRankVisuals = (rank: string) => {
    const r = rank.toUpperCase();
    if (r.includes('NATIONAL') || r.includes('S')) {
        return {
            bg: "bg-gradient-to-b from-purple-900 to-black",
            eyes: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)]",
            aura: "shadow-[inset_0_0_20px_rgba(168,85,247,0.5)]",
            iconColor: "text-yellow-500",
            border: "border-yellow-500/50"
        };
    } else if (r.includes('A') || r.includes('B')) {
        return {
            bg: "bg-gradient-to-b from-blue-900 to-black",
            eyes: "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,1)]",
            aura: "shadow-[inset_0_0_15px_rgba(59,130,246,0.5)]",
            iconColor: "text-gray-200",
            border: "border-blue-400/50"
        };
    } else {
        return {
            bg: "bg-gradient-to-b from-gray-800 to-black",
            eyes: "text-gray-500",
            aura: "",
            iconColor: "text-gray-500",
            border: "border-gray-600"
        };
    }
  };

  const visuals = getRankVisuals(user.rank);

  return (
    <>
    <div style={{ perspective: 1000 }} className="w-full h-auto mb-6 max-w-md mx-auto relative z-10">
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
                    {/* Avatar Frame - Rank Based */}
                    <div className={`relative w-20 h-24 rounded-sm overflow-hidden shadow-inner flex-shrink-0 border ${visuals.border} ${visuals.aura} group/avatar`}>
                         {/* Photo or Placeholder */}
                         {profileImage ? (
                             <img src={profileImage} alt="Hunter Profile" className="w-full h-full object-cover" />
                         ) : (
                            <div className={`absolute inset-0 flex items-end justify-center ${visuals.bg}`}>
                                  {/* Simple Silhouette */}
                                  <svg className={`w-16 h-16 mb-[-5px] ${visuals.iconColor}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
                                  {/* Glowing Eyes Effect */}
                                  <div className="absolute top-[35%] left-[35%] w-[30%] h-[10%] flex justify-between px-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${visuals.eyes} animate-pulse`} />
                                      <div className={`w-1.5 h-1.5 rounded-full ${visuals.eyes} animate-pulse`} />
                                  </div>
                            </div>
                         )}

                         {/* AI Generate Button (Hover) */}
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                             <button 
                                onClick={handleOpenModal}
                                disabled={isGenerating}
                                className="text-[9px] font-mono text-white border border-white/50 px-1 py-0.5 hover:bg-white/20 uppercase"
                             >
                                {isGenerating ? 'SCANNING...' : '[UPDATE]'}
                             </button>
                         </div>
                         
                         {/* Scanline Overlay (While Generating) */}
                         {isGenerating && (
                            <div className="absolute inset-0 bg-neon-blue/20 animate-pulse z-10 flex items-center justify-center">
                                <div className="w-full h-[2px] bg-neon-blue animate-scanline" />
                            </div>
                         )}

                         {/* Hologram Overlay on photo */}
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
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

    {/* CUSTOMIZATION MODAL */}
    <SystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SystemWindow 
            title="HUNTER ID PROFILE" 
            subtitle="[BIOMETRIC DATA UPDATE]"
            footer={
                <div className="flex gap-4 px-4 w-full">
                    <SystemButton variant="secondary" onClick={() => setIsModalOpen(false)}>
                        {profileImage ? 'SAVE & CLOSE' : 'CANCEL'}
                    </SystemButton>
                    <SystemButton onClick={handleGeneratePhoto} disabled={isGenerating}>
                        {isGenerating ? 'GENERATING...' : (profileImage ? 'REGENERATE' : 'GENERATE PHOTO')}
                    </SystemButton>
                </div>
            }
        >
            <div className="space-y-6">
                {/* PREVIEW */}
                <div className="flex justify-center">
                    <div className={`w-32 h-40 bg-black border-2 ${visuals.border} relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900">
                                <span className="text-4xl opacity-20">?</span>
                                <span className="text-[8px] font-mono mt-2">NO DATA</span>
                            </div>
                        )}
                        
                        {/* Scanning Overlay */}
                        {isGenerating && (
                             <div className="absolute inset-0 bg-neon-blue/10 animate-pulse flex items-center justify-center">
                                 <div className="w-full h-[2px] bg-neon-blue animate-scanline shadow-[0_0_10px_#00f3ff]" />
                             </div>
                        )}
                    </div>
                </div>

                {/* CONTROLS */}
                <div>
                    <SystemInput 
                        label="APPEARANCE DETAILS" 
                        placeholder="e.g. Silver hair, glowing red eyes, black hoodie..." 
                        value={customAppearance}
                        onChange={(e) => setCustomAppearance(e.target.value)}
                        disabled={isGenerating}
                    />
                    <p className="text-[10px] text-gray-500 font-mono mt-[-10px]">
                        * Leave blank to let the System decide based on your Rank & Class.
                    </p>
                </div>

                <div className="bg-white/5 p-3 border border-white/10 rounded">
                    <h4 className="text-neon-blue font-orbitron text-xs mb-2">CURRENT METADATA</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                        <div>NAME: <span className="text-white">{user.name}</span></div>
                        <div>RANK: <span className="text-white">{user.rank}</span></div>
                        <div>CLASS: <span className="text-white">{user.job_class}</span></div>
                        <div>LEVEL: <span className="text-white">{user.level}</span></div>
                    </div>
                </div>
            </div>
        </SystemWindow>
    </SystemModal>
    </>
  );
};
