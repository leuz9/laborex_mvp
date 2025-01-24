import React from 'react';
import { Package, Bell, Map, ClipboardList, ShoppingBag } from 'lucide-react';
import UserProfileMenu from '../UserProfileMenu';
import type { User } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  user: User;
  activeTab: 'search' | 'requests' | 'notifications' | 'duty' | 'orders';
  onTabChange: (tab: 'search' | 'requests' | 'notifications' | 'duty' | 'orders') => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function ClientHeader({ user, activeTab, onTabChange, onLogout, onOpenSettings }: Props) {
  const { notifications } = useNotifications(user.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 mr-8">PharmaDispo</h1>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => onTabChange('search')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Rechercher
              </button>
              <button
                onClick={() => onTabChange('duty')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'duty' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Map className="w-4 h-4 mr-2" />
                Pharmacies de garde
              </button>
              <button
                onClick={() => onTabChange('requests')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Mes Demandes
              </button>
              <button
                onClick={() => onTabChange('orders')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mes Commandes
              </button>
              <button
                onClick={() => onTabChange('notifications')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium relative ${
                  activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <UserProfileMenu
            user={user}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>

      {/* Menu mobile */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => onTabChange('search')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            Rechercher
          </button>
          <button
            onClick={() => onTabChange('duty')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === 'duty' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Map className="w-5 h-5 mb-1" />
            Garde
          </button>
          <button
            onClick={() => onTabChange('requests')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-1" />
            Demandes
          </button>
          <button
            onClick={() => onTabChange('orders')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-1" />
            Commandes
          </button>
          <button
            onClick={() => onTabChange('notifications')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs relative ${
              activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Bell className="w-5 h-5 mb-1" />
            Notifs
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}