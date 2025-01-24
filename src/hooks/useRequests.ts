import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { MedicationRequest } from '../types';
import { createPharmacyNotification } from './usePharmacyNotifications';

export function useRequests(userId: string) {
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'requests'),
        where('userId', '==', userId),
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
  }, [userId]);

  const createRequest = async (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => {
    try {
      // 1. Créer la demande
      const requestData = {
        ...request,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      const docRef = await addDoc(collection(db, 'requests'), requestData);

      // 2. Récupérer toutes les pharmacies
      const pharmaciesSnapshot = await getDocs(collection(db, 'users'));
      const pharmacies = pharmaciesSnapshot.docs
        .filter(doc => doc.data().role === 'pharmacy')
        .map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. Créer une notification pour chaque pharmacie
      const notificationPromises = pharmacies.map(pharmacy => 
        createPharmacyNotification(pharmacy.id, {
          userId: pharmacy.id,
          title: 'Nouvelle demande de médicaments',
          message: `Un client recherche ${request.medications.map(m => m.name).join(', ')}`,
          read: false,
          type: 'new_request',
          requestId: docRef.id
        })
      );

      await Promise.all(notificationPromises);

      return true;
    } catch (error) {
      console.error('Error creating request:', error);
      return false;
    }
  };

  const updateRequest = async (requestId: string, data: Partial<MedicationRequest>) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      return false;
    }
  };

  return { requests, loading, error, createRequest, updateRequest };
}