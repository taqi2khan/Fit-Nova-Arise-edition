import React from 'react';
import { motion } from 'framer-motion';
import { Rank } from '../types';
import { getRankKey, getRankShortLabel, RankKey } from '../rankUtils';

interface HunterAvatarTheme {
  primaryRgb: string;
  secondaryRgb?: string;
  borderClass: string;
  bgClass: string;
  iconClass: string;
  rankTextClass: string;
  auraIntensity: number; // 0..1
}

export const getHunterAvatarTheme = (rank: Rank | string): HunterAvatarTheme => {
  const key = getRankKey(rank);

  const themes: Record<RankKey, HunterAvatarTheme> = {
    E: {
      primaryRgb: '107,114,128',
      borderClass: 'border-gray-700/70',
      bgClass: 'bg-gradient-to-b from-gray-900 to-black',
      iconClass: 'text-gray-500',
      rankTextClass: 'text-gray-300',
      auraIntensity: 0.1
    },
    D: {
      primaryRgb: '34,197,94',
      borderClass: 'border-green-500/30',
      bgClass: 'bg-gradient-to-b from-green-950 to-black',
      iconClass: 'text-green-300',
      rankTextClass: 'text-green-300 drop-shadow-[0_0_6px_rgba(34,197,94,0.55)]',
      auraIntensity: 0.18
    },
    C: {
      primaryRgb: '0,243,255',
      borderClass: 'border-cyan-400/40',
      bgClass: 'bg-gradient-to-b from-cyan-950 to-black',
      iconClass: 'text-cyan-200',
      rankTextClass: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]',
      auraIntensity: 0.24
    },
    B: {
      primaryRgb: '59,130,246',
      borderClass: 'border-blue-400/45',
      bgClass: 'bg-gradient-to-b from-blue-950 to-black',
      iconClass: 'text-blue-200',
      rankTextClass: 'text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.65)]',
      auraIntensity: 0.32
    },
    A: {
      primaryRgb: '168,85,247',
      borderClass: 'border-purple-400/50',
      bgClass: 'bg-gradient-to-b from-purple-950 to-black',
      iconClass: 'text-purple-200',
      rankTextClass: 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      auraIntensity: 0.42
    },
    S: {
      primaryRgb: '250,204,21',
      borderClass: 'border-yellow-500/50',
      bgClass: 'bg-gradient-to-b from-amber-950 to-black',
      iconClass: 'text-yellow-200',
      rankTextClass: 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]',
      auraIntensity: 0.58
    },
    NATIONAL: {
      primaryRgb: '250,204,21',
      secondaryRgb: '244,63,94',
      borderClass: 'border-yellow-400/60',
      bgClass: 'bg-gradient-to-b from-rose-950 via-black to-black',
      iconClass: 'text-yellow-100',
      rankTextClass: 'text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,1)]',
      auraIntensity: 0.7
    }
  };

  return themes[key];
};

export interface CreateHunterAvatarParams {
  rank: Rank | string;
  imageSrc?: string | null;
  className?: string;
  roundedClassName?: string;
  showAura?: boolean;
  showNoise?: boolean;
  showRankBadge?: boolean;
  children?: React.ReactNode;
}

export const createHunterAvatar = ({
  rank,
  imageSrc,
  className,
  roundedClassName = 'rounded-sm',
  showAura = true,
  showNoise = true,
  showRankBadge = false,
  children
}: CreateHunterAvatarParams) => {
  const theme = getHunterAvatarTheme(rank);
  const label = getRankShortLabel(rank);

  const secondary = theme.secondaryRgb ?? theme.primaryRgb;

  const auraBg = `radial-gradient(circle at 50% 35%, rgba(${theme.primaryRgb}, ${0.65 * theme.auraIntensity}) 0%, rgba(${secondary}, ${0.22 * theme.auraIntensity}) 35%, rgba(${secondary}, 0) 70%)`;
  const auraRing = `conic-gradient(from 180deg, rgba(${theme.primaryRgb},0) 0deg, rgba(${theme.primaryRgb}, ${0.6 * theme.auraIntensity}) 80deg, rgba(${secondary},0) 160deg, rgba(${secondary}, ${0.35 * theme.auraIntensity}) 260deg, rgba(${theme.primaryRgb},0) 360deg)`;

  const innerGlow = `inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 22px rgba(${theme.primaryRgb}, ${0.35 * theme.auraIntensity}), 0 10px 25px rgba(0,0,0,0.55)`;

  return (
    <div className={`relative ${className || ''}`}>
      {showAura && (
        <>
          <div
            className={`absolute -inset-4 ${roundedClassName} blur-2xl pointer-events-none`}
            style={{ background: auraBg, opacity: 1 }}
          />
          <motion.div
            className={`absolute -inset-2 ${roundedClassName} blur-xl pointer-events-none mix-blend-screen`}
            style={{ background: auraRing, opacity: 0.9 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      <div
        className={`relative w-full h-full overflow-hidden ${roundedClassName} border ${theme.borderClass} bg-black shadow-inner`}
        style={{ boxShadow: innerGlow }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Hunter Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 flex items-end justify-center ${theme.bgClass}`}>
            <svg className={`w-16 h-16 mb-[-5px] ${theme.iconClass}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>

            {showAura && (
              <div className="absolute top-[35%] left-[35%] w-[30%] h-[10%] flex justify-between px-1">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: `rgba(${theme.primaryRgb}, ${0.95 * theme.auraIntensity + 0.05})`,
                    boxShadow: `0 0 10px rgba(${theme.primaryRgb}, ${0.85 * theme.auraIntensity + 0.1})`
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: `rgba(${theme.primaryRgb}, ${0.95 * theme.auraIntensity + 0.05})`,
                    boxShadow: `0 0 10px rgba(${theme.primaryRgb}, ${0.85 * theme.auraIntensity + 0.1})`
                  }}
                />
              </div>
            )}
          </div>
        )}

        {showAura && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 18px rgba(${theme.primaryRgb}, ${0.45 * theme.auraIntensity})`
            }}
          />
        )}

        {showRankBadge && (
          <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 border border-white/10 rounded">
            <span className={`text-[9px] font-orbitron font-black ${theme.rankTextClass}`}>{label}</span>
          </div>
        )}

        {showNoise && (
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
        )}

        {children}
      </div>
    </div>
  );
};

export const HunterAvatar: React.FC<CreateHunterAvatarParams> = (props) => createHunterAvatar(props);
