import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types';

export function useRequestDetails(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserDetails = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!mounted) return;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            notifications: userData.notifications || []
          });
        } else {
          setError('Utilisateur non trouvé');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching user data:', err);
        setError('Erreur lors de la récupération des données utilisateur');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setError(null);
    fetchUserDetails();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { user, loading, error };
}