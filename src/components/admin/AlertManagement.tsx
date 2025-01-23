import React from 'react';
import { Bell } from 'lucide-react';
import { mockNotifications } from '../../mockData';
import type { Notification } from '../../types';

export default function AlertManagement() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Alertes et Notifications</h2>
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
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
        ))}
      </div>
    </div>
  );
}