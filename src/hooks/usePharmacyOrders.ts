import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, User } from '../types';

interface OrderWithUser extends Order {
  user?: User;
}

export function usePharmacyOrders(pharmacyId: string) {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pharmacyId) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('pharmacyId', '==', pharmacyId)
      );

      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          try {
            const ordersPromises = snapshot.docs.map(async docSnapshot => {
              const orderData = docSnapshot.data() as Order;
              let userData: User | undefined;

              try {
                const userDocRef = doc(db, 'users', orderData.userId);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                  userData = {
                    id: userDocSnapshot.id,
                    ...userDocSnapshot.data()
                  } as User;
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }

              return {
                id: docSnapshot.id,
                ...orderData,
                user: userData
              };
            });

            const ordersWithUsers = await Promise.all(ordersPromises);
            const sortedOrders = ordersWithUsers.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
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
  }, [pharmacyId]);

  return { orders, loading, error };
}