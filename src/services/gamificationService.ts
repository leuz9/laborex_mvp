import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  where,
  Timestamp,
  increment,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { badgeService } from './badgeService';
import { notificationService } from './notificationService';

const COLLECTION_NAME = 'gamification';
const XP_PER_LEVEL = 1000;

export const gamificationService = {
  async addXP(userId: string, amount: number) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(userRef);
      const userData = userDoc.data();

      const currentXP = userData.points || 0;
      const newXP = currentXP + amount;
      const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

      // Mettre à jour les points et le niveau
      await updateDoc(userRef, {
        points: newXP,
        level: newLevel
      });

      // Vérifier si le niveau a augmenté
      if (newLevel > currentLevel) {
        await notificationService.createNotification({
          userId,
          type: 'achievement',
          title: 'Niveau supérieur !',
          message: `Félicitations ! Vous avez atteint le niveau ${newLevel}`,
          priority: 'high',
          metadata: { level: newLevel }
        });

        // Vérifier les badges liés au niveau
        await badgeService.checkUserBadgeEligibility(userId);
      }

      return { newXP, newLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  },

  async updateStreak(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(userRef);
      const userData = userDoc.data();

      const lastActive = new Date(userData.lastActive || 0);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = userData.streak?.current || 0;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, userData.streak?.longest || 0);

      await updateDoc(userRef, {
        streak: {
          current: newStreak,
          longest: newLongest,
          lastActive: today.toISOString()
        }
      });

      // Vérifier les badges liés aux séries
      await badgeService.checkUserBadgeEligibility(userId);

      return { current: newStreak, longest: newLongest };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  async getLeaderboard(maxResults = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        firestoreLimit(maxResults)
      );
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map((doc, index) => ({
        userId: doc.id,
        position: index + 1,
        name: doc.data().displayName || doc.data().email,
        points: doc.data().points || 0,
        level: doc.data().level || 1,
        avatar: doc.data().avatar
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
};