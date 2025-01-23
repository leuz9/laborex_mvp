import React, { useState, useEffect } from 'react';
import { Bell, Star, MessageSquare, Target, TrendingUp, Filter, X, Check, Calendar, Search, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // États des filtres
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
    dateRange: 'all',
    search: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationsForUser(currentUser!.uid);
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'feedback':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await notificationService.markAllAsRead(currentUser.uid);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filtrage des notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    if (filters.read !== 'all') {
      if (filters.read === 'read' && !notification.read) return false;
      if (filters.read === 'unread' && notification.read) return false;
    }

    if (filters.dateRange !== 'all') {
      const date = notification.timestamp.toDate();
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
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading) {
    return <LoadingState message="Chargement des notifications..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadNotifications} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-blue-100">Gérez vos notifications et préférences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Total</div>
            <div className="text-3xl font-bold">{notifications.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Non lues</div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => !n.read).length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Haute priorité</div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Aujourd'hui</div>
            <div className="text-3xl font-bold">
              {notifications.filter(n => 
                n.timestamp.toDate().toDateString() === new Date().toDateString()
              ).length}
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
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="feedback">Feedback</option>
            <option value="achievement">Réussite</option>
            <option value="reminder">Rappel</option>
            <option value="performance">Performance</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={filters.read}
            onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes</option>
            <option value="read">Lues</option>
            <option value="unread">Non lues</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>

          {(filters.type !== 'all' || filters.priority !== 'all' || filters.read !== 'all' || 
            filters.dateRange !== 'all' || filters.search) && (
            <button
              onClick={() => setFilters({
                type: 'all',
                priority: 'all',
                read: 'all',
                dateRange: 'all',
                search: ''
              })}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}

          <button
            onClick={markAllAsRead}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune notification ne correspond à vos critères</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => {
                if (!notification.read) markAsRead(notification.id);
                setSelectedNotification(notification);
              }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notification.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : notification.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {notification.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {notification.timestamp.toDate().toLocaleString()}
                    </span>
                    {!notification.read && (
                      <span className="text-xs font-medium text-blue-600">
                        Nouveau
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions au survol */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {notification.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = notification.link!;
                    }}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded"
                    title="Voir plus"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;