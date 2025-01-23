
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PieChart, AlertTriangle, Filter, Search, X, Calendar, Users, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { productService } from '../../services/productService';
import type { TeamMember } from '../../types/team';
import type { Product } from '../../types/product';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';

const BudgetAnalytics: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);

  // États des filtres
  const [filters, setFilters] = useState({
    member: 'all',
    project: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    budgetRange: {
      min: '',
      max: ''
    },
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, productsData] = await Promise.all([
        teamService.getAllMembers(),
        productService.getAllProducts()
      ]);
      setTeamMembers(membersData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des métriques budgétaires
  const budgetMetrics = {
    total: {
      allocated: products.reduce((acc, p) => acc + (p.metadata?.budget?.allocated || 0), 0),
      spent: products.reduce((acc, p) => acc + (p.metadata?.budget?.spent || 0), 0)
    },
    byMember: teamMembers.map(member => {
      const memberProjects = products.filter(p => 
        p.metadata?.teamMembers?.includes(member.id)
      );
      return {
        member,
        allocated: memberProjects.reduce((acc, p) => acc + (p.metadata?.budget?.allocated || 0), 0),
        spent: memberProjects.reduce((acc, p) => acc + (p.metadata?.budget?.spent || 0), 0),
        projects: memberProjects.length
      };
    }),
    byProject: products.map(project => ({
      project,
      allocated: project.metadata?.budget?.allocated || 0,
      spent: project.metadata?.budget?.spent || 0,
      remaining: (project.metadata?.budget?.allocated || 0) - (project.metadata?.budget?.spent || 0),
      progress: ((project.metadata?.budget?.spent || 0) / (project.metadata?.budget?.allocated || 1)) * 100
    }))
  };

  const resetFilters = () => {
    setFilters({
      member: 'all',
      project: 'all',
      dateRange: {
        start: '',
        end: ''
      },
      budgetRange: {
        min: '',
        max: ''
      },
      search: ''
    });
  };

  if (loading) {
    return <LoadingState message="Chargement des données budgétaires..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  const remaining = budgetMetrics.total.allocated - budgetMetrics.total.spent;
  const spentPercentage = (budgetMetrics.total.spent / budgetMetrics.total.allocated) * 100;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Budget Analytics</h2>
            <p className="text-green-100">Analyse et suivi des budgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget Total</span>
            </div>
            <div className="text-3xl font-bold">
              {budgetMetrics.total.allocated.toLocaleString()}€
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span>Dépensé</span>
            </div>
            <div className="text-3xl font-bold">
              {budgetMetrics.total.spent.toLocaleString()}€
            </div>
            <div className="text-sm text-green-200">
              {spentPercentage.toFixed(1)}% du budget total
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5" />
              <span>Restant</span>
            </div>
            <div className="text-3xl font-bold">
              {remaining.toLocaleString()}€
            </div>
            <div className="text-sm text-green-200">
              {(100 - spentPercentage).toFixed(1)}% disponible
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Projets en alerte</span>
            </div>
            <div className="text-3xl font-bold">
              {budgetMetrics.byProject.filter(p => p.progress > 90).length}
            </div>
            <div className="text-sm text-green-200">
              Dépassement imminent
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Rechercher un projet ou un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeframe === period
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === 'month' ? 'Mois' :
                 period === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Membre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membre
                </label>
                <select
                  value={filters.member}
                  onChange={(e) => setFilters(prev => ({ ...prev, member: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les membres</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Projet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet
                </label>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les projets</option>
                  {products.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
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
            {(filters.member !== 'all' || filters.project !== 'all' || 
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

      {/* Analyse par membre */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Rendement par membre</h3>
        <div className="space-y-6">
          {budgetMetrics.byMember
            .sort((a, b) => b.allocated - a.allocated)
            .map(({ member, allocated, spent, projects }) => {
              const efficiency = ((allocated - spent) / allocated) * 100;
              const status = efficiency > 20 ? 'positive' : efficiency > 5 ? 'neutral' : 'negative';

              return (
                <div key={member.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
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
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Budget alloué</div>
                      <div className="font-medium text-gray-900">
                        {allocated.toLocaleString()}€
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Dépensé</div>
                      <div className="font-medium text-gray-900">
                        {spent.toLocaleString()}€
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Projets actifs</div>
                      <div className="font-medium text-gray-900">{projects}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Efficacité</div>
                      <div className="flex items-center gap-1">
                        {status === 'positive' && <ArrowUp className="w-4 h-4 text-green-500" />}
                        {status === 'neutral' && <Minus className="w-4 h-4 text-yellow-500" />}
                        {status === 'negative' && <ArrowDown className="w-4 h-4 text-red-500" />}
                        <span className={`font-medium ${
                          status === 'positive' ? 'text-green-600' :
                          status === 'neutral' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {efficiency.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          status === 'positive' ? 'bg-green-500' :
                          status === 'neutral' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(spent / allocated) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Projets en alerte */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Projets en alerte budgétaire</h3>
        <div className="space-y-4">
          {budgetMetrics.byProject
            .filter(p => p.progress > 80)
            .map(({ project, allocated, spent, remaining, progress }) => (
              <div key={project.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    progress > 90 ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {progress > 90 ? 'Critique' : 'À surveiller'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Budget total</div>
                    <div className="font-medium text-gray-900">
                      {allocated.toLocaleString()}€
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Dépensé</div>
                    <div className="font-medium text-gray-900">
                      {spent.toLocaleString()}€
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Restant</div>
                    <div className="font-medium text-gray-900">
                      {remaining.toLocaleString()}€
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression budgétaire</span>
                    <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        progress > 90 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalytics;