import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, X, ChevronDown, ChevronUp, Star, Brain, Award } from 'lucide-react';
import TeamList from './TeamList';
import CreateTeamMemberForm from './forms/CreateTeamMemberForm';
import { teamService } from '../services/teamService';
import type { TeamMember } from '../types/team';
import { useAuth } from '../contexts/AuthContext';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const Team: React.FC = () => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'superadmin';
  const isViewer = userProfile?.role === 'viewer';

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    search: '',
    roles: [] as string[],
    levelRange: {
      min: '',
      max: ''
    },
    skills: [] as string[],
    sortBy: 'name' as 'name' | 'level' | 'points',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Valeurs uniques pour les filtres
  const [uniqueRoles, setUniqueRoles] = useState<string[]>([]);
  const [uniqueSkills, setUniqueSkills] = useState<string[]>([]);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  useEffect(() => {
    // Extraire les valeurs uniques pour les filtres
    const roles = Array.from(new Set(teamMembers.map(m => m.role)));
    const skills = Array.from(new Set(teamMembers.flatMap(m => m.skills)));
    
    setUniqueRoles(roles);
    setUniqueSkills(skills);
  }, [teamMembers]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await teamService.getAllMembers();
      setTeamMembers(members);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (newMember: any) => {
    try {
      setLoading(true);
      const member = await teamService.createMember({
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        avatar: newMember.avatar,
        level: 1,
        points: 0,
        badges: [],
        skills: newMember.skills
      });

      setTeamMembers(prev => [member, ...prev]);
      setShowAddMemberForm(false);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      roles: [],
      levelRange: {
        min: '',
        max: ''
      },
      skills: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleRole = (role: string) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  // Filtrer et trier les membres
  const filteredMembers = teamMembers
    .filter(member => {
      // Filtre de recherche
      if (filters.search && !member.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filtre de rôles
      if (filters.roles.length > 0 && !filters.roles.includes(member.role)) {
        return false;
      }

      // Filtre de niveau
      if (filters.levelRange.min && member.level < parseInt(filters.levelRange.min)) {
        return false;
      }
      if (filters.levelRange.max && member.level > parseInt(filters.levelRange.max)) {
        return false;
      }

      // Filtre de compétences
      if (filters.skills.length > 0 && !filters.skills.every(skill => member.skills.includes(skill))) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'level':
          return (a.level - b.level) * order;
        case 'points':
          return (a.points - b.points) * order;
        default:
          return a.name.localeCompare(b.name) * order;
      }
    });

  if (loading && !teamMembers.length) {
    return <LoadingState message="Chargement de l'équipe..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadTeamMembers} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Équipe</h2>
              <p className="text-blue-100">Gérez votre équipe et leurs rôles</p>
            </div>
          </div>
          {!isViewer && (
            <button
              onClick={() => setShowAddMemberForm(true)}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un membre
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Membres actifs</div>
            <div className="text-3xl font-bold">{teamMembers.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Niveau moyen</div>
            <div className="text-3xl font-bold">
              {teamMembers.length > 0
                ? (teamMembers.reduce((acc, member) => acc + member.level, 0) / teamMembers.length).toFixed(1)
                : '0'}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Badges gagnés</div>
            <div className="text-3xl font-bold">
              {teamMembers.reduce((acc, member) => acc + member.badges.length, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col gap-4">
          {/* Barre de recherche et toggle des filtres */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtres avancés
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rôles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôles
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uniqueRoles.map((role) => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.roles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Niveau */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Min"
                        value={filters.levelRange.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          levelRange: { ...prev.levelRange, min: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Max"
                        value={filters.levelRange.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          levelRange: { ...prev.levelRange, max: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        sortBy: e.target.value as typeof filters.sortBy
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Nom</option>
                      <option value="level">Niveau</option>
                      <option value="points">Points</option>
                    </select>
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title={filters.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Compétences */}
              {uniqueSkills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.skills.includes(skill)
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Réinitialiser les filtres */}
              {(filters.search || filters.roles.length > 0 || filters.skills.length > 0 ||
                filters.levelRange.min || filters.levelRange.max || 
                filters.sortBy !== 'name' || filters.sortOrder !== 'asc') && (
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Liste des membres */}
      <TeamList 
        members={filteredMembers} 
        onMemberUpdated={loadTeamMembers}
      />

      {/* Modal d'ajout de membre */}
      {showAddMemberForm && (
        <CreateTeamMemberForm
          onSubmit={handleAddMember}
          onClose={() => setShowAddMemberForm(false)}
        />
      )}
    </div>
  );
};

export default Team;