
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SystemBackground } from './components/SystemBackground';
import { SystemModal, SystemWindow, SystemInput, SystemButton } from './components/HoloUI';
import { StatsGrid } from './components/StatsGrid';
import { SystemNotification } from './components/SystemNotification';
import { QuestCard } from './components/QuestCard';
import { User, Quest, SystemNotificationData, UserStats, Rank, SystemState, AuthContextType } from './types';
import { MOCK_USER, MOCK_QUESTS, INITIAL_STATS } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSystemMessage, generateQuest } from './services/geminiService';
import { StatRadar } from './components/StatRadar';
import { SystemLog } from './components/SystemLog';
import { PlayerAvatar } from './components/PlayerAvatar';
import { GlitchOverlay } from './components/GlitchOverlay';
import { ParticleCursor } from './components/ParticleCursor';
import { SystemBoot } from './components/SystemBoot';
import { SkillLibrary } from './components/SkillLibrary';
import { StreakFlame } from './components/StreakFlame';
import { ShadowExtraction } from './components/ShadowExtraction';
import { PenaltyTimer } from './components/PenaltyTimer';
import { SleepVisualizer } from './components/SleepVisualizer';
import { WorkoutHeatmap } from './components/WorkoutHeatmap';
import { JobChangeWidget } from './components/JobChangeWidget';
import { HunterIDCard } from './components/HunterIDCard';
import { LevelUpOverlay } from './components/LevelUpOverlay';

