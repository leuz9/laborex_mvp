export interface Rating {
  orderId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  pharmacyId: string;
  medications: Medication[];
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed';
  totalAmount: number;
  createdAt: string;
  paymentMethod?: 'cash' | 'card' | 'mobile_money';
  paymentStatus?: 'pending' | 'completed';
  preparedAt?: string;
  readyAt?: string;
  completedAt?: string;
  rating?: number;
  comment?: string;
  ratedAt?: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'pharmacy' | 'admin';
  phone?: string;
  notifications: Notification[];
  ratings?: Rating[];
}