import type { User, Medication, MedicationRequest, Pharmacy, Notification, Statistics, Order } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user123',
    email: 'moussa.diop@example.com',
    name: 'Moussa Diop',
    role: 'client',
    notifications: []
  },
  {
    id: 'user124',
    email: 'fatou.ndiaye@example.com',
    name: 'Fatou Ndiaye',
    role: 'client',
    notifications: []
  },
  {
    id: 'user125',
    email: 'abdou.fall@example.com',
    name: 'Abdou Fall',
    role: 'client',
    notifications: []
  },
  {
    id: 'pharm456',
    email: 'pharmacie.pointe@example.com',
    name: 'Dr. Aminata Seck',
    role: 'pharmacy',
    notifications: []
  },
  {
    id: 'user126',
    email: 'aissatou.ba@example.com',
    name: 'Aïssatou Ba',
    role: 'client',
    notifications: []
  },
  {
    id: 'user127',
    email: 'omar.sy@example.com',
    name: 'Omar Sy',
    role: 'client',
    notifications: []
  },
  {
    id: 'pharm457',
    email: 'pharmacie.mermoz@example.com',
    name: 'Dr. Ibrahima Gueye',
    role: 'pharmacy',
    notifications: []
  }
];

// Mock Pharmacies
export const mockPharmacies: Pharmacy[] = [
  {
    id: 'pharm123',
    name: 'Pharmacie Point E',
    address: 'Avenue Cheikh Anta Diop, Point E, Dakar',
    location: { latitude: 14.6937, longitude: -17.4441 },
    onDuty: {
      start: '2024-01-14T20:00:00',
      end: '2024-01-15T08:00:00',
      phone: '+221 77 123 45 67'
    }
  },
  {
    id: 'pharm124',
    name: 'Pharmacie Mermoz',
    address: 'Route de Ouakam, Mermoz, Dakar',
    location: { latitude: 14.7127, longitude: -17.4842 }
  },
  {
    id: 'pharm125',
    name: 'Pharmacie Sacré-Cœur',
    address: 'VDN, Sacré-Cœur 3, Dakar',
    location: { latitude: 14.7142, longitude: -17.4762 },
    onDuty: {
      start: '2024-01-14T20:00:00',
      end: '2024-01-15T08:00:00',
      phone: '+221 77 234 56 78'
    }
  },
  {
    id: 'pharm126',
    name: 'Pharmacie Yoff',
    address: 'Route de l\'Aéroport, Yoff, Dakar',
    location: { latitude: 14.7444, longitude: -17.4877 }
  },
  {
    id: 'pharm127',
    name: 'Pharmacie Ouakam',
    address: 'Route de Ouakam, Ouakam, Dakar',
    location: { latitude: 14.7223, longitude: -17.4877 },
    onDuty: {
      start: '2024-01-14T20:00:00',
      end: '2024-01-15T08:00:00',
      phone: '+221 77 345 67 89'
    }
  },
  {
    id: 'pharm128',
    name: 'Pharmacie Liberté 6',
    address: 'Avenue Bourguiba, Liberté 6, Dakar',
    location: { latitude: 14.7142, longitude: -17.4562 }
  },
  {
    id: 'pharm129',
    name: 'Pharmacie Médina',
    address: 'Rue 11, Médina, Dakar',
    location: { latitude: 14.6823, longitude: -17.4477 }
  },
  {
    id: 'pharm130',
    name: 'Pharmacie HLM',
    address: 'HLM Grand Yoff, Dakar',
    location: { latitude: 14.7242, longitude: -17.4462 }
  }
];

// Export a default pharmacy for components that need a single pharmacy
export const mockPharmacy = mockPharmacies[0];

// Mock Medications
export const mockMedications: Medication[] = [
  { id: '1', name: 'Doliprane', description: 'Antidouleur et antipyrétique', dosage: '500mg' },
  { id: '2', name: 'Efferalgan', description: 'Antidouleur et antipyrétique', dosage: '1000mg' },
  { id: '3', name: 'Nivaquine', description: 'Antipaludéen', dosage: '100mg' },
  { id: '4', name: 'Amoxicilline', description: 'Antibiotique', dosage: '500mg' },
  { id: '5', name: 'Paracétamol', description: 'Antidouleur', dosage: '1g' },
  { id: '6', name: 'Ibuprofène', description: 'Anti-inflammatoire', dosage: '400mg' },
  { id: '7', name: 'Arthemeter', description: 'Antipaludéen', dosage: '80mg' },
  { id: '8', name: 'Lumefantrine', description: 'Antipaludéen', dosage: '480mg' },
  { id: '9', name: 'Metronidazole', description: 'Antibiotique', dosage: '500mg' },
  { id: '10', name: 'Omeprazole', description: 'Antiacide', dosage: '20mg' },
  { id: '11', name: 'Aspirine', description: 'Antidouleur et anti-inflammatoire', dosage: '500mg' },
  { id: '12', name: 'Ventoline', description: 'Bronchodilatateur', dosage: '100µg/dose' },
  { id: '13', name: 'Augmentin', description: 'Antibiotique', dosage: '1g' },
  { id: '14', name: 'Spasfon', description: 'Antispasmodique', dosage: '80mg' },
  { id: '15', name: 'Voltarene', description: 'Anti-inflammatoire', dosage: '50mg' }
];

