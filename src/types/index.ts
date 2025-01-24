export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'pharmacy' | 'admin';
  phone?: string;
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

export interface MedicationAvailabilityDetails {
  available: boolean;
  price?: number;
  comment?: string;
}

export interface MedicationRequest {
  id: string;
  userId: string;
  medications: Medication[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  location: Location;
  confirmedPharmacies?: string[];
  availabilityDetails?: {
    [pharmacyId: string]: {
      [medicationId: string]: MedicationAvailabilityDetails;
    };
  };
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'new_request' | 'availability_confirmed' | 'request_ready';
  requestId?: string;
}