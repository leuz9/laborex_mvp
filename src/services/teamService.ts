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
import type { TeamMember } from '../types/team';

const COLLECTION_NAME = 'teamMembers';
const DEFAULT_AVATAR = 'https://vc4a.com/ventures/eyone/';

export const teamService = {
  async createMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const memberData = {
        ...data,
        avatar: data.avatar || DEFAULT_AVATAR,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), memberData);
      return { id: docRef.id, ...memberData };
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  async updateMember(id: string, data: Partial<TeamMember>) {
    try {
      const updateData = {
        ...data,
        avatar: data.avatar || DEFAULT_AVATAR,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  async deleteMember(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  async getAllMembers() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        avatar: doc.data().avatar || DEFAULT_AVATAR
      })) as TeamMember[];
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  },

  async searchMembers(searchTerm: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        avatar: doc.data().avatar || DEFAULT_AVATAR
      })) as TeamMember[];
    } catch (error) {
      console.error('Error searching team members:', error);
      throw error;
    }
  }
};