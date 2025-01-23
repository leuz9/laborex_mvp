import React, { useState } from 'react';
import { Heart, Brain, Battery, Coffee, Sun } from 'lucide-react';
import type { WellnessSurvey } from '../../types';

interface CreateWellnessSurveyFormProps {
  employeeId: string;
  onSubmit: (survey: Omit<WellnessSurvey, 'id' | 'date'>) => void;
  onClose: () => void;
}

const CreateWellnessSurveyForm: React.FC<CreateWellnessSurveyFormProps> = ({
  employeeId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    workloadSatisfaction: 5,
    stressLevel: 5,
    teamSatisfaction: 5,
    workLifeBalance: 5,
    motivation: 5,
    comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId,
      responses: formData,
      comments: formData.comments
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Battery className="w-4 h-4" />
          Satisfaction de la charge de travail
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.workloadSatisfaction}
          onChange={(e) => setFormData({
            ...formData,
            workloadSatisfaction: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span>{formData.workloadSatisfaction}</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Niveau de stress
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.stressLevel}
          onChange={(e) => setFormData({
            ...formData,
            stressLevel: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span>{formData.stressLevel}</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Satisfaction avec l'équipe
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.teamSatisfaction}
          onChange={(e) => setFormData({
            ...formData,
            teamSatisfaction: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span>{formData.teamSatisfaction}</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Coffee className="w-4 h-4" />
          Équilibre vie professionnelle/personnelle
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.workLifeBalance}
          onChange={(e) => setFormData({
            ...formData,
            workLifeBalance: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span>{formData.workLifeBalance}</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Motivation
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.motivation}
          onChange={(e) => setFormData({
            ...formData,
            motivation: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>1</span>
          <span>{formData.motivation}</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commentaires additionnels
        </label>
        <textarea
          value={formData.comments}
          onChange={(e) => setFormData({
            ...formData,
            comments: e.target.value
          })}
          rows={4}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Partagez vos pensées..."
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
          Soumettre le sondage
        </button>
      </div>
    </form>
  );
};