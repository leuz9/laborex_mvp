export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'performance' | 'collaboration' | 'learning' | 'innovation';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  conditions: {
    type: 'task_completion' | 'feedback_received' | 'skill_level' | 'streak';
    value: number;
  };
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}