
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
import { Sidebar } from './components/Sidebar';

// --- MOCK DATABASE FOR ID CHECKING ---
const MOCK_EXISTING_IDS = [
  'SHADOW#01', 
  'ADMIN!00', 
  'TEST#12', 
  'JINWOO#99'
];

interface RegisteredUser {
  name: string;
  email: string;
  id: string;
  pass: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>(MOCK_QUESTS);
  const [notification, setNotification] = useState<SystemNotificationData | null>(null);
  const [theme, setTheme] = useState<'SYSTEM' | 'SHADOW' | 'RULER'>('SYSTEM');
  
  // Visual state for level up animation
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Persistent storage for registered users
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('fitnova_users');
    return saved ? JSON.parse(saved) : [];
  });

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
    const newUser = { name, email, id, pass };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('fitnova_users', JSON.stringify(updatedUsers));
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

        // --- 2. CHECK REGISTERED USERS (FROM LOCAL STORAGE) ---
        const foundUser = registeredUsers.find(u => {
            const uId = u.id.toLowerCase();
            const uEmail = (u.email || '').toLowerCase();
            return (uId === lowerIdentifier || (uEmail && uEmail === lowerIdentifier));
        });

        if (foundUser && foundUser.pass === password) {
             // Initialize a FRESH user (Level 1)
             const newUser: User = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
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
             notify("SYSTEM INITIALIZATION", `Welcome, Hunter ${foundUser.name}.\nStarting Stats Assigned.`, "INFO");
             resolve(true);
             return;
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

  // Helper to cycle ranks for testing
  const debugToggleRank = () => {
    setUser(prev => {
        if (!prev) return null;
        let nextRank = Rank.E;
        // Cycle: E -> B -> A -> S -> National
        if (prev.rank === Rank.E) nextRank = Rank.B;
        else if (prev.rank === Rank.B) nextRank = Rank.A;
        else if (prev.rank === Rank.A) nextRank = Rank.S;
        else if (prev.rank === Rank.S) nextRank = Rank.NATIONAL;
        else nextRank = Rank.E;

        return { ...prev, rank: nextRank };
    });
    notify("SYSTEM OVERRIDE", "Hunter Rank Modified.", "SYSTEM_ALERT");
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
    <AuthContext.Provider value={{ user, quests, login, register, logout, completeQuest, updateQuestProgress, addQuest, notify, clearNotification, promoteJob, updateStat, theme, toggleTheme }}>
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
                  [DEV] Fatigue
              </button>
              <button 
                onClick={debugLevelUp}
                className="bg-green-900/50 text-[10px] text-green-500 border border-green-500 px-2 py-1 font-mono uppercase"
              >
                  [DEV] Lvl Up
              </button>
              <button 
                onClick={debugToggleRank}
                className="bg-purple-900/50 text-[10px] text-purple-400 border border-purple-500 px-2 py-1 font-mono uppercase"
              >
                  [DEV] Rank: {user.rank.split('-')[0]}
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

// --- REUSABLE GLASS CARD COMPONENT ---
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; title?: string; subtitle?: string }> = ({ children, className = "", title, subtitle }) => (
    <div className={`bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group ${className}`}>
        {/* Subtle Gradient Glow from Top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        
        {title && (
            <div className="mb-6 flex justify-between items-baseline">
                <div>
                    <h3 className="text-white font-orbitron font-bold text-lg tracking-wide">{title}</h3>
                    {subtitle && <p className="text-gray-500 font-mono text-xs mt-1">{subtitle}</p>}
                </div>
            </div>
        )}
        {children}
    </div>
);

const Dashboard: React.FC = () => {
  const { user, quests, completeQuest, updateQuestProgress, logout, addQuest, notify, promoteJob, updateStat, theme, toggleTheme } = useAuth();
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (!user) return <Navigate to="/" />;

  const selectedQuest = selectedQuestId ? quests.find(q => q.id === selectedQuestId) || null : null;
  const activeQuests = quests.filter(q => !q.completed);
  const xpPercentage = (user.xp / (user.level * 100)) * 100;

  const handleQuestGeneration = async () => {
    if (isGeneratingQuest) return;
    setIsGeneratingQuest(true);
    notify("SYSTEM SCAN", "Analyzing player biometrics...", "INFO");

    const partialQuest = await generateQuest(user);
    if (partialQuest) {
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

  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
                    {/* 1. HUNTER STATUS (Big Left Card) */}
                    <GlassCard className="col-span-1 lg:col-span-8 row-span-2 flex flex-col md:flex-row gap-8">
                         <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-orbitron font-bold text-white">Hunter Status</h2>
                                    <p className="text-neon-blue font-mono text-xs tracking-wider">Rank: {user.rank}</p>
                                </div>
                                 <div className="text-right">
                                    <div className="text-3xl font-bold font-mono text-white">{user.stats.power_index}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Power Index</div>
                                 </div>
                            </div>
                            
                            {/* Central Stats Visuals (No Avatar) */}
                            <div className="flex-grow flex items-center justify-center relative min-h-[300px]">
                                 <div className="scale-125">
                                    <StatRadar stats={user.stats} />
                                 </div>
                            </div>
                         </div>
    
                         {/* Stats Sidebar inside card */}
                         <div className="w-full md:w-64 border-l border-white/5 pl-0 md:pl-8 flex flex-col justify-center">
                             <h3 className="text-sm font-orbitron font-bold text-gray-400 mb-4 uppercase">Core Metrics</h3>
                             <StatsGrid stats={user.stats} compact={true} />
                         </div>
                    </GlassCard>
    
                    {/* 2. SYSTEM LEVEL (Progress Card) */}
                    <GlassCard className="col-span-1 lg:col-span-4 lg:row-span-2 flex flex-col items-center justify-center text-center">
                        <h3 className="text-gray-400 font-orbitron font-bold text-sm uppercase tracking-widest mb-6">System Level</h3>
                        
                        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                <motion.circle 
                                    cx="96" cy="96" r="88" 
                                    stroke="#bc13fe" 
                                    strokeWidth="12" 
                                    fill="none" 
                                    strokeDasharray={552} 
                                    strokeDashoffset={552 - (552 * xpPercentage) / 100}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 552 }}
                                    animate={{ strokeDashoffset: 552 - (552 * xpPercentage) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold font-mono text-white">{user.level}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Current Level</span>
                            </div>
                        </div>
    
                        <div className="text-xs text-gray-400 font-mono">
                            <span className="text-white">{Math.floor(user.xp)}</span> / {user.level * 100} XP
                        </div>
                    </GlassCard>
    
                    {/* 3. ACTIVE QUEST WIDGET (Replaces Map) */}
                    <GlassCard className="col-span-1 lg:col-span-4 flex flex-col" title="Active Scenario">
                        {activeQuests.length > 0 ? (
                            <div className="flex-grow flex flex-col gap-4">
                                 {/* Quest Visual */}
                                 <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-black rounded-xl border border-white/5 p-4 relative overflow-hidden group cursor-pointer" onClick={() => setSelectedQuestId(activeQuests[0].id)}>
                                     {/* Map-like patterns */}
                                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                                     
                                     <div className="relative z-10">
                                         <div className="flex justify-between items-start mb-2">
                                             <span className="bg-neon-blue/20 text-neon-blue text-[10px] font-bold px-2 py-1 rounded">{activeQuests[0].difficulty}-RANK</span>
                                             <span className="text-[10px] text-gray-400 font-mono">1.2km away</span>
                                         </div>
                                         <h4 className="text-white font-bold font-orbitron">{activeQuests[0].title}</h4>
                                         <p className="text-gray-400 text-xs mt-1 truncate">{activeQuests[0].description}</p>
                                         
                                         {/* Objective Preview */}
                                         <div className="mt-4 space-y-2">
                                             {activeQuests[0].objectives.slice(0, 2).map((obj, i) => (
                                                 <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-gray-300">
                                                     <div className={`w-2 h-2 rounded-full ${obj.current >= obj.total ? 'bg-green-500' : 'bg-gray-600'}`} />
                                                     {obj.text} ({obj.current}/{obj.total})
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                                 
                                 {/* Job Change Progress (Mini) */}
                                 <div className="h-10">
                                     <JobChangeWidget currentLevel={user.level} targetLevel={40} jobClass={user.job_class} onPromote={promoteJob} />
                                 </div>
                            </div>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-gray-500 font-mono text-xs">
                                NO ACTIVE QUESTS
                            </div>
                        )}
                    </GlassCard>
    
                    {/* 4. ACTIVITY & LOGS */}
                    <GlassCard className="col-span-1 lg:col-span-5 flex flex-col" title="System Logs">
                        <div className="flex-grow h-32 relative overflow-hidden rounded-xl bg-black/40 border border-white/5">
                            <SystemLog />
                        </div>
                    </GlassCard>
                    
                    {/* 5. SKILL RUNES (Widget) */}
                    <GlassCard className="col-span-1 lg:col-span-3 flex flex-col" title="Skill Runes">
                       <div className="flex-grow overflow-y-auto custom-scrollbar h-32">
                           <SkillLibrary mode="WIDGET" />
                       </div>
                    </GlassCard>
                </div>
            );
        case 'quests':
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-orbitron font-bold text-white">Quest Log</h2>
                        <button onClick={handleQuestGeneration} disabled={isGeneratingQuest} className="bg-neon-blue/20 border border-neon-blue text-neon-blue px-4 py-2 font-mono text-xs uppercase hover:bg-neon-blue hover:text-black transition-colors">
                            {isGeneratingQuest ? 'Scanning...' : 'Scan for New Scenarios'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {quests.map(quest => (
                            <div key={quest.id} onClick={() => setSelectedQuestId(quest.id)} className={`cursor-pointer group relative p-6 border rounded-xl overflow-hidden transition-all ${quest.completed ? 'border-green-500/30 bg-green-900/10' : 'border-white/10 bg-black/40 hover:border-neon-blue/50'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`font-orbitron font-bold text-lg ${quest.completed ? 'text-green-400' : 'text-white'}`}>{quest.title}</h3>
                                    <span className={`text-xs font-mono px-2 py-1 border ${quest.completed ? 'border-green-500 text-green-500' : 'border-neon-blue text-neon-blue'}`}>{quest.difficulty}-RANK</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 font-mono">{quest.description}</p>
                                <div className="space-y-2">
                                     {quest.objectives.map((obj, i) => (
                                         <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                             <div className={`w-1.5 h-1.5 rounded-full ${obj.current >= obj.total ? 'bg-green-500' : 'bg-gray-700'}`} />
                                             {obj.text} ({obj.current}/{obj.total})
                                         </div>
                                     ))}
                                </div>
                                {quest.completed && <div className="absolute top-4 right-16 text-green-500/20 font-black text-6xl -rotate-12 pointer-events-none">CLEARED</div>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'stats':
            return (
                <div className="animate-fade-in space-y-6">
                    <h2 className="text-3xl font-orbitron font-bold text-white mb-6">Detailed Analytics</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <GlassCard title="Core Attributes">
                                <StatsGrid stats={user.stats} />
                            </GlassCard>
                            <PenaltyTimer />
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <GlassCard title="Performance History">
                                <WorkoutHeatmap />
                            </GlassCard>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SleepVisualizer sleepQuality={user.stats.sleep_quality} />
                                <StreakFlame streak={user.daily_streak} />
                            </div>
                            <div className="mt-6">
                                <ShadowExtraction completedQuests={quests.filter(q => q.completed).length} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'skills':
            return (
                <div className="animate-fade-in h-[calc(100vh-200px)] flex flex-col">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
                        <div>
                            <h2 className="text-3xl font-orbitron font-bold text-white">Skill Library</h2>
                            <p className="text-neon-blue font-mono text-xs mt-2">ACCESSING RUNESTONE DATABASE...</p>
                        </div>
                        <div className="text-right text-gray-500 font-mono text-xs">
                            TOTAL SKILLS: 21<br/>
                            UNLOCKED: 16
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                         <SkillLibrary mode="FULL" />
                    </div>
                </div>
            );
        case 'settings':
            return (
                <div className="animate-fade-in max-w-2xl mx-auto">
                     <h2 className="text-3xl font-orbitron font-bold text-white mb-8 border-b border-gray-800 pb-4">System Config</h2>
                     
                     <div className="space-y-6">
                         <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                             <div>
                                 <div className="text-white font-bold font-orbitron">SYSTEM THEME</div>
                                 <div className="text-xs text-gray-500 font-mono">OVERRIDE INTERFACE COLORS</div>
                             </div>
                             <button onClick={toggleTheme} className="px-4 py-2 border border-neon-blue text-neon-blue font-mono text-xs hover:bg-neon-blue hover:text-black transition-colors">
                                 CURRENT: {theme}
                             </button>
                         </div>
                         
                         <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                             <div>
                                 <div className="text-white font-bold font-orbitron">NOTIFICATIONS</div>
                                 <div className="text-xs text-gray-500 font-mono">HUD ALERTS & POPUPS</div>
                             </div>
                             <div className="flex gap-2">
                                 <button className="px-3 py-1 bg-neon-blue text-black font-bold text-xs">ON</button>
                                 <button className="px-3 py-1 bg-black border border-gray-700 text-gray-500 font-bold text-xs">OFF</button>
                             </div>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-900/30 rounded-lg mt-12">
                             <div>
                                 <div className="text-red-500 font-bold font-orbitron">DANGER ZONE</div>
                                 <div className="text-xs text-red-400 font-mono">DISCONNECT FROM SYSTEM</div>
                             </div>
                             <button onClick={logout} className="px-6 py-2 border border-red-500 text-red-500 font-orbitron font-bold text-xs hover:bg-red-500 hover:text-white transition-colors">
                                 LOGOUT
                             </button>
                         </div>
                     </div>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isBooting && <SystemBoot onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-transparent relative z-10 flex text-gray-200">
        
        {/* --- LEFT SIDEBAR NAVIGATION --- */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 ml-20 md:ml-24 p-6 md:p-10 max-w-[1920px]">
            
            {/* HEADER AREA: TOP BAR + ID CARD */}
            <header className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
                <div className="w-full lg:w-1/2">
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">System Interface v4.2</p>
                    <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">{user.name}</span>
                    </h1>
                </div>

                {/* HUNTER ID CARD (Always Visible) */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                     <HunterIDCard user={user} />
                </div>
            </header>

            {/* DYNAMIC CONTENT AREA */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
            
        </div>

        {/* --- QUEST MODAL --- */}
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

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="relative font-sans text-gray-100 selection:bg-neon-blue selection:text-black min-h-screen overflow-x-hidden">
          <SystemBackground />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
