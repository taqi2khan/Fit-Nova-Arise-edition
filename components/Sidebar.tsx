
import React from 'react';
import { motion } from 'framer-motion';
import { AudioService } from '../services/audioService';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: '⚡', label: 'Home' },
    { id: 'quests', icon: '⚔', label: 'Quests' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'skills', icon: '💠', label: 'Skills' },
    { id: 'settings', icon: '⚙', label: 'System' },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-20 md:w-24 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 z-50">
      {/* Logo */}
      <div className="mb-12 w-10 h-10 bg-neon-blue rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)]">
        <span className="font-orbitron font-bold text-black text-xs">FN</span>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-8 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
                AudioService.playClick();
                onTabChange(item.id);
            }}
            onMouseEnter={() => AudioService.playHover()}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-white/10 text-neon-blue shadow-[inset_0_0_10px_rgba(0,243,255,0.1)]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-lg filter drop-shadow-sm">{item.icon}</span>
            
            {/* Active Indicator Dot */}
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute -right-[2px] w-1 h-1 bg-neon-blue rounded-full shadow-[0_0_5px_#00f3ff]"
              />
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-black border border-gray-800 rounded text-[10px] font-mono uppercase text-neon-blue opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* User / Bottom */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
             <div className="text-[8px]">ID</div>
        </div>
      </div>
    </div>
  );
};
