import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

// --- WRAPPERS ---

interface SystemModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
          }}
        >
           {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SystemWindowProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  variant?: 'blue' | 'red';
  footer?: React.ReactNode;
}

export const SystemWindow: React.FC<SystemWindowProps> = ({ children, title, subtitle, className = "", variant = 'blue', footer }) => {
  const colorClass = variant === 'blue' ? 'border-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]';
  const textClass = variant === 'blue' ? 'text-neon-blue' : 'text-red-500';
  const glowClass = variant === 'blue' ? 'bg-neon-blue' : 'bg-red-500';

  return (
    <motion.div 
      initial={{ clipPath: "inset(50% 50% 50% 50%)", opacity: 0 }}
      animate={{ 
        clipPath: ["inset(50% 50% 50% 50%)", "inset(49.5% 0 49.5% 0)", "inset(0 0 0 0)"],
        opacity: [0, 1, 1]
      }}
      exit={{ clipPath: "inset(50% 50% 50% 50%)", opacity: 0 }}
      transition={{ 
        duration: 0.6, 
        times: [0, 0.4, 1],
        ease: "circOut" 
      }}
      className={`relative bg-black/90 backdrop-blur-xl border-y-2 ${colorClass} w-full max-w-lg mx-auto overflow-hidden ${className}`}
    >
        {/* Decor: Left/Right Vertical Lines */}
        <div className={`absolute top-0 bottom-0 left-0 w-[2px] ${glowClass} opacity-50`}></div>
        <div className={`absolute top-0 bottom-0 right-0 w-[2px] ${glowClass} opacity-50`}></div>

        {/* Header */}
        <div className="pt-8 pb-4 text-center relative z-10">
            <motion.h2 
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.1em', opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`text-3xl font-orbitron font-bold uppercase ${textClass} drop-shadow-[0_0_10px_currentColor]`}
            >
                {title}
            </motion.h2>
            {subtitle && (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-xs font-mono uppercase tracking-widest mt-2 ${variant === 'blue' ? 'text-cyan-200/70' : 'text-red-200/70'}`}
                >
                    {subtitle}
                </motion.p>
            )}
            {/* Divider Line */}
            <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className={`mt-4 mx-auto w-1/2 h-[1px] bg-gradient-to-r from-transparent via-${variant === 'blue' ? 'neon-blue' : 'red-500'} to-transparent`} 
            />
        </div>

        {/* Content */}
        <div className="px-8 py-6 relative z-10">
            {children}
        </div>

        {/* Footer / Decor */}
        <div className="pb-4 text-center">
            {footer}
            <div className="flex justify-between px-4 opacity-50 mt-4">
                <div className={`h-2 w-16 border-t border-l ${colorClass}`}></div>
                <div className={`h-2 w-16 border-t border-r ${colorClass}`}></div>
            </div>
        </div>
        
        {/* Animated Background Scan */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none animate-scanline" />
    </motion.div>
  );
};

// --- INPUTS ---

interface SystemInputProps extends HTMLMotionProps<"input"> {
  label: string;
  error?: string;
  success?: string;
}

export const SystemInput: React.FC<SystemInputProps> = ({ label, readOnly, error, success, ...props }) => {
  // Determine styling based on state
  let borderColor = "border-gray-700";
  let textColor = "text-white";

  if (error) {
    borderColor = "border-red-500";
    textColor = "text-red-100";
  } else if (success) {
    borderColor = "border-green-500";
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-neon-blue text-xs font-orbitron uppercase tracking-wider drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
            {label}
        </label>
        {/* Validation Message */}
        {(error || success) && (
            <span className={`text-[10px] font-mono font-bold uppercase ${error ? 'text-red-500' : 'text-green-500'}`}>
                {error || success}
            </span>
        )}
      </div>
      
      <div className={`relative group ${readOnly ? 'opacity-70' : ''}`}>
        <motion.input 
          {...props}
          readOnly={readOnly}
          initial={false}
          animate={{
             boxShadow: error 
               ? ["0 0 0px rgba(220,38,38,0)", "0 0 5px rgba(220,38,38,0.2)", "0 0 0px rgba(220,38,38,0)"]
               : ["0 0 0px rgba(0,243,255,0)", "0 0 5px rgba(0,243,255,0.15)", "0 0 0px rgba(0,243,255,0)"]
          }}
          transition={{
             duration: 3,
             repeat: Infinity,
             ease: "easeInOut"
          }}
          whileFocus={{
             boxShadow: error 
               ? "0 0 15px rgba(220,38,38,0.5)" 
               : "0 0 15px rgba(0,243,255,0.5)",
             borderColor: error ? "rgb(239,68,68)" : "rgb(0,243,255)",
             scale: 1.005
          }}
          className={`w-full bg-black/50 border ${borderColor} ${textColor} font-mono px-4 py-3 focus:outline-none transition-all rounded-none placeholder-gray-600
            ${readOnly 
                ? 'cursor-not-allowed text-gray-400 border-gray-800' 
                : ''
            }`}
        />
        {/* Corner Accents on Input */}
        {!readOnly && (
            <>
                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent transition-colors duration-300 ${error ? 'group-focus-within:border-red-500' : 'group-focus-within:border-neon-blue'}`} />
                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent transition-colors duration-300 ${error ? 'group-focus-within:border-red-500' : 'group-focus-within:border-neon-blue'}`} />
            </>
        )}
      </div>
    </div>
  );
};

// --- BUTTONS ---

interface SystemButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const SystemButton: React.FC<SystemButtonProps> = ({ children, variant = 'primary', className = "", disabled, ...props }) => {
  const variants = {
    primary: "bg-neon-blue/10 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]",
    secondary: "bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white",
    danger: "bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
  };

  const activeClass = disabled 
    ? "opacity-50 cursor-not-allowed bg-gray-800/20 border-gray-700 text-gray-500" 
    : variants[variant];

  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`w-full py-4 px-6 font-orbitron font-bold uppercase tracking-[0.15em] transition-all duration-300 ${activeClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};