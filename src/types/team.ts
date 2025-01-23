import { Timestamp } from 'firebase/firestore';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  level: number;
  points: number;
  badges: string[];
  skills: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}