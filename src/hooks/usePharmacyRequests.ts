import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import type { MedicationRequest, User } from '../types';

interface RequestWithUser extends MedicationRequest {
  user?: User;
}

export function usePharmacyRequests(pharmacyId: string) {
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pharmacyId) {
      setLoading(false);
      return;
    }

    try {
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          try {
            const requestsPromises = snapshot.docs.map(async docSnapshot => {
              const requestData = docSnapshot.data() as MedicationRequest;
              let userData: User | undefined;

              // Récupérer les informations de l'utilisateur seulement pour les demandes confirmées
              if (requestData.status === 'confirmed') {
                try {
                  const userRef = doc(db, 'users', requestData.userId);
                  const userSnapshot = await getDoc(userRef);
                  if (userSnapshot.exists()) {
                    userData = {
                      id: userSnapshot.id,
                      ...userSnapshot.data()
                    } as User;
                  }
                } catch (error) {
                  console.error('Error fetching user data:', error);
                }
              }

              return {
                id: docSnapshot.id,
                ...requestData,
                user: userData
              };
            });

            const requestsWithUsers = await Promise.all(requestsPromises);
            setRequests(requestsWithUsers);
            setLoading(false);
          } catch (error) {
            console.error('Error processing requests:', error);
            setError('Erreur lors du traitement des demandes');
            setLoading(false);
          }
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
  }, [pharmacyId]);

  const confirmAvailability = async (requestId: string): Promise<boolean> => {
    try {
      // 1. Récupérer les informations de la demande
      const requestRef = doc(db, 'requests', requestId);
      const requestSnapshot = await getDoc(requestRef);
      
      if (!requestSnapshot.exists()) {
        throw new Error('Demande non trouvée');
      }

      const requestData = requestSnapshot.data() as MedicationRequest;

      // 2. Récupérer les informations de la pharmacie
      const pharmacyRef = doc(db, 'users', pharmacyId);
      const pharmacySnapshot = await getDoc(pharmacyRef);
      
      if (!pharmacySnapshot.exists()) {
        throw new Error('Pharmacie non trouvée');
      }

      const pharmacyData = pharmacySnapshot.data();

      // 3. Mettre à jour le statut de la demande
      await updateDoc(requestRef, {
        status: 'confirmed',
        confirmedPharmacies: arrayUnion(pharmacyId),
        updatedAt: new Date().toISOString()
      });

      // 4. Créer une notification pour le client
      await addDoc(collection(db, 'notifications'), {
        userId: requestData.userId,
        title: 'Médicaments disponibles',
        message: `La pharmacie ${pharmacyData.name} a confirmé la disponibilité de vos médicaments`,
        read: false,
        type: 'availability_confirmed',
        requestId: requestId,
        pharmacyId: pharmacyId,
        createdAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error confirming availability:', error);
      return false;
    }
  };

  const setUnavailable = async (requestId: string, restockDate: string): Promise<boolean> => {
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        [`unavailablePharmacies.${pharmacyId}`]: {
          restockDate,
          updatedAt: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Error setting unavailable:', error);
      return false;
    }
  };

  return {
    requests,
    loading,
    error,
    confirmAvailability,
    setUnavailable
  };
}