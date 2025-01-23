import { Timestamp } from 'firebase/firestore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly';
  progress: number;
  total: number;
  reward: {
    type: 'points' | 'badge' | 'level';
    value: number | string;
  };
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  unlockedAt?: Timestamp;
}

export interface GamificationProfile {
  userId: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: {
    current: number;
    longest: number;
    lastActive: string;
  };
  leaderboard: {
    position: number;
    score: number;
    category: string;
  }[];
}