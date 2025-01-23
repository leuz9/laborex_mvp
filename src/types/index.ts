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
  category: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt?: string;
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
  confirmedPharmacies?: string[]; // IDs des pharmacies ayant confirmé la disponibilité
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}