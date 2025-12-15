
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { generateHunterProfileImage } from '../services/geminiService';
import { AudioService } from '../services/audioService';
import { getRankShortLabel } from '../rankUtils';
import { HunterAvatar, getHunterAvatarTheme } from './HunterAvatar';
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
    AudioService.playClick();
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

  const avatarTheme = getHunterAvatarTheme(user.rank);
  const rankLabel = getRankShortLabel(user.rank);

  return (
    <>
    {/* SMALL CARD (CLICK TRIGGER) */}
    <div style={{ perspective: 1000 }} className="w-full h-auto mb-6 max-w-md mx-auto relative z-10">
        <motion.div
            ref={cardRef}
            onClick={handleOpenModal}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-full aspect-[1.586/1] bg-gray-900 rounded-xl overflow-hidden shadow-2xl group select-none cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-shadow duration-300"
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
                    <HunterAvatar
                      rank={user.rank}
                      imageSrc={profileImage}
                      className="w-20 h-24 flex-shrink-0"
                      roundedClassName="rounded-sm"
                    />

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
                                <div className={`text-lg font-black font-orbitron italic leading-none mt-0.5 ${avatarTheme.rankTextClass}`}>
                                    {rankLabel}
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

    {/* LARGE MODAL (POP-UP MODE) */}
    <SystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SystemWindow 
            title="HUNTER DOSSIER" 
            subtitle={`ID: ${user.id} // [SECURE ACCESS]`}
            footer={
                <div className="flex gap-4 px-4 w-full">
                    <SystemButton variant="secondary" onClick={() => setIsModalOpen(false)}>
                        CLOSE FILE
                    </SystemButton>
                    <SystemButton onClick={handleGeneratePhoto} disabled={isGenerating}>
                        {isGenerating ? 'BIOMETRIC SCANNING...' : 'GENERATE SNAPSHOT'}
                    </SystemButton>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* LEFT: LARGE PHOTO VISUALIZER */}
                <HunterAvatar
                  rank={user.rank}
                  imageSrc={profileImage}
                  className="w-full md:w-5/12 aspect-[3/4] group shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                  roundedClassName="rounded-sm"
                  showRankBadge={false}
                >
                  {!profileImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-gray-300">
                      <span className="text-5xl opacity-20 mb-2">?</span>
                      <span className="text-[9px] font-mono tracking-widest">NO BIOMETRIC DATA</span>
                    </div>
                  )}

                  {/* Scanning Overlay (Active) */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center">
                      <div className="w-full h-[2px] bg-neon-blue animate-scanline shadow-[0_0_15px_#00f3ff]" />
                      <div className="text-neon-blue font-mono text-xs animate-pulse mt-4">PROCESSING...</div>
                    </div>
                  )}

                  {/* Passive Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </HunterAvatar>

                {/* RIGHT: CONFIG & DETAILS */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="border-b border-gray-800 pb-2">
                        <h3 className="text-2xl text-white font-orbitron font-bold uppercase">{user.name}</h3>
                        <div className="text-neon-blue font-mono text-xs tracking-[0.2em]">{user.title}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 bg-white/5 p-4 rounded border border-white/10">
                        <div>RANK: <span className="text-white font-bold">{user.rank}</span></div>
                        <div>LEVEL: <span className="text-white font-bold">{user.level}</span></div>
                        <div>CLASS: <span className="text-white font-bold">{user.job_class}</span></div>
                        <div>POWER: <span className="text-white font-bold">{user.stats.power_index}</span></div>
                    </div>

                    <div className="mt-auto pt-4">
                        <SystemInput 
                            label="VISUAL TRAITS CONFIGURATION" 
                            placeholder="e.g. Glowing blue eyes, silver hair, tactical gear..." 
                            value={customAppearance}
                            onChange={(e) => setCustomAppearance(e.target.value)}
                            disabled={isGenerating}
                        />
                        <p className="text-[9px] text-gray-500 font-mono mt-[-10px] pl-1">
                            * System will synthesize ID photo based on these parameters + Rank data.
                        </p>
                    </div>
                </div>
            </div>
        </SystemWindow>
    </SystemModal>
    </>
  );
};
