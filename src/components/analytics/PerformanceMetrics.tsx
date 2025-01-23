import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Award, Target, Brain, Filter, Search, X, Calendar, Star, ArrowUp, ArrowDown, Minus, Clock } from 'lucide-react';
import type { TeamMember } from '../../types/team';
import type { Task } from '../../types/task';
import { taskService } from '../../services/taskService';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';

interface PerformanceMetricsProps {
  member: TeamMember;
  timeframe: 'week' | 'month' | 'quarter';
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ member, timeframe }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // États des filtres
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'completed' | 'overdue',
    priority: 'all' as 'all' | 'high' | 'medium' | 'low',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  useEffect(() => {
    if (member?.id) {
      loadData();
    }
  }, [member?.id, timeframe]);

  const loadData = async () => {
    if (!member?.id) {
      console.error('Member ID is required');
      return;
    }

    try {
      setLoading(true);
      const tasksData = await taskService.getTasksByMultipleAssignees([member.id]);
      
      // Filtrer les tâches en fonction du timeframe
      const now = new Date();
      const filteredTasks = tasksData.filter(task => {
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

      setTasks(filteredTasks);
      setError(null);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      priority: 'all',
      dateRange: {
        start: '',
        end: ''
      },
      search: ''
    });
  };

  // Calcul des métriques de performance
  const metrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    overdueTasks: tasks.filter(t => {
      const dueDate = new Date(t.dueDate.seconds * 1000);
      return dueDate < new Date() && t.status !== 'done';
    }).length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
    averageCompletion: tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length || 0,
    efficiency: tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0
  };

  

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <p className="text-blue-100">{member.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span>Tâches totales</span>
            </div>
            <div className="text-3xl font-bold">{metrics.totalTasks}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span>Complétées</span>
            </div>
            <div className="text-3xl font-bold">{metrics.completedTasks}</div>
            <div className="text-sm text-blue-200">
              {((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span>En retard</span>
            </div>
            <div className="text-3xl font-bold">{metrics.overdueTasks}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5" />
              <span>Efficacité</span>
            </div>
            <div className="text-3xl font-bold">
              {metrics.efficiency.toFixed(1)}%
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
                placeholder="Rechercher une tâche..."
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
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    type: e.target.value as typeof filters.type 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les tâches</option>
                  <option value="completed">Complétées</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>

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
            {(filters.type !== 'all' || filters.priority !== 'all' || 
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

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune tâche trouvée</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Date d'échéance</div>
                    <div className="font-medium text-gray-900">
                      {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Points XP</div>
                    <div className="font-medium text-gray-900">{task.xpReward}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Temps estimé</div>
                    <div className="font-medium text-gray-900">
                      {task.estimatedHours}h
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium text-gray-900">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        task.progress >= 80 ? 'bg-green-500' :
                        task.progress >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;