import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gamificationService } from '../services/gamificationService';
import type { GamificationProfile } from '../types/gamification';

export function useGamification() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await gamificationService.getProfile(currentUser.uid);
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error loading gamification profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number) => {
    if (!currentUser) return;
    try {
      const result = await gamificationService.addXP(currentUser.uid, amount);
      await loadProfile(); // Recharger le profil pour avoir les données à jour
      return result;
    } catch (err) {
      console.error('Error adding XP:', err);
      throw err;
    }
  };

  const awardBadge = async (badge: string) => {
    if (!currentUser) return;
    try {
      await gamificationService.awardBadge(currentUser.uid, badge);
      await loadProfile();
    } catch (err) {
      console.error('Error awarding badge:', err);
      throw err;
    }
  };

  const updateStreak = async () => {
    if (!currentUser) return;
    try {
      const result = await gamificationService.updateStreak(currentUser.uid);
      await loadProfile();
      return result;
    } catch (err) {
      console.error('Error updating streak:', err);
      throw err;
    }
  };

  const checkAchievements = async () => {
    if (!currentUser) return;
    try {
      await gamificationService.checkAchievements(currentUser.uid);
      await loadProfile();
    } catch (err) {
      console.error('Error checking achievements:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    addXP,
    awardBadge,
    updateStreak,
    checkAchievements,
    refresh: loadProfile
  };
}