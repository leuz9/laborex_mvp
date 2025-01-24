import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types';

export function useConfirmedPharmacies(pharmacyIds: string[] = []) {
  const [pharmacies, setPharmacies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!pharmacyIds.length) {
        setPharmacies([]);
        setLoading(false);
        return;
      }

      try {
        const pharmacyPromises = pharmacyIds.map(async (id) => {
          const docRef = doc(db, 'users', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
          }
          return null;
        });

        const results = await Promise.all(pharmacyPromises);
        setPharmacies(results.filter((p): p is User => p !== null));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
        setError('Erreur lors de la récupération des pharmacies');
        setLoading(false);
      }
    };

    setLoading(true);
    fetchPharmacies();
  }, [pharmacyIds]);

  return { pharmacies, loading, error };
}