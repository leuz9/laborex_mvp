import React, { useState } from 'react';
import { Target, Calendar, Brain } from 'lucide-react';
import type { CareerDevelopment } from '../../types';

interface CreateCareerGoalFormProps {
  employeeId: string;
  onSubmit: (goal: { type: keyof CareerDevelopment['goals']; goal: string }) => void;
  onClose: () => void;
}

const CreateCareerGoalForm: React.FC<CreateCareerGoalFormProps> = ({
  employeeId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    type: 'shortTerm' as keyof CareerDevelopment['goals'],
    goal: ''
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
            <Target className="w-4 h-4" />
            Type d'objectif
          </div>
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({
            ...formData,
            type: e.target.value as keyof CareerDevelopment['goals']
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="shortTerm">Court terme (3-6 mois)</option>
          <option value="midTerm">Moyen terme (6-12 mois)</option>
          <option value="longTerm">Long terme (1-3 ans)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description de l'objectif
        </label>
        <textarea
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          rows={4}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Décrivez votre objectif..."
          required
        />
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
          Ajouter l'objectif
        </button>
      </div>
    </form>
  );
};