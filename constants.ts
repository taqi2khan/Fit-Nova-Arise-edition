
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
  daily_streak: 12,
  job_class: 'None'
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
  },
  {
    id: 'q3',
    title: 'DUNGEON BREAK',
    description: 'Survive the high-intensity interval training session.',
    objectives: [
        { text: "Burpees", current: 0, total: 30 },
        { text: "Mountain Climbers", current: 0, total: 50 }
    ],
    difficulty: 'C',
    xpReward: 200,
    statRewards: { agility: 2, strength: 1 },
    completed: false,
    type: 'STORY'
  }
];

export const MOCK_SKILLS = [
  { id: 's1', name: "SPRINT", type: 'ACTIVE', description: "Increase movement speed by 30%. Consumes 1 Mana/sec.", cooldown: 60, status: 'READY', iconStr: "⚡" },
  { id: 's2', name: "STEALTH", type: 'ACTIVE', description: "Hides your presence completely. Consumes 5 Mana/sec.", cooldown: 120, status: 'LOCKED', iconStr: "👁" },
  { id: 's3', name: "VITAL STRIKE", type: 'ACTIVE', description: "Deals critical damage to vital points using a dagger.", cooldown: 15, status: 'READY', iconStr: "⚔" },
  { id: 's4', name: "BLOODLUST", type: 'PASSIVE', description: "Induce fear in enemies weaker than you for 1 minute.", cooldown: 0, status: 'READY', iconStr: "🩸" },
  { id: 's5', name: "SHADOW SWAP", type: 'ACTIVE', description: "Switch positions with a shadow soldier instantly.", cooldown: 180, status: 'COOLDOWN', iconStr: "👤" },
  { id: 's6', name: "DOMINATOR'S TOUCH", type: 'ACTIVE', description: "Control objects with your mind. No mana cost.", cooldown: 45, status: 'READY', iconStr: "✋" },
  { id: 's7', name: "DAGGER RUSH", type: 'ACTIVE', description: "Barrage of dagger attacks from all angles.", cooldown: 30, status: 'READY', iconStr: "🗡" },
  { id: 's8', name: "MUTILATE", type: 'ACTIVE', description: "High damage slash that causes bleeding.", cooldown: 40, status: 'LOCKED', iconStr: "💢" },
  { id: 's9', name: "QUICKSILVER", type: 'PASSIVE', description: "Passive agility boost by 20%.", cooldown: 0, status: 'READY', iconStr: "🌪" },
  { id: 's10', name: "LONGEVITY", type: 'PASSIVE', description: "Cures all diseases and poisons effects permanently.", cooldown: 0, status: 'READY', iconStr: "❤️" },
  { id: 's11', name: "IRON WILL", type: 'PASSIVE', description: "Damage reduction of 50% when HP is below 30%.", cooldown: 0, status: 'READY', iconStr: "🛡" },
  { id: 's12', name: "RULER'S AUTHORITY", type: 'ACTIVE', description: "Telekinetic force to crush enemies.", cooldown: 300, status: 'LOCKED', iconStr: "👑" },
  { id: 's13', name: "DRAGON'S FEAR", type: 'ACTIVE', description: "A roar that stuns all enemies in a wide radius.", cooldown: 600, status: 'LOCKED', iconStr: "🐉" },
  { id: 's14', name: "SHADOW EXTRACTION", type: 'ACTIVE', description: "Revive a defeated target as a shadow soldier.", cooldown: 0, status: 'READY', iconStr: "👻" },
  { id: 's15', name: "SAVE SHADOW", type: 'ACTIVE', description: "Store extracted shadows in your shadow storage.", cooldown: 0, status: 'READY', iconStr: "📥" },
  { id: 's16', name: "REANIMATE", type: 'ACTIVE', description: "Restore a destroyed shadow soldier to full health.", cooldown: 60, status: 'READY', iconStr: "♻️" },
  { id: 's17', name: "MONARCH'S DOMAIN", type: 'ACTIVE', description: "Shadows within the domain get +50% stats.", cooldown: 360, status: 'LOCKED', iconStr: "🏰" },
  { id: 's18', name: "STEALTH II", type: 'PASSIVE', description: "Removes sound and smell while in stealth.", cooldown: 0, status: 'LOCKED', iconStr: "😶" },
  { id: 's19', name: "CRITICAL CHAIN", type: 'PASSIVE', description: "Consecutive hits increase critical rate by 10%.", cooldown: 0, status: 'READY', iconStr: "⛓" },
  { id: 's20', name: "MANA SHIELD", type: 'ACTIVE', description: "Absorb damage using Mana instead of Health.", cooldown: 10, status: 'READY', iconStr: "🔮" },
  { id: 's21', name: "AWAKENING", type: 'ACTIVE', description: "Unlock full potential for a short duration.", cooldown: 86400, status: 'LOCKED', iconStr: "🌟" },
];
