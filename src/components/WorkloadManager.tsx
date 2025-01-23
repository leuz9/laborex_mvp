import React, { useState, useEffect } from 'react';
import { 
  BarChart2, AlertTriangle, Clock, Users, Brain, TrendingUp, Filter, Calendar, Search, X, 
  Battery, Target, Star, Award, ChevronRight, ArrowUp, ArrowDown, Minus, Package, Info
} from 'lucide-react';
import type { TeamMember, Task } from '../types';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import { productService } from '../services/productService';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const WorkloadManager: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    workloadRange: [0, 100],
    taskStatus: 'all' as 'all' | 'todo' | 'in-progress' | 'done',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high',
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
      const [membersData, tasksData, productsData] = await Promise.all([
        teamService.getAllMembers(),
        taskService.getAllTasks(),
        productService.getAllProducts()
      ]);
      setMembers(membersData);
      setTasks(tasksData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkloadMetrics = (member: TeamMember) => {
    const memberTasks = tasks.filter(task => task.assignees.some(a => a.id === member.id));
    const now = new Date();
    
    // Filtrer les tâches en fonction du timeframe
    const filteredTasks = memberTasks.filter(task => {
      const taskDate = new Date(task.dueDate.seconds * 1000);
      switch (timeframe) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return taskDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return taskDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return taskDate >= quarterAgo;
        default:
          return true;
      }
    });

    // Calcul des métriques avancées
    const totalEstimatedHours = filteredTasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0);
    const completedTasks = filteredTasks.filter(t => t.status === 'done');
    const completedHours = completedTasks.reduce((acc, task) => acc + (task.actualHours || task.estimatedHours || 0), 0);
    const overdueTasks = filteredTasks.filter(task => {
      const dueDate = new Date(task.dueDate.seconds * 1000);
      return dueDate < now && task.status !== 'done';
    });

    // Calcul de l'efficacité et de la productivité
    const efficiency = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => acc + task.progress, 0) / completedTasks.length 
      : 0;
    
    const productivity = completedHours > 0 
      ? (completedTasks.length / filteredTasks.length) * 100 
      : 0;

    // Calcul du score de charge de travail
    const workloadScore = Math.min(100, (totalEstimatedHours / (40 * 4)) * 100); // 40h/semaine * 4 semaines

    // Analyse des compétences utilisées
    const skillsUsage = member.skills.map(skill => {
      const tasksWithSkill = filteredTasks.filter(task => 
        task.tags?.includes(skill.toLowerCase())
      );
      return {
        skill,
        usage: (tasksWithSkill.length / filteredTasks.length) * 100 || 0
      };
    });

    // Projets impliqués
    const involvedProjects = products.filter(project =>
      filteredTasks.some(task => task.productId === project.id)
    );

    return {
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingDeadlines: filteredTasks.filter(task => {
        const dueDate = new Date(task.dueDate.seconds * 1000);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate > now && dueDate <= weekFromNow;
      }).length,
      averageCompletion: filteredTasks.reduce((acc, task) => acc + task.progress, 0) / filteredTasks.length || 0,
      workloadScore,
      efficiency,
      productivity,
      totalEstimatedHours,
      completedHours,
      skillsUsage,
      involvedProjects,
      highPriorityTasks: filteredTasks.filter(t => t.priority === 'high').length,
      xpEarned: completedTasks.reduce((acc, task) => acc + task.xpReward, 0)
    };
  };

  const getWorkloadStatus = (score: number) => {
    if (score >= 80) return { color: 'text-red-500', label: 'Surchargé', info: 'Charge de travail excessive, risque de burnout' };
    if (score >= 60) return { color: 'text-yellow-500', label: 'Chargé', info: 'Charge de travail élevée mais gérable' };
    return { color: 'text-green-500', label: 'Optimal', info: 'Charge de travail équilibrée' };
  };

  const resetFilters = () => {
    setFilters({
      workloadRange: [0, 100],
      taskStatus: 'all',
      priority: 'all',
      skills: [],
      dateRange: {
        start: '',
        end: ''
      },
      search: ''
    });
  };

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingState message="Chargement des données..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  // Calcul des statistiques globales
  const globalStats = {
    averageWorkload: members.reduce((acc, m) => {
      const metrics = calculateWorkloadMetrics(m);
      return acc + metrics.workloadScore;
    }, 0) / members.length,
    overloadedMembers: members.filter(m => {
      const metrics = calculateWorkloadMetrics(m);
      return metrics.workloadScore >= 80;
    }).length,
    totalTasks: tasks.length,
    completionRate: (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 || 0
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques globales */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Battery className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Charge de travail</h2>
              <p className="text-blue-100">Gestion et optimisation des ressources</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeframe === period
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {period === 'week' ? 'Semaine' :
                 period === 'month' ? 'Mois' : 'Trimestre'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-5 h-5" />
              <span>Charge moyenne</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'workload' ? null : 'workload')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.averageWorkload.toFixed(1)}%
            </div>
            {showInfoTooltip === 'workload' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                Moyenne de la charge de travail de l'équipe basée sur les heures estimées
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Surchargés</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'overloaded' ? null : 'overloaded')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.overloadedMembers}
            </div>
            {showInfoTooltip === 'overloaded' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                Membres avec une charge de travail supérieure à 80%
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span>Tâches actives</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'tasks' ? null : 'tasks')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">{globalStats.totalTasks}</div>
            {showInfoTooltip === 'tasks' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                Nombre total de tâches en cours dans l'équipe
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span>Complétion</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'completion' ? null : 'completion')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">
              {globalStats.completionRate.toFixed(1)}%
            </div>
            {showInfoTooltip === 'completion' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                Taux de complétion des tâches sur la période
              </div>
            )}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Statut des tâches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut des tâches
                </label>
                <select
                  value={filters.taskStatus}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    taskStatus: e.target.value as typeof filters.taskStatus 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="in-progress">En cours</option>
                  <option value="done">Terminé</option>
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priority: e.target.value as typeof filters.priority 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>

              {/* Compétences */}
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
            </div>

            {/* Période */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
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

            {/* Réinitialiser les filtres */}
            {(filters.taskStatus !== 'all' || filters.priority !== 'all' || 
              filters.skills.length > 0 || filters.dateRange.start || 
              filters.dateRange.end || filters.search) && (
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

      {/* Vue d'ensemble de la charge de travail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const metrics = calculateWorkloadMetrics(member);
          const workloadStatus = getWorkloadStatus(metrics.workloadScore);
          
          return (
            <div
              key={member.id}
              className={`bg-white rounded-lg p-6 shadow-md cursor-pointer transition-all ${
                selectedMember?.id === member.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${workloadStatus.color}`}>
                  {workloadStatus.label}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Charge de travail</span>
                  <span className="font-medium">{metrics.workloadScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metrics.workloadScore >= 80 ? 'bg-red-500' :
                      metrics.workloadScore >= 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${metrics.workloadScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium">{metrics.totalTasks}</div>
                    <div className="text-xs text-gray-600">Tâches</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium">{metrics.upcomingDeadlines}</div>
                    <div className="text-xs text-gray-600">Deadlines</div>
                  </div>
                </div>

                {/* Compétences principales */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {metrics.skillsUsage
                    .sort((a, b) => b.usage - a.usage)
                    .slice(0, 3)
                    .map(({ skill, usage }) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        title={`Utilisation: ${usage.toFixed(1)}%`}
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Détails du membre sélectionné */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedMember.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedMember.role} • Niveau {selectedMember.level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Métriques détaillées */}
              {(() => {
                const metrics = calculateWorkloadMetrics(selectedMember);
                const workloadStatus = getWorkloadStatus(metrics.workloadScore);
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Charge actuelle</div>
                      <div className="text-2xl font-bold mt-1">{metrics.workloadScore.toFixed(1)}%</div>
                      <div className={`text-sm font-medium ${workloadStatus.color}`}>
                        {workloadStatus.label}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Tâches totales</div>
                      <div className="text-2xl font-bold mt-1">{metrics.totalTasks}</div>
                      <div className="text-sm text-gray-500">
                        {metrics.overdueTasks} en retard
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Efficacité</div>
                      <div className="text-2xl font-bold mt-1">
                        {metrics.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">
                        +{(metrics.efficiency - 75).toFixed(1)}% vs moyenne
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Points XP</div>
                      <div className="text-2xl font-bold mt-1">{metrics.xpEarned}</div>
                      <div className="text-sm text-gray-500">
                        {metrics.completedTasks} tâches complétées
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tâches en cours */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Tâches en cours</h3>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {tasks
                      .filter(task => 
                        task.assignees.some(a => a.id === selectedMember.id) && 
                        task.status === 'in-progress'
                      )
                      .map(task => (
                        <div key={task.id} className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>
                                  {task.estimatedHours}h estimées
                                </span>
                                <span>
                                  {task.progress}% complété
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(task.dueDate.toDate()).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {task.progress > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-blue-600"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Capacité et performance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Capacité et performance</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Taux de complétion */}
                    {(() => {
                      const metrics = calculateWorkloadMetrics(selectedMember);
                      
                      return (

                        <>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Taux de complétion</span>
                              <span className="font-medium">{metrics.efficiency.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 bg-purple-500 rounded-full" 
                                style={{ width: `${metrics.efficiency}%` }}
                              />
                            </div>
                          </div>

                          {/* Productivité */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Productivité</span>
                              <span className="font-medium">{metrics.productivity.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 bg-purple-500 rounded-full" 
                                style={{ width: `${metrics.productivity}%` }}
                              />
                            </div>
                          </div>

                          {/* Utilisation des compétences */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Utilisation des compétences</h4>
                            <div className="space-y-2">
                              {metrics.skillsUsage.map(({ skill, usage }) => (
                                <div key={skill}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">{skill}</span>
                                    <span className="font-medium">{usage.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="h-1.5 bg-purple-500 rounded-full"
                                      style={{ width: `${usage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Projets et récompenses */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Projets et récompenses</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Projets impliqués */}
                    {(() => {
                      const metrics = calculateWorkloadMetrics(selectedMember);
                      
                      return (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Projets actifs</h4>
                            <div className="space-y-2">
                              {metrics.involvedProjects.map(project => (
                                <div key={project.id} className="flex items-center justify-between bg-white p-2 rounded">
                                  <span className="text-sm text-gray-900">{project.name}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    project.status === 'in_development' ? 'bg-blue-100 text-blue-800' :
                                    project.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Badges et récompenses */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Badges récents</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedMember.badges.slice(0, 3).map((badge, index) => (
                                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  <Award className="w-3 h-3" />
                                  <span>{badge}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Points XP et niveau */}
                          <div className="flex items-center justify-between bg-white p-3 rounded">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">Niveau {selectedMember.level}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {selectedMember.points} XP
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              {(() => {
                const metrics = calculateWorkloadMetrics(selectedMember);
                const recommendations = [];

                if (metrics.workloadScore >= 80) {
                  recommendations.push("Redistribuer certaines tâches pour réduire la charge");
                }
                if (metrics.overdueTasks > 0) {
                  recommendations.push(`Revoir les priorités des ${metrics.overdueTasks} tâches en retard`);
                }
                if (metrics.upcomingDeadlines >= 3) {
                  recommendations.push("Planifier une session de planification pour les échéances à venir");
                }
                if (metrics.efficiency < 70) {
                  recommendations.push("Identifier les blocages potentiels affectant l'efficacité");
                }
                if (metrics.skillsUsage.some(s => s.usage < 30)) {
                  recommendations.push("Opportunité de mieux utiliser certaines compétences sous-exploitées");
                }

                return recommendations.length > 0 ? (
                  <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Recommandations</h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-yellow-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadManager;