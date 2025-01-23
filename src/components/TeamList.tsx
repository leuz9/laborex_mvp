import React, { useState } from 'react';
import { Star, Award, TrendingUp, MessageSquare, Trophy, X, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { TeamMember } from '../types/team';
import AchievementsPanel from './AchievementsPanel';
import { teamService } from '../services/teamService';
import ViewMemberModal from './modals/ViewMemberModal';
import EditMemberModal from './modals/EditMemberModal';

interface TeamListProps {
  members: TeamMember[];
  onMemberUpdated?: () => void;
}

const TeamList: React.FC<TeamListProps> = ({ members, onMemberUpdated }) => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'superadmin';
  const isViewer = userProfile?.role === 'viewer';

  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedMemberForAchievements, setSelectedMemberForAchievements] = useState<TeamMember | null>(null);
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteMember = async (member: TeamMember) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.name} ?`)) {
      return;
    }

    try {
      setLoading(true);
      await teamService.deleteMember(member.id);
      onMemberUpdated?.();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du membre');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (member: TeamMember) => {
    try {
      setLoading(true);
      await teamService.updateMember(member.id, member);
      setEditMember(null);
      onMemberUpdated?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du membre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Niv. {member.level}</span>
                </div>
                <div className="text-xs text-gray-500">{member.points} pts</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setViewMember(member)}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                title="Voir"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedMemberForAchievements(member)}
                className="p-2 text-gray-600 hover:text-purple-600 rounded-lg"
                title="Réalisations"
              >
                <Trophy className="w-4 h-4" />
              </button>
              {!isViewer && (
                <button
                  onClick={() => setEditMember(member)}
                  className="p-2 text-gray-600 hover:text-green-600 rounded-lg"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {isSuperAdmin && (
                <button
                  onClick={() => handleDeleteMember(member)}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg"
                  title="Supprimer"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal des réalisations */}
      {selectedMemberForAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Réalisations de {selectedMemberForAchievements.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMemberForAchievements(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AchievementsPanel member={selectedMemberForAchievements} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {viewMember && (
        <ViewMemberModal
          member={viewMember}
          onClose={() => setViewMember(null)}
        />
      )}

      {/* Modal d'édition */}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSubmit={handleEditSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TeamList;