// Mock Requests
export const mockRequests: MedicationRequest[] = [
  {
    id: 'req1',
    userId: 'user123',
    medications: [mockMedications[0], mockMedications[4]],
    status: 'pending',
    priority: 'high',
    createdAt: new Date().toISOString(),
    location: { latitude: 14.6937, longitude: -17.4441 }
  },
  {
    id: 'req2',
    userId: 'user123',
    medications: [mockMedications[2]],
    status: 'confirmed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    location: { latitude: 14.7127, longitude: -17.4842 },
    confirmedPharmacies: ['pharm123', 'pharm124', 'pharm125']
  },
  {
    id: 'req3',
    userId: 'user124',
    medications: [mockMedications[3], mockMedications[4]],
    status: 'pending',
    priority: 'low',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    location: { latitude: 14.7142, longitude: -17.4762 }
  },
  {
    id: 'req4',
    userId: 'user125',
    medications: [mockMedications[5], mockMedications[4]],
    status: 'preparing',
    priority: 'medium',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    location: { latitude: 14.7444, longitude: -17.4877 }
  },
  {
    id: 'req5',
    userId: 'user126',
    medications: [mockMedications[6], mockMedications[7]],
    status: 'confirmed',
    priority: 'high',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    location: { latitude: 14.6937, longitude: -17.4441 },
    confirmedPharmacies: ['pharm126', 'pharm127']
  },
  {
    id: 'req6',
    userId: 'user127',
    medications: [mockMedications[8]],
    status: 'confirmed',
    priority: 'high',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    location: { latitude: 14.7223, longitude: -17.4877 },
    confirmedPharmacies: ['pharm128', 'pharm129', 'pharm130']
  },
  {
    id: 'req7',
    userId: 'user124',
    medications: [mockMedications[9], mockMedications[10]],
    status: 'ready',
    priority: 'medium',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    location: { latitude: 14.7142, longitude: -17.4562 },
    confirmedPharmacies: ['pharm123']
  },
  {
    id: 'req8',
    userId: 'user125',
    medications: [mockMedications[11]],
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    location: { latitude: 14.7242, longitude: -17.4462 },
    confirmedPharmacies: ['pharm124']
  },
  {
    id: 'req9',
    userId: 'user126',
    medications: [mockMedications[12], mockMedications[13], mockMedications[14]],
    status: 'pending',
    priority: 'low',
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    location: { latitude: 14.6823, longitude: -17.4477 }
  },
  {
    id: 'req10',
    userId: 'user127',
    medications: [mockMedications[1], mockMedications[4]],
    status: 'confirmed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    location: { latitude: 14.7242, longitude: -17.4462 },
    confirmedPharmacies: ['pharm125', 'pharm126']
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order1',
    userId: 'user123',
    pharmacyId: 'pharm123',
    medications: [mockMedications[0]],
    status: 'preparing',
    totalAmount: 2500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'order2',
    userId: 'user123',
    pharmacyId: 'pharm124',
    medications: [mockMedications[2]],
    status: 'completed',
    totalAmount: 3000,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'order3',
    userId: 'user124',
    pharmacyId: 'pharm125',
    medications: [mockMedications[3], mockMedications[4]],
    status: 'pending',
    totalAmount: 5500,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'order4',
    userId: 'user125',
    pharmacyId: 'pharm126',
    medications: [mockMedications[5]],
    status: 'ready',
    totalAmount: 2000,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'order5',
    userId: 'user126',
    pharmacyId: 'pharm127',
    medications: [mockMedications[6], mockMedications[7]],
    status: 'completed',
    totalAmount: 7500,
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 'order6',
    userId: 'user127',
    pharmacyId: 'pharm128',
    medications: [mockMedications[8]],
    status: 'pending',
    totalAmount: 4000,
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'order7',
    userId: 'user124',
    pharmacyId: 'pharm129',
    medications: [mockMedications[9], mockMedications[10]],
    status: 'preparing',
    totalAmount: 6000,
    createdAt: new Date(Date.now() - 518400000).toISOString()
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user123',
    title: 'Confirmation de disponibilité',
    message: 'La Pharmacie Point E a confirmé la disponibilité de votre Doliprane',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif2',
    userId: 'user123',
    title: 'Commande prête',
    message: 'Votre commande de Nivaquine est prête à être récupérée',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif3',
    userId: 'user124',
    title: 'Nouvelle pharmacie disponible',
    message: 'La Pharmacie Mermoz peut maintenant traiter votre demande d\'Amoxicilline',
    read: false,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'notif4',
    userId: 'user125',
    title: 'Rappel de collecte',
    message: 'N\'oubliez pas de récupérer votre commande à la Pharmacie Yoff',
    read: false,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'notif5',
    userId: 'user126',
    title: 'Promotion',
    message: 'Profitez de -20% sur les médicaments génériques à la Pharmacie Point E',
    read: true,
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 'notif6',
    userId: 'user127',
    title: 'Confirmation de commande',
    message: 'Votre commande a été confirmée par la Pharmacie Ouakam',
    read: false,
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'notif7',
    userId: 'user124',
    title: 'Médicaments disponibles',
    message: 'Vos médicaments sont disponibles à la Pharmacie Liberté 6',
    read: true,
    createdAt: new Date(Date.now() - 518400000).toISOString()
  }
];

// Mock Statistics
export const mockStatistics: Statistics = {
  totalOrders: 234,
  totalUsers: 156,
  totalPharmacies: 45,
  averageResponseTime: 20,
  pendingRequests: 12
};

// Mock Geolocation (Dakar coordinates)
export const mockGeolocation = {
  getCurrentPosition: (callback: (position: { coords: { latitude: number; longitude: number } }) => void) => {
    callback({
      coords: {
        latitude: 14.6937,
        longitude: -17.4441
      }
    });
  }
};