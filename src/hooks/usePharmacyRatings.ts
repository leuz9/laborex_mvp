import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rating, User } from '../types';

export function usePharmacyRatings(pharmacyId: string) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pharmacyId) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        doc(db, 'users', pharmacyId),
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as User;
            setRatings(userData.ratings || []);
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching ratings:', err);
          setError('Erreur lors du chargement des notes');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up ratings listener:', error);
      setError('Erreur lors de la configuration du listener');
      setLoading(false);
    }
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