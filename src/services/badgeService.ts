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
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Badge } from '../types/badge';
import { notificationService } from './notificationService';

const COLLECTION_NAME = 'badges';

export const badgeService = {
  async createBadge(data: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const badgeData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), badgeData);
      return { id: docRef.id, ...badgeData };
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  },

  async awardBadgeToUser(userId: string, badgeId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const badgeRef = doc(db, COLLECTION_NAME, badgeId);
      const badgeDoc = await getDocs(badgeRef);
      const badge = { id: badgeDoc.id, ...badgeDoc.data() } as Badge;

      // Ajouter le badge à l'utilisateur
      await updateDoc(userRef, {
        badges: arrayUnion({
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
          rarity: badge.rarity,
          awardedAt: Timestamp.now()
        })
      });

      // Ajouter les points XP
      await updateDoc(userRef, {
        points: increment(badge.xpReward)
      });

      // Envoyer une notification
      await notificationService.createNotification({
        userId,
        type: 'achievement',
        title: 'Nouveau badge obtenu !',
        message: `Vous avez obtenu le badge "${badge.name}"`,
        priority: 'medium',
        metadata: { badge: badge.id }
      });

      return badge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  },

  async checkUserBadgeEligibility(userId: string) {
    try {
      // Récupérer tous les badges
      const badgesQuery = query(collection(db, COLLECTION_NAME));
      const badgesSnapshot = await getDocs(badgesQuery);
      const badges = badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Badge[];

      // Récupérer les données de l'utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(userRef);
      const userData = userDoc.data();

      // Vérifier chaque badge
      for (const badge of badges) {
        // Vérifier si l'utilisateur n'a pas déjà le badge
        if (!userData.badges?.some((b: any) => b.id === badge.id)) {
          let isEligible = false;

          switch (badge.conditions.type) {
            case 'task_completion':
              const completedTasks = await this.getCompletedTasksCount(userId);
              isEligible = completedTasks >= badge.conditions.value;
              break;

            case 'feedback_received':
              const feedbackCount = await this.getFeedbackCount(userId);
              isEligible = feedbackCount >= badge.conditions.value;
              break;

            case 'skill_level':
              const skillLevel = userData.level || 1;
              isEligible = skillLevel >= badge.conditions.value;
              break;

            case 'streak':
              const streak = userData.streak?.current || 0;
              isEligible = streak >= badge.conditions.value;
              break;
          }

          if (isEligible) {
            await this.awardBadgeToUser(userId, badge.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      throw error;
    }
  },

  async getCompletedTasksCount(userId: string): Promise<number> {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignees', 'array-contains', userId),
        where('status', '==', 'done')
      );
      const snapshot = await getDocs(tasksQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting completed tasks count:', error);
      throw error;
    }
  },

  async getFeedbackCount(userId: string): Promise<number> {
    try {
      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('to.id', '==', userId)
      );
      const snapshot = await getDocs(feedbackQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting feedback count:', error);
      throw error;
    }
  }
};