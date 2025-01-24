import React from 'react';
import { Bell, Clock, Package, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  pharmacyId: string;
}

export default function NotificationsView({ pharmacyId }: Props) {
  const { notifications, loading, error, markAsRead } = useNotifications(pharmacyId);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
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

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Pas de notifications</h3>
          <p className="mt-1 text-sm text-gray-500">Vous serez notifié des nouvelles demandes et commandes ici.</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              notification.read
                ? 'bg-white border-gray-200'
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-start space-x-3">
              {notification.type === 'new_request' ? (
                <Package className={`flex-shrink-0 h-6 w-6 ${
                  notification.read ? 'text-gray-400' : 'text-blue-500'
                }`} />
              ) : (
                <ShoppingBag className={`flex-shrink-0 h-6 w-6 ${
                  notification.read ? 'text-gray-400' : 'text-blue-500'
                }`} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    notification.read ? 'text-gray-900' : 'text-blue-900'
                  }`}>
                    {notification.title}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className={`mt-1 text-sm ${
                  notification.read ? 'text-gray-500' : 'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}