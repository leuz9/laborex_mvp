import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Clock, AlertTriangle, Eye, Edit2, Trash2, Filter, X, Search, Calendar, Tag, User, Package } from 'lucide-react';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { productService } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from '../types/task';
import type { TeamMember } from '../types/team';
import type { Product } from '../types/product';
import CreateTaskModal from './modals/CreateTaskModal';
import ViewTaskModal from './modals/ViewTaskModal';
import EditTaskModal from './modals/EditTaskModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const Tasks: React.FC = () => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'superadmin';
  const isViewer = userProfile?.role === 'viewer';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | Task['status'],
    priority: 'all' as 'all' | Task['priority'],
    assignee: 'all',
    product: 'all',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'overdue',
    search: '',
    showCompleted: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, membersData, productsData] = await Promise.all([
        taskService.getAllTasks(),
        teamService.getAllMembers(),
        productService.getAllProducts()
      ]);
      setTasks(tasksData);
      setTeamMembers(membersData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      setLoading(true);
      await taskService.updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
      setEditTask(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      setLoading(true);
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    if (!filters.showCompleted && task.status === 'done') return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.assignee !== 'all' && !task.assignees.some(a => a.id === filters.assignee)) return false;
    if (filters.product !== 'all' && task.productId !== filters.product) return false;

    if (filters.dateRange !== 'all') {
      const dueDate = new Date(task.dueDate.seconds * 1000);
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          if (dueDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (dueDate > weekFromNow || dueDate < now) return false;
          break;
        case 'overdue':
          if (dueDate >= now) return false;
          break;
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assignees.some(a => a.name.toLowerCase().includes(searchLower)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    return true;
  });

  if (loading && !tasks.length) {
    return <LoadingState message="Chargement des tâches..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Tâches</h2>
              <p className="text-blue-100">Gérez et suivez vos tâches</p>
            </div>
          </div>
          {!isViewer && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Total</div>
            <div className="text-3xl font-bold">{tasks.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">En cours</div>
            <div className="text-3xl font-bold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">En retard</div>
            <div className="text-3xl font-bold">
              {tasks.filter(t => 
                t.status !== 'done' && 
                new Date(t.dueDate.seconds * 1000) < new Date()
              ).length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Terminées</div>
            <div className="text-3xl font-bold">
              {tasks.filter(t => t.status === 'done').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as typeof filters.status }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="review">En revue</option>
            <option value="done">Terminé</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as typeof filters.priority }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les assignés</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as typeof filters.dateRange }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="overdue">En retard</option>
          </select>

          {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || 
            filters.dateRange !== 'all' || filters.search || !filters.showCompleted) && (
            <button
              onClick={() => setFilters({
                status: 'all',
                priority: 'all',
                assignee: 'all',
                product: 'all',
                dateRange: 'all',
                search: '',
                showCompleted: true
              })}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

{/* Liste des tâches */}
<div className="bg-white rounded-lg shadow-md">
  <div className="p-6">
    {filteredTasks.length === 0 ? (
      <div className="text-center py-12">
        <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune tâche ne correspond à vos critères</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const assignees = task.assignees;
          const product = products.find(p => p.id === task.productId);
          
          return (
            <div
              key={task.id}
              className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* En-tête de la carte */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{task.title}</h3>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
              </div>

              {/* Informations du projet */}
              {product && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{product.name}</span>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
                </span>
              </div>

              {/* Barre de progression */}
              {task.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        task.progress >= 80 ? 'bg-green-500' :
                        task.progress >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Assignés */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {assignees.slice(0, 3).map((assignee, index) => (
                    <img
                      key={index}
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-6 h-6 rounded-full border-2 border-white"
                      title={assignee.name}
                    />
                  ))}
                  {assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{assignees.length - 3}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewTask(task)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded-lg"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!isViewer && (
                    <button
                      onClick={() => setEditTask(task)}
                      className="p-1 text-gray-400 hover:text-green-600 rounded-lg"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                      title="Supprimer"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>

      {showAddModal && (
        <CreateTaskModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTask}
          loading={loading}
          projectId="default"
          teamMembers={teamMembers}
          products={products}
        />
      )}

      {viewTask && (
        <ViewTaskModal
          task={viewTask}
          assignees={teamMembers.filter(m => viewTask.assignees.some(a => a.id === m.id))}
          product={products.find(p => p.id === viewTask.productId)}
          onClose={() => setViewTask(null)}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          teamMembers={teamMembers}
          products={products}
          onClose={() => setEditTask(null)}
          onSubmit={handleEditTask}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Tasks;