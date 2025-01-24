import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Order, Medication } from '../types';

export function useOrders() {
  const createOrder = async (
    userId: string,
    pharmacyId: string,
    medications: Medication[],
    requestId: string
  ): Promise<{ success: boolean; orderId?: string }> => {
    try {
      // 1. Créer la commande
      const orderData: Omit<Order, 'id'> = {
        userId,
        pharmacyId,
        medications,
        status: 'pending',
        totalAmount: medications.reduce((total, med) => total + med.price, 0),
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
        requestId
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 2. Mettre à jour la demande avec l'ID de la commande
      await updateDoc(doc(db, 'requests', requestId), {
        orderId: orderRef.id,
        updatedAt: new Date().toISOString()
      });

      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false };
    }
  };

  const markOrderAsPaid = async (orderId: string, paymentMethod: Order['paymentMethod']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data() as Order;
      const timestamp = new Date().toISOString();

      // Pour le paiement en espèces, on met juste à jour le mode de paiement
      // Le statut sera mis à jour lors de la livraison
      if (paymentMethod === 'cash') {
        await updateDoc(orderRef, {
          paymentMethod,
          paymentStatus: 'pending', // Reste en attente jusqu'à la livraison
          status: 'preparing', // On passe quand même en préparation
          updatedAt: timestamp
        });

        // Mettre à jour la demande associée
        if (orderData.requestId) {
          await updateDoc(doc(db, 'requests', orderData.requestId), {
            status: 'preparing',
            updatedAt: timestamp
          });
        }

        // Notifications
        await Promise.all([
          // Pour la pharmacie
          addDoc(collection(db, 'notifications'), {
            userId: orderData.pharmacyId,
            title: 'Nouvelle commande à préparer',
            message: 'Une commande avec paiement à la livraison est à préparer',
            read: false,
            type: 'order_preparing',
            orderId,
            createdAt: timestamp
          }),
          // Pour le client
          addDoc(collection(db, 'notifications'), {
            userId: orderData.userId,
            title: 'Commande confirmée',
            message: 'Votre commande est en cours de préparation. Paiement à effectuer à la livraison.',
            read: false,
            type: 'order_preparing',
            orderId,
            createdAt: timestamp
          })
        ]);
      } else {
        // Pour les autres modes de paiement, comportement normal
        await updateDoc(orderRef, {
          status: 'paid',
          paymentStatus: 'completed',
          paymentMethod,
          updatedAt: timestamp
        });

        // Mettre à jour la demande associée
        if (orderData.requestId) {
          await updateDoc(doc(db, 'requests', orderData.requestId), {
            status: 'preparing',
            updatedAt: timestamp
          });
        }

        // Notifications
        await Promise.all([
          // Pour la pharmacie
          addDoc(collection(db, 'notifications'), {
            userId: orderData.pharmacyId,
            title: 'Nouvelle commande à préparer',
            message: 'Une commande a été payée et est prête à être préparée',
            read: false,
            type: 'order_paid',
            orderId,
            createdAt: timestamp
          }),
          // Pour le client
          addDoc(collection(db, 'notifications'), {
            userId: orderData.userId,
            title: 'Paiement confirmé',
            message: 'Votre paiement a été confirmé. La pharmacie va préparer votre commande.',
            read: false,
            type: 'order_paid',
            orderId,
            createdAt: timestamp
          })
        ]);
      }

      return true;
    } catch (error) {
      console.error('Error marking order as paid:', error);
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data() as Order;
      const timestamp = new Date().toISOString();

      // Mise à jour spéciale pour les commandes en espèces
      const updateData: Partial<Order> = {
        status: newStatus,
        updatedAt: timestamp
      };

      // Si c'est un paiement en espèces et que la commande est terminée
      // on met à jour aussi le statut de paiement
      if (orderData.paymentMethod === 'cash' && newStatus === 'completed') {
        updateData.paymentStatus = 'completed';
      }

      // Ajouter les horodatages appropriés
      if (newStatus === 'preparing') {
        updateData.preparedAt = timestamp;
      } else if (newStatus === 'ready') {
        updateData.readyAt = timestamp;
      } else if (newStatus === 'completed') {
        updateData.completedAt = timestamp;
      }

      await updateDoc(orderRef, updateData);

      // Mettre à jour la demande associée
      if (orderData.requestId) {
        await updateDoc(doc(db, 'requests', orderData.requestId), {
          status: newStatus,
          updatedAt: timestamp
        });
      }

      // Créer une notification pour le client
      const notificationBase = {
        userId: orderData.userId,
        orderId,
        read: false,
        createdAt: timestamp
      };

      if (newStatus === 'preparing') {
        await addDoc(collection(db, 'notifications'), {
          ...notificationBase,
          title: 'Commande en préparation',
          message: 'Votre commande est en cours de préparation',
          type: 'order_preparing'
        });
      } else if (newStatus === 'ready') {
        await addDoc(collection(db, 'notifications'), {
          ...notificationBase,
          title: 'Commande prête',
          message: orderData.paymentMethod === 'cash' 
            ? 'Votre commande est prête. N\'oubliez pas de préparer le paiement en espèces.'
            : 'Votre commande est prête à être récupérée',
          type: 'order_ready'
        });
      } else if (newStatus === 'completed') {
        await addDoc(collection(db, 'notifications'), {
          ...notificationBase,
          title: 'Commande terminée',
          message: orderData.paymentMethod === 'cash'
            ? 'Votre commande a été livrée et payée avec succès'
            : 'Votre commande a été récupérée avec succès',
          type: 'order_completed'
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  return { createOrder, markOrderAsPaid, updateOrderStatus };
}