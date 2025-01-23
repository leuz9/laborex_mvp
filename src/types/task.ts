import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  productId: string;
  assignees: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate: Timestamp;
  dueDate: Timestamp;
  dependencies: string[];
  xpReward: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  comments?: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: Timestamp;
  }[];
}