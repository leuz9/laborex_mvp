import React from 'react';
import { Bell, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  userId: string;
}

export default function NotificationsView({ userId }: Props) {
  const { notifications, loading, error } = useNotifications(userId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
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
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Vous n'avez pas de notifications</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-start">
              <Bell className={`flex-shrink-0 w-5 h-5 mt-1 ${
                notification.read ? 'text-gray-400' : 'text-blue-500'
              }`} />
              <div className="ml-3">
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}