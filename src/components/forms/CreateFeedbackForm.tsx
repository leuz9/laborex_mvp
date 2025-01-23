import React, { useState } from 'react';
import { MessageSquare, Flag, Send } from 'lucide-react';
import type { FeedbackEntry, TeamMember } from '../../types';

interface CreateFeedbackFormProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  onSubmit: (feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'reactions'>) => void;
  onClose: () => void;
}

const CreateFeedbackForm: React.FC<CreateFeedbackFormProps> = ({
  currentUser,
  teamMembers,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    to: '',
    type: 'praise' as FeedbackEntry['type'],
    content: '',
    category: 'performance' as FeedbackEntry['category'],
    private: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = teamMembers.find(m => m.id === formData.to);
    if (!recipient) return;

    onSubmit({
      from: currentUser,
      to: recipient,
      type: formData.type,
      content: formData.content,
      category: formData.category,
      private: formData.private
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Destinataire
          </div>
        </label>
        <select
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Sélectionner un membre</option>
          {teamMembers
            .filter(m => m.id !== currentUser.id)
            .map(member => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.role}
              </option>
            ))
          }
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de feedback
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ 
            ...formData, 
            type: e.target.value as FeedbackEntry['type']
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="praise">Félicitations</option>
          <option value="suggestion">Suggestion</option>
          <option value="concern">Point d'attention</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({
            ...formData,
            category: e.target.value as FeedbackEntry['category']
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="performance">Performance</option>
          <option value="collaboration">Collaboration</option>
          <option value="innovation">Innovation</option>
          <option value="leadership">Leadership</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Votre feedback..."
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.private}
            onChange={(e) => setFormData({ ...formData, private: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-600">Feedback privé</span>
        </label>
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Envoyer le feedback
        </button>
      </div>
    </form>
  );
};