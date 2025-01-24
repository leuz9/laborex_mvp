import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, Medication } from '../types';

export function useOrders() {
  const createOrder = async (
    userId: string,
    pharmacyId: string,
    medications: Medication[],
    requestId: string
  ): Promise<boolean> => {
    try {
      // 1. Créer la commande
      const orderData: Omit<Order, 'id'> = {
        userId,
        pharmacyId,
        medications,
        status: 'pending',
        totalAmount: medications.reduce((total, med) => total + med.price, 0),
        createdAt: new Date().toISOString()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 2. Mettre à jour la demande avec l'ID de la commande
      await updateDoc(doc(db, 'requests', requestId), {
        orderId: orderRef.id,
        status: 'preparing',
        updatedAt: new Date().toISOString()
      });

      // 3. Créer une notification pour la pharmacie
      await addDoc(collection(db, 'notifications'), {
        userId: pharmacyId,
        title: 'Nouvelle commande',
        message: `Un client a passé une commande pour ${medications.length} médicament(s)`,
        read: false,
        type: 'new_order',
        orderId: orderRef.id,
        createdAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      return false;
    }
  };

  return { createOrder };
}