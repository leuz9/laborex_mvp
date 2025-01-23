
import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, Users, Battery, AlertTriangle, Filter, Search, X, Calendar, Brain, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { TeamMember } from '../../types/team';
import { teamService } from '../../services/teamService';
import { taskService } from '../../services/taskService';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';

interface ResourceUtilizationProps {
  members: TeamMember[];
  timeframe: 'week' | 'month' | 'quarter';
}

const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({ members, timeframe }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // États des filtres
  const [filters, setFilters] = useState({
    member: 'all',
    utilization: 'all' as 'all' | 'overutilized' | 'underutilized',
    skills: [] as string[],
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tasksData = await taskService.getAllTasks();
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des métriques d'utilisation
  const utilizationMetrics = members.map(member => {
    const memberTasks = tasks.filter(t => 
      t.assignees.some((a: any) => a.id === member.id)
    );

    const totalHours = memberTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const completedHours = memberTasks
      .filter(t => t.status === 'done')
      .reduce((acc, t) => acc + (t.actualHours || t.estimatedHours || 0), 0);

    const utilizationRate = (completedHours / (40 * 4)) * 100; // 40 heures par semaine * 4 semaines
    const efficiency = completedHours > 0 ? (completedHours / totalHours) * 100 : 0;

    return {
      member,
      tasks: memberTasks.length,
      totalHours,
      completedHours,
      utilizationRate,
      efficiency,
      status: utilizationRate > 90 ? 'overutilized' :
              utilizationRate < 50 ? 'underutilized' : 'optimal'
    };
  });

  const resetFilters = () => {
    setFilters({
      member: 'all',
      utilization: 'all',
      skills: [],
      dateRange: {
        start: '',
        end: ''
      },
      search: ''
    });
  };

  if (loading) {
    return <LoadingState message="Chargement des données d'utilisation..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  // Statistiques globales
  const globalStats = {
    averageUtilization: utilizationMetrics.reduce((acc, m) => acc + m.utilizationRate, 0) / members.length,
    overutilized: utilizationMetrics.filter(m => m.status === 'overutilized').length,
    underutilized: utilizationMetrics.filter(m => m.status === 'underutilized').length,
    optimal: utilizationMetrics.filter(m => m.status === 'optimal').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Battery className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Utilisation des ressources</h2>
            <p className="text-purple-100">Analyse de la charge de travail et de l'efficacité</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5" />
              <span>Utilisation moyenne</span>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.averageUtilization.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Surcharge</span>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.overutilized}
            </div>
            <div className="text-sm text-purple-200">
              membres
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-5 h-5" />
              <span>Optimal</span>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.optimal}
            </div>
            <div className="text-sm text-purple-200">
              membres
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5" />
              <span>Sous-utilisé</span>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.underutilized}
            </div>
            <div className="text-sm text-purple-200">
              membres
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisation
                </label>
                <select
                  value={filters.utilization}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    utilization: e.target.value as typeof filters.utilization 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="overutilized">Surcharge</option>
                  <option value="underutilized">Sous-utilisé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétences
                </label>
                <select
                  multiple
                  value={filters.skills}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, skills: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from(new Set(members.flatMap(m => m.skills))).map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Réinitialiser les filtres */}
            {(filters.utilization !== 'all' || filters.skills.length > 0 || 
              filters.dateRange.start || filters.dateRange.end || filters.search) && (
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

      {/* Liste des membres */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {utilizationMetrics.map(({ member, tasks, totalHours, completedHours, utilizationRate, efficiency, status }) => (
            <div key={member.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status === 'overutilized' ? 'bg-red-100 text-red-800' :
                  status === 'underutilized' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {status === 'overutilized' ? 'Surcharge' :
                   status === 'underutilized' ? 'Sous-utilisé' : 'Optimal'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Tâches</div>
                  <div className="font-medium text-gray-900">{tasks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Heures estimées</div>
                  <div className="font-medium text-gray-900">{totalHours}h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Heures réalisées</div>
                  <div className="font-medium text-gray-900">{completedHours}h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Efficacité</div>
                  <div className="flex items-center gap-1">
                    {efficiency > 90 ? <ArrowUp className="w-4 h-4 text-green-500" /> :
                     efficiency < 70 ? <ArrowDown className="w-4 h-4 text-red-500" /> :
                     <Minus className="w-4 h-4 text-yellow-500" />}
                    <span className={`font-medium ${
                      efficiency > 90 ? 'text-green-600' :
                      efficiency < 70 ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {efficiency.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Barre d'utilisation */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Taux d'utilisation</span>
                  <span className="font-medium text-gray-900">{utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      utilizationRate > 90 ? 'bg-red-500' :
                      utilizationRate < 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Compétences */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {member.skills.map(( skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceUtilization;