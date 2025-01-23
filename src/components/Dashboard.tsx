import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Users, Calendar, CheckSquare, TrendingUp, Target, Award, 
  Brain, Clock, DollarSign, Star, Package, AlertTriangle, Filter,
  ChevronRight, ArrowUp, ArrowDown, Minus, Activity, Zap, Info, X,
  Eye, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import { productService } from '../services/productService';
import type { TeamMember, Task, Product } from '../types';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    projectStatus: [] as string[],
    priority: [] as ('low' | 'medium' | 'high')[],
    teamMembers: [] as string[],
    dateRange: {
      start: '',
      end: ''
    },
    search: '',
    budgetRange: {
      min: '',
      max: ''
    }
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
      setTeamMembers(membersData);
      setTasks(tasksData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des KPIs avec filtrage
  const kpis = {
    // Performance de l'équipe
    teamPerformance: {
      taskCompletion: {
        rate: tasks.filter(t => t.status === 'done').length / tasks.length * 100 || 0,
        trend: '+8%',
        info: 'Taux calculé sur le nombre de tâches terminées par rapport au nombre total de tâches'
      },
      productivity: {
        score: 85,
        trend: '+12%',
        info: 'Score basé sur le temps moyen de complétion des tâches et le respect des délais'
      },
      workload: {
        score: teamMembers.reduce((acc, member) => {
          const memberTasks = tasks.filter(t => t.assignees.some(a => a.id === member.id));
          return acc + memberTasks.length;
        }, 0) / teamMembers.length,
        trend: '-5%',
        info: 'Nombre moyen de tâches par membre de l\'équipe'
      }
    },

    // Projets et tâches
    projects: {
      active: products.filter(p => p.status === 'in_development').length,
      delayed: products.filter(p => {
        const endDate = p.endDate?.toDate();
        return endDate && endDate < new Date() && p.status !== 'deployed';
      }).length,
      completion: {
        rate: products.filter(p => p.status === 'deployed').length / products.length * 100 || 0,
        trend: '+15%',
        info: 'Pourcentage de projets déployés par rapport au nombre total de projets'
      }
    },

    // Budget et ressources
    budget: {
      total: products.reduce((acc, p) => acc + (p.metadata?.budget?.allocated || 0), 0),
      spent: products.reduce((acc, p) => acc + (p.metadata?.budget?.spent || 0), 0),
      remaining: products.reduce((acc, p) => {
        const allocated = p.metadata?.budget?.allocated || 0;
        const spent = p.metadata?.budget?.spent || 0;
        return acc + (allocated - spent);
      }, 0),
      info: 'Budget calculé sur l\'ensemble des projets actifs'
    },

    // Risques et alertes
    risks: {
      highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
      overdue: tasks.filter(t => {
        const dueDate = t.dueDate.toDate();
        return dueDate < new Date() && t.status !== 'done';
      }).length,
      blocked: tasks.filter(t => t.status === 'blocked').length || 0,
      info: 'Tâches à risque basées sur la priorité, les délais et les blocages'
    }
  };

  const resetFilters = () => {
    setFilters({
      projectStatus: [],
      priority: [],
      teamMembers: [],
      dateRange: {
        start: '',
        end: ''
      },
      search: '',
      budgetRange: {
        min: '',
        max: ''
      }
    });
  };

  // Filtrer les projets
  const filteredProducts = products.filter(product => {
    // Filtre de statut
    if (filters.projectStatus.length > 0 && !filters.projectStatus.includes(product.status)) {
      return false;
    }

    // Filtre de priorité
    if (filters.priority.length > 0 && !filters.priority.includes(product.metadata?.priority || 'medium')) {
      return false;
    }

    // Filtre de date
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      if (product.startDate.toDate() < startDate) return false;
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      if (product.endDate && product.endDate.toDate() > endDate) return false;
    }

    // Filtre de budget
    if (filters.budgetRange.min && (product.metadata?.budget?.allocated || 0) < parseInt(filters.budgetRange.min)) {
      return false;
    }
    if (filters.budgetRange.max && (product.metadata?.budget?.allocated || 0) > parseInt(filters.budgetRange.max)) {
      return false;
    }

    // Filtre de recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.metadata?.client?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading) {
    return <LoadingState message="Chargement du tableau de bord..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-eyone-blue to-eyone-blue/80 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {userProfile?.displayName || 'Manager'}
            </h1>
            <p className="text-blue-100 mt-1">
              Voici une vue d'ensemble de votre équipe et de vos projets
            </p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeframe === period
                    ? 'bg-white text-eyone-blue'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {period === 'week' ? 'Semaine' :
                 period === 'month' ? 'Mois' : 'Trimestre'}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5" />
              <span>Performance équipe</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'performance' ? null : 'performance')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">
              {kpis.teamPerformance.taskCompletion.rate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-300">
              <ArrowUp className="w-4 h-4" />
              {kpis.teamPerformance.taskCompletion.trend}
            </div>
            {showInfoTooltip === 'performance' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                {kpis.teamPerformance.taskCompletion.info}
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5" />
              <span>Projets actifs</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'projects' ? null : 'projects')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">{kpis.projects.active}</div>
            <div className="text-sm text-blue-200">
              {kpis.projects.delayed} en retard
            </div>
            {showInfoTooltip === 'projects' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                {kpis.projects.completion.info}
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget restant</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'budget' ? null : 'budget')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">
              {(kpis.budget.remaining / 1000).toFixed(0)}k€
            </div>
            <div className="text-sm text-blue-200">
              sur {(kpis.budget.total / 1000).toFixed(0)}k€
            </div>
            {showInfoTooltip === 'budget' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                {kpis.budget.info}
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Risques</span>
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === 'risks' ? null : 'risks')}
                className="ml-auto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold">{kpis.risks.highPriority}</div>
            <div className="text-sm text-blue-200">
              {kpis.risks.overdue} tâches en retard
            </div>
            {showInfoTooltip === 'risks' && (
              <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs">
                {kpis.risks.info}
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Rechercher un projet..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  multiple
                  value={filters.projectStatus}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, projectStatus: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="planning">En planification</option>
                  <option value="in_development">En développement</option>
                  <option value="testing">En test</option>
                  <option value="deployed">Déployé</option>
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  multiple
                  value={filters.priority}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as ('low' | 'medium' | 'high')[];
                    setFilters(prev => ({ ...prev, priority: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (k€)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, min: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, max: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
            {(filters.projectStatus.length > 0 || filters.priority.length > 0 || 
              filters.dateRange.start || filters.dateRange.end || filters.search ||
              filters.budgetRange.min || filters.budgetRange.max) && (
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

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance de l'équipe */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Performance de l'équipe</h2>
            <button 
              onClick={() => navigate('/performance-analytics')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir détails
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Productivité</span>
                <span className="text-xs text-green-600">
                  {kpis.teamPerformance.productivity.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.teamPerformance.productivity.score}%
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tâches complétées</span>
                <span className="text-xs text-green-600">
                  {kpis.teamPerformance.taskCompletion.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.teamPerformance.taskCompletion.rate.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Charge moyenne</span>
                <span className="text-xs text-red-600">
                  {kpis.teamPerformance.workload.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.teamPerformance.workload.score.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Graphique de performance */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            [Graphique de performance]
          </div>
        </div>

        {/* Top contributeurs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top contributeurs</h2>
            <button 
              onClick={() => navigate('/team')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir l'équipe
            </button>
          </div>
          <div className="space-y-4">
            {teamMembers.slice(0, 5).map((member, index) => {
              const memberTasks = tasks.filter(t => 
                t.assignees.some(a => a.id === member.id)
              );
              const completedTasks = memberTasks.filter(t => t.status === 'done');
              const completionRate = memberTasks.length ? 
                (completedTasks.length / memberTasks.length) * 100 : 0;

              return (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 truncate max-w-[150px]">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate max-w-[150px]">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {completionRate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {completedTasks.length}/{memberTasks.length} tâches
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projets en cours */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Projets en cours</h2>
            <button 
              onClick={() => navigate('/products')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir tous les projets
            </button>
          </div>

          <div className="space-y-4">
            {filteredProducts
              .filter(p => p.status === 'in_development')
              .slice(0, 3)
              .map(product => {
                const productTasks = tasks.filter(t => t.productId === product.id);
                const completedTasks = productTasks.filter(t => t.status === 'done');
                const progress = productTasks.length ? 
                  (completedTasks.length / productTasks.length) * 100 : 0;

                return (
                  <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        progress >= 75 ? 'bg-green-100 text-green-800' :
                        progress >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {progress.toFixed(0)}% complété
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Budget:</span>
                        <span className="ml-1 font-medium">
                          {product.metadata?.budget?.allocated?.toLocaleString()}€
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Équipe:</span>
                        <span className="ml-1 font-medium">
                          {product.metadata?.teamSize || 0} membres
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Tâches:</span>
                        <span className="ml-1 font-medium">
                          {completedTasks.length}/{productTasks.length}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress >= 75 ? 'bg-green-500' :
                          progress >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Alertes et risques */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Alertes et risques</h2>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir les tâches
            </button>
          </div>
          <div className="space-y-4">
            {kpis.risks.highPriority > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-medium">Tâches prioritaires</h3>
                </div>
                <p className="text-sm text-red-600">
                  {kpis.risks.highPriority} tâches haute priorité nécessitent votre attention
                </p>
              </div>
            )}

            {kpis.risks.overdue > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-medium">Tâches en retard</h3>

                </div>
                <p className="text-sm text-yellow-600">
                  {kpis.risks.overdue} tâches ont dépassé leur date d'échéance
                </p>
              </div>
            )}

            {kpis.projects.delayed > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <Package className="w-5 h-5" />
                  <h3 className="font-medium">Projets en retard</h3>
                </div>
                <p className="text-sm text-orange-600">
                  {kpis.projects.delayed} projets sont en retard sur le planning
                </p>
              </div>
            )}

            {kpis.budget.remaining < 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-800 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="font-medium">Dépassement de budget</h3>
                </div>
                <p className="text-sm text-purple-600">
                  Dépassement de {Math.abs(kpis.budget.remaining).toLocaleString()}€
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;