import React from 'react';
import { Bell, Clock, Package, ShoppingBag, Loader2, AlertCircle, CheckCircle, MapPin, CreditCard } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  userId: string;
}

export default function NotificationsView({ userId }: Props) {
  const { notifications, loading, error, markAsRead } = useNotifications(userId);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_request':
        return Package;
      case 'availability_confirmed':
        return CheckCircle;
      case 'order_paid':
        return CreditCard;
      case 'order_preparing':
        return Package;
      case 'order_ready':
        return ShoppingBag;
      case 'order_completed':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_request':
        return 'text-blue-500';
      case 'availability_confirmed':
        return 'text-green-500';
      case 'order_paid':
        return 'text-purple-500';
      case 'order_preparing':
        return 'text-orange-500';
      case 'order_ready':
        return 'text-indigo-500';
      case 'order_completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getNotificationBackground = (type: string, read: boolean) => {
    if (read) return 'bg-white';
    
    switch (type) {
      case 'new_request':
        return 'bg-blue-50';
      case 'availability_confirmed':
        return 'bg-green-50';
      case 'order_paid':
        return 'bg-purple-50';
      case 'order_preparing':
        return 'bg-orange-50';
      case 'order_ready':
        return 'bg-indigo-50';
      case 'order_completed':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* En-tête avec compteur */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pas de notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Vous serez notifié des mises à jour importantes ici.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type || '');
            const iconColor = getNotificationColor(notification.type || '');
            const bgColor = getNotificationBackground(notification.type || '', notification.read);
            
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`${bgColor} p-6 rounded-lg border transition-all transform hover:scale-[1.02] cursor-pointer ${
                  notification.read ? 'border-gray-200' : 'border-blue-200 shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 rounded-full p-2 ${notification.read ? 'bg-gray-100' : 'bg-white'}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-base font-medium ${
                          notification.read ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`mt-1 text-sm ${
                          notification.read ? 'text-gray-500' : 'text-gray-800'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 ml-4">
                        <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Informations supplémentaires selon le type */}
                    {notification.pharmacyId && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>Pharmacie ID: {notification.pharmacyId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}