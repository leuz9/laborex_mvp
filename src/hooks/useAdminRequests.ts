import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { MedicationRequest } from '../types';

export function useAdminRequests() {
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'requests'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const newRequests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as MedicationRequest));
          setRequests(newRequests);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching requests:', err);
          setError('Erreur lors du chargement des demandes');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up requests listener:', error);
      setError('Erreur lors de la configuration du listener');
      setLoading(false);
    }
  }, []);

  return { requests, loading, error };
}