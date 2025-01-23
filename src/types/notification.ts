import { Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'feedback' | 'achievement' | 'reminder' | 'performance';
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  link?: string;
  metadata?: Record<string, any>;
}