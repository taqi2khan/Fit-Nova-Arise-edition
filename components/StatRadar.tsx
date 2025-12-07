import React from 'react';
import { motion } from 'framer-motion';
import { UserStats } from '../types';

interface StatRadarProps {
  stats: UserStats;
}

export const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  // Normalize stats for the chart (assuming max of 100 for visual scaling, though they can go higher)
  // We use a logarithmic scale or clamp to keep the chart readable if stats get huge
  const MAX_VAL = 150;
  
  const axes = [
    { label: "STR", value: stats.strength },
    { label: "AGI", value: stats.agility },
    { label: "END", value: stats.endurance },
    { label: "VIT", value: stats.vitality },
    { label: "INT", value: stats.intelligence },
    { label: "PER", value: stats.focus }, // Mapping Focus to Perception for classic RPG feel
  ];

  const angleStep = (Math.PI * 2) / axes.length;

  const points = axes.map((axis, i) => {
    const value = Math.min(axis.value, MAX_VAL) / MAX_VAL;
    const angle = i * angleStep - Math.PI / 2; // Start at top
    const r = value * 100; // Radius (0-100)
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(' ');

  const fullPoints = axes.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * 100;
    const y = Math.sin(angle) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-black/60 border border-neon-blue/30 backdrop-blur p-4 flex flex-col items-center justify-center relative aspect-square overflow-hidden">
        <div className="absolute top-2 left-2 text-[10px] text-neon-blue font-mono">BIO_METRICS_ANALYSIS</div>
        
        <svg viewBox="-120 -120 240 240" className="w-full h-full max-w-[200px] drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
            {/* Background Grid Circles */}
            <circle r="33" fill="none" stroke="#00f3ff" strokeOpacity="0.1" />
            <circle r="66" fill="none" stroke="#00f3ff" strokeOpacity="0.1" />
            <circle r="100" fill="none" stroke="#00f3ff" strokeOpacity="0.3" strokeDasharray="4 2" />

            {/* Axis Lines */}
            {axes.map((_, i) => {
                 const angle = i * angleStep - Math.PI / 2;
                 return (
                     <line 
                        key={i}
                        x1="0" y1="0"
                        x2={Math.cos(angle) * 100}
                        y2={Math.sin(angle) * 100}
                        stroke="#00f3ff"
                        strokeOpacity="0.2"
                     />
                 )
            })}

            {/* The Stat Polygon */}
            <motion.polygon 
                points={points}
                fill="rgba(0, 243, 255, 0.2)"
                stroke="#00f3ff"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, points: points }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Dots at vertices */}
            {axes.map((axis, i) => {
                const value = Math.min(axis.value, MAX_VAL) / MAX_VAL;
                const angle = i * angleStep - Math.PI / 2;
                const x = Math.cos(angle) * (value * 100);
                const y = Math.sin(angle) * (value * 100);
                return (
                    <motion.circle 
                        key={i}
                        cx={x} cy={y} r="2"
                        fill="#fff"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                    />
                )
            })}

            {/* Labels */}
            {axes.map((axis, i) => {
                 const angle = i * angleStep - Math.PI / 2;
                 // Push text out a bit
                 const x = Math.cos(angle) * 135; 
                 const y = Math.sin(angle) * 135;
                 return (
                     <text 
                        key={i}
                        x={x} y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#00f3ff"
                        className="text-[10px] font-mono font-bold"
                        style={{ fontSize: '12px' }}
                     >
                        {axis.label}
                     </text>
                 )
            })}
        </svg>
    </div>
  );
};