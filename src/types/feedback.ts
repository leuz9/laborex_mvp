import { Timestamp } from 'firebase/firestore';

export interface FeedbackEntry {
  id: string;
  from: {
    id: string;
    name: string;
    avatar: string;
  };
  to: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'praise' | 'suggestion' | 'concern';
  category: 'performance' | 'collaboration' | 'innovation' | 'leadership';
  content: string;
  private: boolean;
  timestamp: Timestamp;
  reactions: {
    type: 'like' | 'helpful';
    userId: string;
    timestamp: Timestamp;
  }[];
}