import React, { useState } from 'react';
import { Trophy, Target, Gift } from 'lucide-react';
import type { Achievement } from '../../types';

interface CreateAchievementFormProps {
  onSubmit: (achievement: Omit<Achievement, 'id' | 'progress'>) => void;
  onClose: () => void;
}

const CreateAchievementForm: React.FC<CreateAchievementFormProps> = ({
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'daily' as Achievement['category'],
    total: 1,
    reward: {
      type: 'points' as 'points' | 'badge' | 'level',
      value: 100
    },
    completed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Titre du succès
          </div>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Catégorie
            </div>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Achievement['category'] })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objectif total
          </label>
          <input
            type="number"
            min="1"
            value={formData.total}
            onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Récompense
          </div>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.reward.type}
            onChange={(e) => setFormData({
              ...formData,
              reward: {
                ...formData.reward,
                type: e.target.value as 'points' | 'badge' | 'level'
              }
            })}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="points">Points</option>
            <option value="badge">Badge</option>
            <option value="level">Niveau</option>
          </select>

          {formData.reward.type === 'points' && (
            <input
              type="number"
              min="0"
              step="50"
              value={formData.reward.value}
              onChange={(e) => setFormData({
                ...formData,
                reward: {
                  ...formData.reward,
                  value: parseInt(e.target.value)
                }
              })}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Créer le succès
        </button>
      </div>
    </form>
  );
};