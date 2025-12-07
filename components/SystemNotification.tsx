import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemNotificationData } from '../types';

interface SystemNotificationProps {
  notification: SystemNotificationData | null;
  onClear: () => void;
}

export const SystemNotification: React.FC<SystemNotificationProps> = ({ notification, onClear }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClear, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClear]);

  // Special "Boss Bar" render for Login Failures / System Alerts
  // Recreating the "Blue Venom-Fanged Kasaka" style bar
  if (notification?.type === 'SYSTEM_ALERT') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="fixed top-[20%] left-0 right-0 z-[100] flex justify-center pointer-events-none"
        >
          {/* Geometric Container */}
          <div className="relative w-full max-w-4xl h-28 mx-4 flex items-center justify-center">
            
            {/* The Blue Geometric Shape Background */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#002a4d]/95 to-transparent border-y border-neon-blue/60"
              style={{
                clipPath: "polygon(0 45%, 15% 0, 85% 0, 100% 45%, 100% 55%, 85% 100%, 15% 100%, 0 55%)" 
              }}
            >
              <div className="absolute inset-0 bg-neon-blue/5 animate-pulse" />
              {/* Internal decorative lines */}
              <div className="absolute top-[10%] left-[20%] right-[20%] h-[1px] bg-neon-blue/20" />
              <div className="absolute bottom-[10%] left-[20%] right-[20%] h-[1px] bg-neon-blue/20" />
            </div>

            {/* Side Tech Accents (The floating bits on left/right of the boss bar) */}
            <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-20 h-1 bg-neon-blue/40" style={{ transform: "skew(-45deg)" }}></div>
            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-20 h-1 bg-neon-blue/40" style={{ transform: "skew(45deg)" }}></div>

            {/* Inner Content - Glowing Orange Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-[#ff9100] font-orbitron font-bold text-xl md:text-3xl uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,145,0,0.9)]"
                 style={{ textShadow: "0 0 20px #ff6600" }}
              >
                {notification.title}
              </motion.div>
              
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="text-[#ffab40] font-mono text-sm md:text-base uppercase tracking-widest mt-2 font-bold"
              >
                {notification.message}
              </motion.div>
            </div>
            
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Standard Notification Render (Blue/System)
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 50, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
        >
          <div className="relative bg-black/90 border-y-2 border-neon-blue min-w-[300px] max-w-lg w-full mx-4 shadow-[0_0_30px_rgba(0,243,255,0.4)] backdrop-blur-md overflow-hidden">
            {/* Inner Content */}
            <div className="flex items-center p-6 gap-6">
               {/* Icon */}
               <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 border-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                    <span className="font-orbitron font-bold text-2xl text-neon-blue">!</span>
                  </div>
               </div>
               
               {/* Text */}
               <div className="flex-grow">
                  <h3 className="text-neon-blue font-orbitron text-lg font-bold tracking-widest uppercase border-b border-neon-blue/30 pb-1 mb-2">
                    {notification.title}
                  </h3>
                  <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-line">
                     {notification.message}
                  </p>
               </div>
            </div>

            {/* Decor Lines */}
            <div className="absolute top-0 left-0 h-4 w-[2px] bg-neon-blue" />
            <div className="absolute top-0 right-0 h-4 w-[2px] bg-neon-blue" />
            <div className="absolute bottom-0 left-0 h-4 w-[2px] bg-neon-blue" />
            <div className="absolute bottom-0 right-0 h-4 w-[2px] bg-neon-blue" />

            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};