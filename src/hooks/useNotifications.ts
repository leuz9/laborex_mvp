import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Notification } from '../types';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Créer la requête avec l'index composite
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          try {
            const newNotifications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Notification));
            setNotifications(newNotifications);
            setLoading(false);
          } catch (error) {
            console.error('Error processing notifications:', error);
            setError('Erreur lors du traitement des notifications');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching notifications:', err);
          setError('Erreur lors du chargement des notifications');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      setError('Erreur lors de la configuration du listener');
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  return { notifications, loading, error, markAsRead };
}