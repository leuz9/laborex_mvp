import React, { useEffect, useState } from 'react';
import { Trophy, Star, Target, TrendingUp, Award, Crown, Zap, Users, Loader2, Brain, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { gamificationService } from '../services/gamificationService';
import { badgeService } from '../services/badgeService';
import type { Badge } from '../types/badge';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const GamificationHub: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [leaderboardData] = await Promise.all([
        gamificationService.getLeaderboard(10)
      ]);
      setLeaderboard(leaderboardData);
      setError(null);
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Chargement des données de gamification..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  if (!userProfile) {
    return <div>Aucun profil trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profil et Niveau */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={userProfile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
              alt={userProfile.displayName || userProfile.email}
              className="w-16 h-16 rounded-full border-2 border-white"
            />
            <div>
              <h2 className="text-2xl font-bold">{userProfile.displayName || userProfile.email}</h2>
              <div className="flex items-center gap-2 text-purple-200">
                <Crown className="w-4 h-4" />
                <span>Niveau {userProfile.level || 1}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Points XP</div>
            <div className="text-3xl font-bold">{userProfile.points || 0}</div>
          </div>
        </div>

        <div className="w-full bg-white/20 rounded-full h-2 mb-6">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${((userProfile.points || 0) % 1000) / 10}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span>Badges Gagnés</span>
            </div>
            <div className="text-2xl font-bold">{userProfile.badges?.length || 0}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span>Série actuelle</span>
            </div>
            <div className="text-2xl font-bold">
              {userProfile.streak?.current || 0} jours 🔥
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5" />
              <span>Niveau moyen</span>
            </div>
            <div className="text-2xl font-bold">
              {userProfile.level || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(userProfile.badges || []).map((badge: any, index) => (
            <div 
              key={index} 
              className="text-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedBadge(badge)}
            >
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

      {/* Classement */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Classement</h3>
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div 
              key={user.userId}
              className={`flex items-center justify-between p-4 ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'bg-gray-50'
              } rounded-lg`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' :
                  'bg-gray-200'
                } text-white font-bold`}>
                  {index + 1}
                </div>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">Niveau {user.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{user.points} XP</div>
                {user.userId === currentUser.uid && (
                  <div className="text-xs text-blue-600">Vous</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale de badge */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${
                  selectedBadge.rarity === 'legendary' ? 'bg-yellow-500' :
                  selectedBadge.rarity === 'epic' ? 'bg-purple-500' :
                  selectedBadge.rarity === 'rare' ? 'bg-blue-500' :
                  'bg-gray-500'
                } flex items-center justify-center`}>
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedBadge.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedBadge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    selectedBadge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    selectedBadge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBadge.rarity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-4">{selectedBadge.description}</p>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Récompense : {selectedBadge.xpReward} XP</span>
              </div>
              <div className="text-sm text-gray-500">
                Obtenu le {new Date(selectedBadge.awardedAt.seconds * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationHub;