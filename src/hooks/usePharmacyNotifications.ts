import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Notification } from '../types';

export async function createPharmacyNotification(pharmacyId: string, notification: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}