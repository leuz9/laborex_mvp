import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types';

export function usePharmacyDetails(pharmacyId: string) {
  const [pharmacy, setPharmacy] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const docRef = doc(db, 'users', pharmacyId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPharmacy({
            id: docSnap.id,
            ...docSnap.data()
          } as User);
        } else {
          setError('Pharmacie non trouvée');
        }
      } catch (err) {
        console.error('Error fetching pharmacy:', err);
        setError('Erreur lors de la récupération des informations de la pharmacie');
      } finally {
        setLoading(false);
      }
    };

    if (pharmacyId) {
      fetchPharmacy();
    }
  }, [pharmacyId]);

  return { pharmacy, loading, error };
}