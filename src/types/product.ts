import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'draft' | 'planning' | 'in_development' | 'testing' | 'review' | 'deployed' | 'maintenance' | 'archived' | 'on_hold';
  category?: string;
  imageUrl?: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    repository?: string;
    technologies: string[];
    teamSize: number;
    complexity: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high';
    deliverables: string[];
    dependencies?: string[];
    environments?: {
      dev?: string;
      staging?: string;
      prod?: string;
    };
    tags?: string[];
    client?: string;
    budget?: {
      allocated: number;
      spent: number;
      currency: string;
    };
  };
}

export const PRODUCT_STATUS_LABELS: Record<Product['status'], string> = {
  draft: 'Brouillon',
  planning: 'En planification',
  in_development: 'En développement',
  testing: 'En test',
  review: 'En revue',
  deployed: 'Déployé',
  maintenance: 'En maintenance',
  archived: 'Archivé',
  on_hold: 'En pause'
};

export const PRODUCT_STATUS_COLORS: Record<Product['status'], { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  planning: { bg: 'bg-blue-100', text: 'text-blue-800' },
  in_development: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  testing: { bg: 'bg-purple-100', text: 'text-purple-800' },
  review: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  deployed: { bg: 'bg-green-100', text: 'text-green-800' },
  maintenance: { bg: 'bg-orange-100', text: 'text-orange-800' },
  archived: { bg: 'bg-red-100', text: 'text-red-800' },
  on_hold: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export const PRODUCT_STATUS_DESCRIPTIONS: Record<Product['status'], string> = {
  draft: 'Projet en cours de définition, non encore validé',
  planning: 'Phase de planification et de définition des spécifications',
  in_development: 'Développement actif en cours',
  testing: 'Phase de tests et de correction des bugs',
  review: 'En attente de validation client/équipe',
  deployed: 'Projet en production et fonctionnel',
  maintenance: 'Phase de maintenance et d\'amélioration continue',
  archived: 'Projet terminé et archivé',
  on_hold: 'Projet temporairement suspendu'
};

export const COMPLEXITY_LABELS = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée'
};

export const PRIORITY_LABELS = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute'
};