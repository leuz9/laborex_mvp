export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'pharmacy' | 'admin';
  notifications: Notification[];
}

export interface Medication {
  id: string;
  name: string;
  description: string;
  dosage: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MedicationRequest {
  id: string;
  userId: string;
  medications: Medication[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  location: Location;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: Location;
  onDuty?: {
    start: string;
    end: string;
    phone: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Statistics {
  totalOrders: number;
  totalUsers: number;
  totalPharmacies: number;
  averageResponseTime: number;
  pendingRequests: number;
}

export interface Order {
  id: string;
  userId: string;
  pharmacyId: string;
  medications: Medication[];
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed';
  totalAmount: number;
  createdAt: string;
}