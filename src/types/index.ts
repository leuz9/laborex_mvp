// Types existants...

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

export interface CareerDevelopment {
  id: string;
  employeeId: string;
  goals: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
  };
  skills: {
    current: string[];
    desired: string[];
  };
  certifications: {
    completed: {
      name: string;
      date: string;
      issuer: string;
    }[];
    planned: {
      name: string;
      targetDate: string;
    }[];
  };
  mentorship: {
    mentor?: string;
    mentees: string[];
  };
}