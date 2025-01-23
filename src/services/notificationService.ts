import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Notification } from '../types/notification';

const COLLECTION_NAME = 'notifications';

export const notificationService = {
  async createNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    try {
      const notificationData = {
        ...data,
        timestamp: Timestamp.now(),
        read: false
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), notificationData);
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async markAsRead(id: string) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        read: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async deleteNotification(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async getNotificationsForUser(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  async getUnreadCount(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
};