import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rating, User } from '../types';

export function usePharmacyRatings(pharmacyId: string) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const setupListener = async () => {
      if (!pharmacyId) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const docRef = doc(db, 'users', pharmacyId);
        unsubscribe = onSnapshot(
          docRef,
          (docSnapshot) => {
            if (!mounted) return;

            if (docSnapshot.exists()) {
              const userData = docSnapshot.data() as User;
              setRatings(userData.ratings?.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ) || []);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching ratings:', err);
            if (mounted) {
              setError('Erreur lors du chargement des notes');
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error('Error setting up ratings listener:', error);
        if (mounted) {
          setError('Erreur lors de la configuration du listener');
          setLoading(false);
        }
      }
    };

    setupListener();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [pharmacyId]);

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
    : 0;

  return {
    ratings,
    loading,
    error,
    averageRating,
    totalRatings: ratings.length
  };
}