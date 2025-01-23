import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Flag, Send, Calendar, Tag, Eye, EyeOff, Clock, User, Filter, X } from 'lucide-react';
import type { FeedbackEntry } from '../types';
import type { UserProfile } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { feedbackService } from '../services/feedbackService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notificationService } from '../services/notificationService';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const FeedbackSystem: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    to: '',
    type: 'praise' as FeedbackEntry['type'],
    content: '',
    category: 'performance' as FeedbackEntry['category'],
    private: false
  });

  // États pour les filtres
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    onlyPrivate: false,
    search: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackData, usersData] = await Promise.all([
        feedbackService.getFeedbackForUser(currentUser!.uid),
        getDocs(collection(db, 'users'))
      ]);
      setFeedback(feedbackData);
      setUsers(usersData.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[]);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      const recipient = users.find(u => u.uid === newFeedback.to);
      if (!recipient) return;

      const feedbackData = {
        from: {
          id: currentUser.uid,
          name: userProfile.displayName || userProfile.email,
          avatar: userProfile.avatar || ''
        },
        to: {
          id: recipient.uid,
          name: recipient.displayName || recipient.email,
          avatar: recipient.avatar || ''
        },
        type: newFeedback.type,
        category: newFeedback.category,
        content: newFeedback.content,
        private: newFeedback.private
      };

      const createdFeedback = await feedbackService.createFeedback(feedbackData);

      await notificationService.createNotification({
        userId: recipient.uid,
        type: 'feedback',
        title: 'Nouveau feedback reçu',
        message: `${userProfile.displayName || userProfile.email} vous a envoyé un feedback`,
        priority: 'medium',
        link: `/feedback/${createdFeedback.id}`
      });

      setFeedback(prev => [createdFeedback, ...prev]);
      setNewFeedback({
        to: '',
        type: 'praise',
        content: '',
        category: 'performance',
        private: false
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (feedbackId: string, type: 'like' | 'helpful') => {
    if (!currentUser) return;

    try {
      await feedbackService.addReaction(feedbackId, currentUser.uid, type);
      loadData();
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // Fonction de filtrage des feedbacks
  const filteredFeedback = feedback.filter(entry => {
    if (filters.type !== 'all' && entry.type !== filters.type) return false;
    if (filters.category !== 'all' && entry.category !== filters.category) return false;
    if (filters.onlyPrivate && !entry.private) return false;
    
    if (filters.dateRange !== 'all') {
      const date = entry.timestamp.toDate();
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          if (date.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (date < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (date < monthAgo) return false;
          break;
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        entry.content.toLowerCase().includes(searchLower) ||
        entry.from.name.toLowerCase().includes(searchLower) ||
        entry.to.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading && !feedback.length) {
    return <LoadingState message="Chargement des feedbacks..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Formulaire de feedback */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Donner un feedback</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <select
                value={newFeedback.to}
                onChange={(e) => setNewFeedback({ ...newFeedback, to: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un utilisateur</option>
                {users
                  .filter(u => u.uid !== currentUser?.uid)
                  .map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName || user.email}
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
                value={newFeedback.type}
                onChange={(e) => setNewFeedback({ 
                  ...newFeedback, 
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={newFeedback.category}
              onChange={(e) => setNewFeedback({
                ...newFeedback,
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
              value={newFeedback.content}
              onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
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
                checked={newFeedback.private}
                onChange={(e) => setNewFeedback({ ...newFeedback, private: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Feedback privé</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Envoi...' : 'Envoyer le feedback'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des feedbacks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Feedbacks reçus</h3>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-1.5 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="praise">Félicitations</option>
              <option value="suggestion">Suggestions</option>
              <option value="concern">Points d'attention</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="performance">Performance</option>
              <option value="collaboration">Collaboration</option>
              <option value="innovation">Innovation</option>
              <option value="leadership">Leadership</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.onlyPrivate}
                onChange={(e) => setFilters(prev => ({ ...prev, onlyPrivate: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Privés uniquement
            </label>

            {(filters.type !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all' || filters.onlyPrivate || filters.search) && (
              <button
                onClick={() => setFilters({
                  type: 'all',
                  category: 'all',
                  dateRange: 'all',
                  onlyPrivate: false,
                  search: ''
                })}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedback.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun feedback ne correspond à vos critères</p>
            </div>
          ) : (
            filteredFeedback.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors shadow-sm hover:shadow-md"
              >
                {/* En-tête de la carte */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.from.avatar || 'https://cdn1.vc4a.com/media/2017/06/eyone-logo.png'}
                        alt={entry.from.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          {entry.from.name}
                          {entry.private && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              <EyeOff className="w-3 h-3" />
                              Privé
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {entry.timestamp.toDate().toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        entry.type === 'praise' ? 'bg-green-100 text-green-800' :
                        entry.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <Tag className="w-3 h-3" />
                        {entry.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        <User className="w-3 h-3" />
                        {entry.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleReaction(entry.id, 'like')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        entry.reactions.some(r => r.userId === currentUser?.uid && r.type === 'like')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {entry.reactions.filter(r => r.type === 'like').length}
                      </span>
                    </button>
                    <button
                      onClick={() => handleReaction(entry.id, 'helpful')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        entry.reactions.some(r => r.userId === currentUser?.uid && r.type === 'helpful')
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {entry.reactions.filter(r => r.type === 'helpful').length}
                      </span>
                    </button>
                    {!entry.private && (
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg ml-auto"
                        title="Signaler"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    )}
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

export default FeedbackSystem;