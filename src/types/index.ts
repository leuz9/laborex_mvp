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
  confirmedPharmacies?: string[]; // IDs des pharmacies ayant confirmé la disponibilité
}