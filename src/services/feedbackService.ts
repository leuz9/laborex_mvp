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
import type { FeedbackEntry } from '../types/feedback';

const COLLECTION_NAME = 'feedback';

export const feedbackService = {
  async createFeedback(data: Omit<FeedbackEntry, 'id' | 'timestamp' | 'reactions'>) {
    try {
      const feedbackData = {
        ...data,
        timestamp: Timestamp.now(),
        reactions: []
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), feedbackData);
      return { id: docRef.id, ...feedbackData };
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  async updateFeedback(id: string, data: Partial<FeedbackEntry>) {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  async deleteFeedback(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  async getFeedbackForUser(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('to.id', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackEntry[];
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  },

  async addReaction(feedbackId: string, userId: string, type: 'like' | 'helpful') {
    try {
      const feedbackRef = doc(db, COLLECTION_NAME, feedbackId);
      const reaction = {
        type,
        userId,
        timestamp: Timestamp.now()
      };

      await updateDoc(feedbackRef, {
        reactions: [...(await this.getFeedback(feedbackId)).reactions, reaction]
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  async getFeedback(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDocs(docRef);
      if (!docSnap.exists) {
        throw new Error('Feedback not found');
      }
      return { id: docSnap.id, ...docSnap.data() } as FeedbackEntry;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  }
};