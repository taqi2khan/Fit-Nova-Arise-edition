
export enum SystemState {
  NORMAL = 'NORMAL',
  AWAKENING = 'AWAKENING',
  OVERLOAD = 'OVERLOAD'
}

export enum Rank {
  E = 'E-Rank',
  D = 'D-Rank',
  C = 'C-Rank',
  B = 'B-Rank',
  A = 'A-Rank',
  S = 'S-Rank',
  NATIONAL = 'National Level'
}

export interface UserStats {
  // Core Physical
  strength: number;
  endurance: number;
  agility: number;
  flexibility: number;
  stamina: number;
  vitality: number;
  physique_score: number;
  
  // Mental / System
  intelligence: number;
  focus: number;
  willpower: number;
  stress_resilience: number;
  consistency_index: number;

  // Special
  shadow_potential: number;
  awakening_rate: number;
  aura_control: number;

  // Extra
  fatigue_level: number;
  sleep_quality: number;
  hydration_score: number;
  reaction_time: number;
  power_index: number;
  combativeness: number;
}

export interface User {
  id: string;
  name: string;
  email?: string; // Made optional
  xp: number;
  level: number;
  rank: Rank;
  system_state: SystemState;
  stats: UserStats;
  title: string; // e.g., "Wolf Slayer"
  daily_streak: number; // New field for streak tracking
  job_class: string; // New field for Job Change
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: { text: string; current: number; total: number; unit?: string }[];
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  xpReward: number;
  statRewards: Partial<UserStats>;
  completed: boolean;
  type: 'DAILY' | 'STORY' | 'SUDDEN';
  penalty?: string;
}

export interface SystemNotificationData {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'LEVEL_UP' | 'QUEST_COMPLETE' | 'WARNING' | 'SYSTEM_ALERT';
}

export interface AuthContextType {
  user: User | null;
  quests: Quest[];
  login: (identifier?: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, id: string, password: string) => void;
  logout: () => void;
  completeQuest: (id: string) => void;
  updateQuestProgress: (questId: string, objectiveIndex: number, newCurrent: number) => void;
  addQuest: (quest: Quest) => void;
  notify: (title: string, message: string, type?: SystemNotificationData['type']) => void;
  clearNotification: () => void;
  promoteJob: () => void; // New method
  updateStat: (stat: keyof UserStats, value: number) => void; // New method for manual/animated updates
  theme: 'SYSTEM' | 'SHADOW' | 'RULER';
  toggleTheme: () => void;
}
