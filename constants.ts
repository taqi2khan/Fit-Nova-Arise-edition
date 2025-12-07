import { User, Rank, SystemState, UserStats, Quest } from './types';

export const INITIAL_STATS: UserStats = {
  strength: 10,
  endurance: 10,
  agility: 10,
  flexibility: 8,
  stamina: 12,
  vitality: 10,
  physique_score: 100,
  intelligence: 10,
  focus: 5,
  willpower: 5,
  stress_resilience: 10,
  consistency_index: 0,
  shadow_potential: 0,
  awakening_rate: 1,
  aura_control: 0,
  fatigue_level: 0,
  sleep_quality: 70,
  hydration_score: 50,
  reaction_time: 250,
  power_index: 100,
  combativeness: 5
};

export const MOCK_USER: User = {
  id: 'hunter_001',
  name: 'Sung Jin-Woo',
  email: 'hunter@fitnova.sys',
  xp: 1250,
  level: 15,
  rank: Rank.E,
  system_state: SystemState.NORMAL,
  stats: INITIAL_STATS,
  title: "The Reawakened Player",
  daily_streak: 12
};

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'STRENGTH TRAINING',
    description: '[Goal] Complete the daily strength training list.',
    objectives: [
        { text: "Push-ups", current: 50, total: 100 },
        { text: "Sit-ups", current: 50, total: 100 },
        { text: "Squats", current: 50, total: 100 },
        { text: "Running", current: 5, total: 10, unit: 'km' }
    ],
    difficulty: 'E',
    xpReward: 100,
    statRewards: { strength: 1, endurance: 1 },
    completed: false,
    type: 'DAILY',
    penalty: 'You will be transported to the Penalty Zone for 4 hours.'
  },
  {
    id: 'q2',
    title: 'EMERGENCY RECOVERY',
    description: 'The player is fatigued. Hydration is required.',
    objectives: [
        { text: "Drink Water", current: 0, total: 500, unit: 'ml' }
    ],
    difficulty: 'D',
    xpReward: 20,
    statRewards: { hydration_score: 10 },
    completed: true,
    type: 'SUDDEN'
  }
];