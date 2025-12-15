import { Rank } from './types';

export type RankKey = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'NATIONAL';

export const getRankKey = (rank: Rank | string): RankKey => {
  const r = String(rank).toUpperCase();

  if (r.includes('NATIONAL')) return 'NATIONAL';
  if (r.startsWith('S') || r.includes('S-RANK')) return 'S';
  if (r.startsWith('A') || r.includes('A-RANK')) return 'A';
  if (r.startsWith('B') || r.includes('B-RANK')) return 'B';
  if (r.startsWith('C') || r.includes('C-RANK')) return 'C';
  if (r.startsWith('D') || r.includes('D-RANK')) return 'D';
  return 'E';
};

export const getRankShortLabel = (rank: Rank | string): string => {
  const key = getRankKey(rank);
  if (key === 'NATIONAL') return 'NAT';
  return key;
};

export const isHighRank = (rank: Rank | string): boolean => {
  const key = getRankKey(rank);
  return key === 'NATIONAL' || key === 'S';
};

export const isMidRank = (rank: Rank | string): boolean => {
  const key = getRankKey(rank);
  return key === 'A' || key === 'B';
};