// --- MOCK DATABASE FOR ID CHECKING ---
const MOCK_EXISTING_IDS = [
  'SHADOW#01', 
  'ADMIN!00', 
  'TEST#12', 
  'JINWOO#99'
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>(MOCK_QUESTS);
  const [notification, setNotification] = useState<SystemNotificationData | null>(null);
  const [theme, setTheme] = useState<'SYSTEM' | 'SHADOW' | 'RULER'>('SYSTEM');
  
  // Visual state for level up animation
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Temporary storage for the newly registered user in this session
  const [sessionUser, setSessionUser] = useState<{name: string, email: string, id: string, pass: string} | null>(null);

  // Apply Theme Class to Body
  useEffect(() => {
    document.body.classList.remove('theme-shadow', 'theme-ruler');
    if (theme === 'SHADOW') document.body.classList.add('theme-shadow');
    if (theme === 'RULER') document.body.classList.add('theme-ruler');
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'SYSTEM') setTheme('SHADOW');
    else if (theme === 'SHADOW') setTheme('RULER');
    else setTheme('SYSTEM');
  };

  const notify = (title: string, message: string, type: SystemNotificationData['type'] = 'INFO') => {
    const id = Date.now().toString();
    setNotification({ id, title, message, type });
  };

  const clearNotification = () => setNotification(null);

  const register = (name: string, email: string, id: string, pass: string) => {
    setSessionUser({ name, email, id, pass });
  };

  const login = (identifier?: string, password?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulation delay
      setTimeout(() => {
        if (!identifier || !password) {
             notify("MISSING DATA", "Enter Hunter ID/Email and Password.", "WARNING");
             resolve(false);
             return;
        }

        const cleanIdentifier = identifier.trim();
        const lowerIdentifier = cleanIdentifier.toLowerCase();
        
        // --- 1. CHECK MOCK USER ---
        const mockEmail = (MOCK_USER.email || '').toLowerCase(); 
        const mockId = MOCK_USER.id.toLowerCase();
        const mockAlias = 'jinwoo#99';
        
        // Mock User Match Logic (Case-insensitive email, Case-insensitive ID)
        const isMockMatch = 
            (mockEmail && lowerIdentifier === mockEmail) ||
            lowerIdentifier === mockId ||
            lowerIdentifier === mockAlias;
        
        if (isMockMatch && password === "password") {
          setUser(MOCK_USER);
          notify("SYSTEM ACCESS GRANTED", "Welcome back, Player.\nSystem initialization complete.", "INFO");
          resolve(true);
          return;
        }

        // --- 2. CHECK SESSION REGISTERED USER ---
        if (sessionUser) {
           const sessionEmail = (sessionUser.email || '').toLowerCase();
           const sessionId = sessionUser.id.toLowerCase();

           // Check email if it exists (Case-insensitive)
           const isEmailMatch = sessionEmail && lowerIdentifier === sessionEmail;
           // Check ID (Case-insensitive to be user friendly)
           const isIdMatch = lowerIdentifier === sessionId;

           if ((isEmailMatch || isIdMatch) && password === sessionUser.pass) {
             // Initialize a FRESH user (Level 1)
             const newUser: User = {
                id: sessionUser.id, // Use stored ID with correct casing
                name: sessionUser.name,
                email: sessionUser.email,
                xp: 0,
                level: 1,
                rank: Rank.E,
                system_state: SystemState.NORMAL,
                stats: INITIAL_STATS,
                title: "The Awakened",
                daily_streak: 1,
                job_class: 'None'
             };
             
             setUser(newUser);
             notify("SYSTEM INITIALIZATION", `Welcome, Hunter ${sessionUser.name}.\nStarting Stats Assigned.`, "INFO");
             resolve(true);
             return;
           }
        }

        // --- 3. FAILURE ---
        notify("UNKNOWN HUNTER DETECTED", "FAILED TO LOGIN.\nINVALID CREDENTIALS.", "SYSTEM_ALERT");
        resolve(false);

      }, 1500);
    });
  };

  const logout = () => {
      setUser(null);
      setTheme('SYSTEM'); // Reset theme on logout
      notify("SYSTEM LOGOUT", "Goodbye, Hunter.", "INFO");
  };

  const addQuest = (quest: Quest) => {
    setQuests(prev => [quest, ...prev]);
  };

  // Updates the progress of a specific objective in a quest
  const updateQuestProgress = (questId: string, objectiveIndex: number, newCurrent: number) => {
    setQuests(prevQuests => prevQuests.map(q => {
      if (q.id !== questId) return q;
      
      const newObjectives = [...q.objectives];
      if (newObjectives[objectiveIndex]) {
        // Clamp value between 0 and total
        const total = newObjectives[objectiveIndex].total;
        const clampedVal = Math.max(0, Math.min(newCurrent, total));
        
        newObjectives[objectiveIndex] = {
          ...newObjectives[objectiveIndex],
          current: clampedVal
        };
      }
      return { ...q, objectives: newObjectives };
    }));
  };

  const completeQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    // Double check all objectives are met before allowing completion logic
    const allObjectivesMet = quest.objectives.every(obj => obj.current >= obj.total);
    if (!allObjectivesMet) {
        notify("REQUIREMENTS NOT MET", "Complete all objectives first.", "WARNING");
        return;
    }

    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
    
    if (user && !quest.completed) {
        // 1. Calculate New Stats
        const newStats = { ...user.stats };
        let rewardsLog = "";
        
        if (quest.statRewards) {
            (Object.keys(quest.statRewards) as Array<keyof UserStats>).forEach((key) => {
                const rewardValue = quest.statRewards[key];
                if (rewardValue) {
                    newStats[key] = (newStats[key] || 0) + rewardValue;
                    rewardsLog += `${key.toUpperCase().replace('_', ' ')} +${rewardValue}  `;
                }
            });
        }

        // 2. Calculate New XP
        const xpGain = quest.xpReward;
        const totalXp = user.xp + xpGain;
        const currentLevelThreshold = user.level * 100;

        // 3. Update User State (XP + Stats)
        setUser(prev => {
            if (!prev) return null;
            return {
                ...prev,
                stats: newStats,
                xp: totalXp
            };
        });
        
        // 4. Trigger stylized notification
        setTimeout(() => {
                notify(
                    "QUEST COMPLETED", 
                    `[${quest.title}]\nXP +${xpGain}\n${rewardsLog.trim()}`, 
                    "QUEST_COMPLETE"
                );
        }, 500);
        
        // 5. Check level up
        if (totalXp >= currentLevelThreshold) {
            // Trigger Visual Animation
            setTimeout(() => {
                setShowLevelUp(true);
                // Hide animation after 3.5s
                setTimeout(() => setShowLevelUp(false), 3500);
            }, 1000);

            // Update Logic
            setTimeout(() => {
                notify("LEVEL UP!", `You have reached Level ${user.level + 1}!`, "LEVEL_UP");
                
                setUser(prev => {
                    if (!prev) return null;
                    const overflowXp = prev.xp - (prev.level * 100);
                    return {
                        ...prev,
                        level: prev.level + 1,
                        xp: Math.max(0, overflowXp)
                    };
                });
            }, 2500);
        }
    }
  };

  const updateStat = (stat: keyof UserStats, value: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: (prev.stats[stat] || 0) + value
        }
      };
    });
  };

  // JOB PROMOTION LOGIC
  const promoteJob = () => {
    if (user && user.level >= 40) {
      setUser(prev => prev ? { ...prev, job_class: 'Shadow Monarch', title: 'The One Who Arises' } : null);
      setTheme('SHADOW');
      notify("JOB CHANGE SUCCESSFUL", "CLASS: SHADOW MONARCH\nTHEME UNLOCKED: SHADOW", "SYSTEM_ALERT");
    }
  };

  // --- NEW: Helper to force update user stats for simulation ---
  const simulateFatigue = () => {
      setUser(prev => {
          if (!prev) return null;
          const isTired = prev.stats.fatigue_level >= 85;
          return {
              ...prev,
              stats: {
                  ...prev.stats,
                  fatigue_level: isTired ? 0 : 90 // Toggle betwen 0 and 90
              }
          }
      });
      notify("SYSTEM OVERRIDE", "Simulating Fatigue status change...", "WARNING");
  };

  // Helper to force level up for testing
  const debugLevelUp = () => {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3500);
      setUser(prev => prev ? { ...prev, level: prev.level + 1 } : null);
  };

  useEffect(() => {
    if (user) {
        // AI Flavor text
        generateSystemMessage(user, "User just logged in.").then(msg => {
            if(msg !== "SYSTEM ERROR" && !msg.includes("API KEY MISSING")) {
                console.log(msg); 
            }
        });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, quests, login, register, logout, completeQuest, updateQuestProgress, addQuest, notify, clearNotification, promoteJob, updateStat }}>
      <ParticleCursor />
      {children}
      <SystemNotification notification={notification} onClear={clearNotification} />
      
      {/* LEVEL UP OVERLAY */}
      <AnimatePresence>
          {showLevelUp && user && <LevelUpOverlay level={user.level} />}
      </AnimatePresence>

      {/* GLITCH OVERLAY INTEGRATION */}
      {user && (
          <GlitchOverlay 
            active={user.stats.fatigue_level > 50} 
            intensity={user.stats.fatigue_level > 80 ? 'high' : 'low'} 
          />
      )}

      {/* DEV TOOL: TOGGLE FATIGUE (Only visible when logged in) */}
      {user && (
          <div className="fixed bottom-2 right-2 z-[10000] opacity-50 hover:opacity-100 flex gap-2">
              <button 
                onClick={toggleTheme}
                className="bg-black/50 text-[10px] text-neon-blue border border-neon-blue px-2 py-1 font-mono uppercase"
              >
                  THEME: {theme}
              </button>
              <button 
                onClick={simulateFatigue}
                className="bg-red-900/50 text-[10px] text-red-500 border border-red-500 px-2 py-1 font-mono uppercase"
              >
                  [DEV] Fatigue ({user.stats.fatigue_level})
              </button>
              <button 
                onClick={debugLevelUp}
                className="bg-green-900/50 text-[10px] text-green-500 border border-green-500 px-2 py-1 font-mono uppercase"
              >
                  [DEV] Lvl Up
              </button>
          </div>
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Modals / Pages ---

const LandingPage: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { login, register, clearNotification, notify } = useAuth();
  const navigate = useNavigate();

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupHunterId, setSignupHunterId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  const [idError, setIdError] = useState("");
  const [idSuccess, setIdSuccess] = useState("");

  const checkIdAvailability = (id: string) => {
    if (!id) {
        setIdError("");
        setIdSuccess("");
        return;
    }
    if (MOCK_EXISTING_IDS.includes(id)) {
        setIdError("ID ALREADY REGISTERED");
        setIdSuccess("");
    } else {
        setIdError("");
        setIdSuccess("ID AVAILABLE");
    }
  };

  // Effect to auto-generate Hunter ID
  useEffect(() => {
    if (isIdManuallyEdited) return; 

    // Prefer name for ID generation, fallback to email part
    const sourceText = signupName.trim() || signupEmail.split('@')[0];
    
    if (sourceText.length >= 2) {
      // Deterministic Generation: Name Part + Special Char + Hash Number
      const cleanName = sourceText.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 3);
      
      let hash = 0;
      for (let i = 0; i < sourceText.length; i++) {
        hash = sourceText.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const specialChars = ["#", "!", "$", "&"];
      const specialChar = specialChars[Math.abs(hash) % specialChars.length];
      const number = Math.abs(hash) % 90 + 10; 
      
      const generatedId = `${cleanName}${specialChar}${number}`;
      
      setSignupHunterId(generatedId);
      checkIdAvailability(generatedId);
    } else {
      setSignupHunterId("");
      setIdSuccess("");
      setIdError("");
    }
  }, [signupName, signupEmail, isIdManuallyEdited]);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toUpperCase();
      setSignupHunterId(val);
      setIsIdManuallyEdited(true); 
      checkIdAvailability(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotification();
    setIsLoggingIn(true);
    
    const success = await login(loginIdentifier, loginPassword);
    
    setIsLoggingIn(false);
    
    if (success) {
      setIsLoginOpen(false);
      navigate('/dashboard');
    } 
  };

  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (idError) return;
      if (!signupName || !signupPassword || !signupHunterId) return;
      
      // Email is optional now
      const finalEmail = signupEmail || "";
      const finalId = signupHunterId;

      setTimeout(() => {
        register(signupName, finalEmail, finalId, signupPassword);
        
        setIsSignupOpen(false); 
        setIsLoginOpen(true);
        // Auto-fill ID for login
        setLoginIdentifier(finalId);
        
        notify("REGISTRATION SUCCESSFUL", `Hunter ID Assigned: ${finalId}\nStatus: PENDING AWAKENING`, "INFO");
      }, 800);
  }

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Main Title Area */}
      <div className="text-center z-10">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-9xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-blue drop-shadow-[0_0_20px_rgba(0,243,255,0.8)] tracking-tighter"
        >
          FITNOVA
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-neon-blue font-mono tracking-[1em] text-sm md:text-xl mt-4 uppercase"
        >
            Arise Edition
        </motion.p>
        
        <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1 }}
           className="mt-16 flex flex-col md:flex-row gap-6 justify-center"
        >
           <button 
             onClick={() => setIsLoginOpen(true)}
             className="px-8 py-3 bg-neon-blue text-black font-orbitron font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.6)]"
           >
             Enter System
           </button>
           <button 
             onClick={() => setIsSignupOpen(true)}
             className="px-8 py-3 border border-neon-blue text-neon-blue font-orbitron font-bold uppercase tracking-widest hover:bg-neon-blue/10 transition-colors"
           >
             Become Hunter
           </button>
        </motion.div>
      </div>

      {/* Login Modal */}
      <SystemModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
         <SystemWindow 
            title="SYSTEM ACCESS" 
            subtitle="Hunter Verification Required" 
            footer={
                <div className="text-xs text-gray-500 font-mono mt-4 cursor-pointer hover:text-neon-blue">
                   FORGOT ACCESS CODE?
                </div>
            }
         >
            <form onSubmit={handleLogin}>
               <SystemInput 
                 label="Hunter ID / Email" 
                 placeholder="Enter ID (e.g., JIN#42) or Email..." 
                 type="text" 
                 required 
                 value={loginIdentifier}
                 onChange={(e) => setLoginIdentifier(e.target.value)}
               />
               <SystemInput 
                 label="Access Code" 
                 placeholder="Enter password..." 
                 type="password" 
                 required 
                 value={loginPassword}
                 onChange={(e) => setLoginPassword(e.target.value)}
               />
               <div className="mt-8">
                  <SystemButton type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? "VERIFYING..." : "INITIALIZE"}
                  </SystemButton>
               </div>
            </form>
         </SystemWindow>
      </SystemModal>

      {/* Signup Modal */}
      <SystemModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}>
         <SystemWindow title="HUNTER REGISTRATION" subtitle="Initialize your profile in the system">
            <form onSubmit={handleSignup}>
               <SystemInput 
                 label="Hunter Name" 
                 placeholder="Enter full name" 
                 required 
                 value={signupName}
                 onChange={(e) => setSignupName(e.target.value)}
               />
               <SystemInput 
                 label="Email Address (Optional)" 
                 placeholder="hunter@fitnova.sys" 
                 type="email" 
                 value={signupEmail}
                 onChange={(e) => setSignupEmail(e.target.value)}
               />
               
               <SystemInput 
                 label="System Assigned ID" 
                 placeholder="Waiting for data..." 
                 value={signupHunterId}
                 onChange={handleIdChange}
                 error={idError}
                 success={idSuccess}
                 required
               />
               
               <SystemInput 
                 label="Access Code" 
                 placeholder="Min 8 characters" 
                 type="password" 
                 required 
                 value={signupPassword}
                 onChange={(e) => setSignupPassword(e.target.value)}
                />
               <div className="mt-8">
                  <SystemButton type="submit" disabled={!!idError}>Register Hunter</SystemButton>
               </div>
            </form>
         </SystemWindow>
      </SystemModal>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, quests, completeQuest, updateQuestProgress, logout, addQuest, notify, promoteJob, updateStat } = useAuth();
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  
  if (!user) return <Navigate to="/" />;

  // Derive the active quest object from the global state using ID
  const selectedQuest = selectedQuestId ? quests.find(q => q.id === selectedQuestId) || null : null;

  // Check for incomplete DAILY quests for the Penalty Timer
  const hasIncompleteDaily = quests.some(q => q.type === 'DAILY' && !q.completed);

  const handleQuestGeneration = async () => {
    if (isGeneratingQuest) return;
    setIsGeneratingQuest(true);
    notify("SYSTEM SCAN", "Analyzing player biometrics for new scenario...", "INFO");

    const partialQuest = await generateQuest(user);
    
    if (partialQuest) {
      // Map partial to full quest
      const newQuest: Quest = {
        id: `AI_QUEST_${Date.now()}`,
        title: partialQuest.title || "UNKNOWN QUEST",
        description: partialQuest.description || "No data.",
        objectives: partialQuest.objectives?.map(o => ({...o, current: 0})) || [],
        difficulty: partialQuest.difficulty || 'E',
        xpReward: partialQuest.xpReward || 50,
        statRewards: partialQuest.statRewards || {},
        completed: false,
        type: partialQuest.type || 'SUDDEN',
        penalty: partialQuest.penalty
      };

      addQuest(newQuest);
      notify("NEW QUEST RECEIVED", `Scenario: ${newQuest.title}`, "SYSTEM_ALERT");
    } else {
      notify("SCAN FAILED", "Unable to generate quest scenario.", "WARNING");
    }
    
    setIsGeneratingQuest(false);
  };

  return (
    <>
      <AnimatePresence>
        {isBooting && <SystemBoot onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      <div className="min-h-screen p-4 md:p-8 pt-24 relative z-10">
        
        {/* --- TECH HUD TOP BAR --- */}
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: isBooting ? 0 : 0.5, type: "spring", stiffness: 50 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        >
            {/* Main Top Bar Container - Allows clicks on children */}
            <div className="flex justify-between items-start">
                
                {/* LEFT WING */}
                <div className="pointer-events-auto relative">
                    {/* Shape Background */}
                    <div className="absolute inset-0 bg-black/90 border-b-2 border-r-2 border-neon-blue/30" 
                         style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }} />
                    
                    {/* Decorative Tech Lines */}
                    <div className="absolute bottom-0 left-0 w-[80%] h-[2px] bg-neon-blue shadow-[0_0_10px_#00f3ff]" />

                    {/* Content */}
                    <div className="relative z-10 pl-6 pr-16 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 bg-neon-blue/20 border border-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                            <span className="font-orbitron font-bold text-neon-blue">FN</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-orbitron font-bold text-white text-lg tracking-widest leading-none">FITNOVA</span>
                            <span className="font-mono text-[9px] text-neon-blue/60 tracking-[0.3em] uppercase">Arise System v4.1</span>
                        </div>
                    </div>
                </div>

                {/* CENTER DECORATION (Only Desktop) */}
                <div className="hidden lg:flex flex-col items-center flex-grow mx-4 pointer-events-none">
                    {/* Top thin line */}
                    <div className="w-full h-[1px] bg-gray-800 relative top-2">
                         <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-32 h-[3px] bg-neon-blue" />
                    </div>
                    {/* Trapezoid Status */}
                    <div className="mt-2 px-8 py-1 bg-black/80 border border-neon-blue/30 backdrop-blur skew-x-[-20deg]">
                         <div className="skew-x-[20deg] flex gap-4 text-[10px] font-mono text-gray-400">
                             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> ONLINE</span>
                             <span>|</span>
                             <span>SERVER: KOREA-1</span>
                             <span>|</span>
                             <span>PING: 2ms</span>
                         </div>
                    </div>
                </div>

                {/* RIGHT WING */}
                <div className="pointer-events-auto relative">
                     {/* Shape Background */}
                    <div className="absolute inset-0 bg-black/90 border-b-2 border-l-2 border-neon-blue/30" 
                         style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }} />
                    
                     {/* Decorative Tech Lines */}
                     <div className="absolute bottom-0 right-0 w-[80%] h-[2px] bg-neon-blue shadow-[0_0_10px_#00f3ff]" />

                     {/* Content */}
                     <div className="relative z-10 pl-16 pr-6 py-4 flex items-center gap-6">
                         <div className="text-right">
                             <div className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">HUNTER // {user.rank}</div>
                             <div className="font-orbitron font-bold text-white tracking-widest">{user.name}</div>
                         </div>
                         
                         <button 
                            onClick={logout}
                            className="group relative h-10 w-10 flex items-center justify-center border border-red-500/30 hover:bg-red-900/20 hover:border-red-500 transition-all"
                         >
                             {/* Power Icon SVG */}
                             <svg className="w-5 h-5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                             </svg>
                             {/* Corner Ticks */}
                             <div className="absolute top-0 right-0 w-1 h-1 bg-red-500" />
                             <div className="absolute bottom-0 left-0 w-1 h-1 bg-red-500" />
                         </button>
                     </div>
                </div>

            </div>
        </motion.div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN: STATS SUMMARY (Width: 3/12) --- */}
          <div className="lg:col-span-3 space-y-4">
              
              {/* NEW ID CARD */}
              <HunterIDCard user={user} />

              {/* Streak Flame */}
              <StreakFlame streak={user.daily_streak} />

              {/* Penalty Timer (Conditional) */}
              {hasIncompleteDaily && <PenaltyTimer />}

              {/* Radar & Log Stacked */}
              <div className="border border-gray-800 bg-black/40">
                  <StatRadar stats={user.stats} />
              </div>
              
              {/* Heatmap */}
              <WorkoutHeatmap />
              
              <div className="h-40 border border-gray-800">
                  <SystemLog />
              </div>
              
              {/* Sleep Visualizer */}
              <SleepVisualizer sleepQuality={user.stats.sleep_quality} />

              {/* Shadow Extraction (Quest Count) */}
              <ShadowExtraction completedQuests={quests.filter(q => q.completed).length} />

          </div>

          {/* --- MIDDLE COLUMN: HERO AVATAR (Width: 4/12) --- */}
          <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex-grow min-h-[500px] relative">
                  <PlayerAvatar stats={user.stats} onStatUpdate={updateStat} />
              </div>
              {/* Detailed Stats below avatar for central focus */}
              <StatsGrid stats={user.stats} baselineStats={INITIAL_STATS} currentRank={user.rank} />
          </div>

          {/* --- RIGHT COLUMN: QUESTS & SKILLS (Width: 4/12) --- */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
              
              {/* ACTIVE QUESTS (Top half) */}
              <div className="flex flex-col h-[50%] min-h-[300px]">
                
                {/* NEW: JOB CHANGE WIDGET */}
                <JobChangeWidget 
                    currentLevel={user.level} 
                    targetLevel={40} 
                    jobClass={user.job_class || 'None'}
                    onPromote={promoteJob}
                />

                <div className="mb-4 border-b border-gray-800 pb-2 flex items-center justify-between">
                   <h2 className="text-xl font-orbitron text-white flex items-center gap-4">
                      <span className="w-2 h-6 bg-neon-blue"></span>
                      ACTIVE QUESTS
                   </h2>
                   
                   <button 
                     onClick={handleQuestGeneration}
                     disabled={isGeneratingQuest}
                     className={`text-[10px] font-mono border px-3 py-1 uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        isGeneratingQuest 
                          ? 'border-gray-700 text-gray-500 cursor-wait'
                          : 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                     }`}
                   >
                     {isGeneratingQuest ? (
                        <>
                           <span className="animate-spin">⟳</span> SCANNING...
                        </>
                     ) : (
                        <>
                           <span>+</span> SYSTEM SCAN
                        </>
                     )}
                   </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                    {quests.map((quest) => (
                        <motion.div
                        key={quest.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        onClick={() => setSelectedQuestId(quest.id)}
                        className={`cursor-pointer border-l-2 p-5 bg-black/40 hover:bg-neon-blue/5 transition-all relative overflow-hidden ${
                            quest.type === 'SUDDEN' ? 'border-neon-purple' : 'border-neon-blue'
                        }`}
                        >
                        {quest.completed && (
                            <div className="absolute top-2 right-2 text-green-500 font-bold border border-green-500 px-1 text-[10px]">
                                DONE
                            </div>
                        )}
                        <div className={`text-[10px] font-mono mb-1 ${quest.type === 'SUDDEN' ? 'text-neon-purple' : 'text-neon-blue'}`}>
                            [{quest.type === 'SUDDEN' ? 'URGENT' : 'DAILY'}]
                        </div>
                        <h3 className="font-orbitron text-white text-md font-bold mb-1">{quest.title}</h3>
                        
                        <div className="mt-2 flex justify-between items-end">
                            <span className="text-xs text-gray-500 font-mono">Rank: <span className="text-white">{quest.difficulty}</span></span>
                            <span className="text-xs text-gray-500 font-mono">XP: <span className="text-neon-blue">{quest.xpReward}</span></span>
                        </div>
                        </motion.div>
                    ))}
                </div>
              </div>

              {/* SKILL LIBRARY (Bottom half) */}
              <div className="flex-grow h-[50%]">
                 <SkillLibrary />
              </div>

          </div>
        </div>

        <SystemModal isOpen={!!selectedQuestId} onClose={() => setSelectedQuestId(null)}>
          {selectedQuest && (
              <QuestCard 
                quest={selectedQuest} 
                onComplete={() => {
                    completeQuest(selectedQuest.id);
                    setSelectedQuestId(null);
                }} 
                onObjectiveUpdate={(idx, val) => updateQuestProgress(selectedQuest.id, idx, val)}
              />
          )}
        </SystemModal>

      </div>
    </>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SystemBackground />
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
