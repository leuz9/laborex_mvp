import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Award, Clock, Brain } from 'lucide-react';
import type { TeamMember } from '../types';
import { gamificationService } from '../services/gamificationService';
import { badgeService } from '../services/badgeService';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface AchievementsPanelProps {
  member: TeamMember;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ member }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    taskCompletion: 0,
    feedbackScore: 0,
    teamContribution: 0,
    innovationScore: 0
  });

  useEffect(() => {
    loadData();
  }, [member.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les badges de l'utilisateur
      const userBadges = member.badges || [];
      setBadges(userBadges);

      // Calculer les statistiques
      const completedTasks = await badgeService.getCompletedTasksCount(member.id);
      const feedbackCount = await badgeService.getFeedbackCount(member.id);
      
      setStats({
        taskCompletion: (completedTasks / 10) * 100, // Exemple: 10 tâches = 100%
        feedbackScore: (feedbackCount / 5) * 100, // Exemple: 5 feedbacks = 100%
        teamContribution: Math.min((member.points || 0) / 1000 * 100, 100), // Points sur 1000
        innovationScore: Math.min(((member.level || 1) - 1) / 10 * 100, 100) // Niveau sur 10
      });

      setError(null);
    } catch (err) {
      console.error('Error loading achievements data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Chargement des réalisations..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Niveau {member.level || 1}</h2>
            <p className="text-purple-200">
              {member.points || 0} points d'expérience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span>Badges</span>
            </div>
            <div className="text-2xl font-bold">{badges.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span>Série actuelle</span>
            </div>
            <div className="text-2xl font-bold">
              {member.streak?.current || 0} jours 🔥
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5" />
              <span>Progression</span>
            </div>
            <div className="text-2xl font-bold">
              {((member.points || 0) % 1000) / 10}%
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques</h3>
        <div className="space-y-4">
          {/* Complétion des tâches */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Complétion des tâches</span>
              <span className="font-medium">{stats.taskCompletion.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.taskCompletion}%` }}
              />
            </div>
          </div>

          {/* Score de feedback */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Score de feedback</span>
              <span className="font-medium">{stats.feedbackScore.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.feedbackScore}%` }}
              />
            </div>
          </div>

          {/* Contribution d'équipe */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Contribution d'équipe</span>
              <span className="font-medium">{stats.teamContribution.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.teamContribution}%` }}
              />
            </div>
          </div>

          {/* Score d'innovation */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Score d'innovation</span>
              <span className="font-medium">{stats.innovationScore.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.innovationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${
                badge.rarity === 'legendary' ? 'bg-yellow-500' :
                badge.rarity === 'epic' ? 'bg-purple-500' :
                badge.rarity === 'rare' ? 'bg-blue-500' :
                'bg-gray-500'
              } flex items-center justify-center`}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 mt-2">{badge.name}</h4>
              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {badge.rarity}
              </span>
              {badge.awardedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Obtenu le {new Date(badge.awardedAt.seconds * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;