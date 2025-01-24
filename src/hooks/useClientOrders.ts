import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order } from '../types';

export function useClientOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          try {
            const newOrders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Order));
            setOrders(newOrders);
            setLoading(false);
          } catch (error) {
            console.error('Error processing orders:', error);
            setError('Erreur lors du traitement des commandes');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching orders:', err);
          setError('Erreur lors du chargement des commandes');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up orders listener:', error);
      setError('Erreur lors de la configuration du listener');
      setLoading(false);
    }
  }, [userId]);

  return { orders, loading, error };
}