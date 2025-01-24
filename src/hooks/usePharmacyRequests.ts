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
      const q = query(
        collection(db, 'requests'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          const requestsPromises = snapshot.docs.map(async doc => {
            const requestData = doc.data() as MedicationRequest;
            let userData: User | undefined;

            // Récupérer les informations de l'utilisateur seulement pour les demandes confirmées
            if (requestData.status === 'confirmed') {
              try {
                const userDoc = await getDoc(doc(db, 'users', requestData.userId));
                if (userDoc.exists()) {
                  userData = {
                    id: userDoc.id,
                    ...userDoc.data()
                  } as User;
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }

            return {
              id: doc.id,
              ...requestData,
              user: userData
            };
          });

          const requestsWithUsers = await Promise.all(requestsPromises);
          setRequests(requestsWithUsers);
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
  }, [pharmacyId]);

  const confirmAvailability = async (requestId: string): Promise<boolean> => {
    console.log('Starting confirmAvailability for request:', requestId);
    try {
      // 1. Récupérer les informations de la demande
      const requestRef = doc(db, 'requests', requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        console.error('Request not found:', requestId);
        throw new Error('Demande non trouvée');
      }

      const requestData = requestDoc.data() as MedicationRequest;
      console.log('Request data:', requestData);

      // 2. Récupérer les informations de la pharmacie
      const pharmacyRef = doc(db, 'users', pharmacyId);
      const pharmacyDoc = await getDoc(pharmacyRef);
      if (!pharmacyDoc.exists()) {
        console.error('Pharmacy not found:', pharmacyId);
        throw new Error('Pharmacie non trouvée');
      }

      const pharmacyData = pharmacyDoc.data();
      console.log('Pharmacy data:', pharmacyData);

      // 3. Mettre à jour le statut de la demande
      console.log('Updating request status...');
      await updateDoc(requestRef, {
        status: 'confirmed',
        confirmedPharmacies: arrayUnion(pharmacyId),
        updatedAt: new Date().toISOString()
      });
      console.log('Request status updated successfully');

      // 4. Créer une notification pour le client
      console.log('Creating notification for user:', requestData.userId);
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        userId: requestData.userId,
        title: 'Médicaments disponibles',
        message: `La pharmacie ${pharmacyData.name} a confirmé la disponibilité de vos médicaments`,
        read: false,
        type: 'availability_confirmed',
        requestId: requestId,
        pharmacyId: pharmacyId,
        createdAt: new Date().toISOString()
      });
      console.log('Notification created successfully:', notificationRef.id);

      return true;
    } catch (error) {
      console.error('Error confirming availability:', error);
      return false;
    }
  };

  const setUnavailable = async (requestId: string, restockDate: string): Promise<boolean> => {
    console.log('Setting medication unavailable:', { requestId, restockDate });
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        [`unavailablePharmacies.${pharmacyId}`]: {
          restockDate,
          updatedAt: new Date().toISOString()
        }
      });
      console.log('Medication marked as unavailable successfully');
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