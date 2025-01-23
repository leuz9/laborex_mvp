import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Medication } from '../types';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newMedications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medication));
        setMedications(newMedications);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching medications:', err);
        setError('Erreur lors du chargement des médicaments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { medications, loading, error };
}