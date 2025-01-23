import React, { useState } from 'react';
import { X, Calendar, User, Flag, Package, Clock, Plus } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Product } from '../../types/product';
import type { TeamMember } from '../../types/team';

interface EditTaskModalProps {
  task: Task;
  teamMembers: TeamMember[];
  products: Product[];
  onClose: () => void;
  onSubmit: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  loading?: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  teamMembers,
  products,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    assignees: task.assignees || [],
    productId: task.productId,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate.toDate().toISOString().split('T')[0],
    dueDate: task.dueDate.toDate().toISOString().split('T')[0],
    dependencies: task.dependencies || [],
    xpReward: task.xpReward,
    progress: task.progress || 0,
    estimatedHours: task.estimatedHours || 0,
    tags: task.tags || [],
    attachments: task.attachments || [],
    comments: task.comments || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(formData.startDate);
    const dueDate = new Date(formData.dueDate);

    if (dueDate < startDate) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }

    try {
      // Log pour déboguer
      console.log('Mise à jour de la tâche avec les données:', {
        ...formData,
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString()
      });

      await onSubmit(task.id, {
        ...formData,
        startDate,
        dueDate
      });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleAssigneeChange = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const isAlreadyAssigned = formData.assignees.some(a => a.id === memberId);
    
    if (isAlreadyAssigned) {
      setFormData({
        ...formData,
        assignees: formData.assignees.filter(a => a.id !== memberId)
      });
    } else {
      setFormData({
        ...formData,
        assignees: [...formData.assignees, {
          id: member.id,
          name: member.name,
          avatar: member.avatar || '',
          role: member.role || 'member'
        }]
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Modifier la tâche</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la tâche
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Produit concerné
                </div>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner un produit</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priorité
                </div>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignés
              </div>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignees.some(a => a.id === member.id)}
                    onChange={() => handleAssigneeChange(member.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{member.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({member.role || 'member'})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début
                </div>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date d'échéance
                </div>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Heures estimées
                </div>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points XP
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progression
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span>{formData.progress}%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="review">En revue</option>
              <option value="done">Terminé</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;