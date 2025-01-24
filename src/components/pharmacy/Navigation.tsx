import React from 'react';
import { Package, CheckCircle, Bell, Map, ShoppingBag, History } from 'lucide-react';

interface Props {
  activeTab: 'pending' | 'confirmed' | 'orders' | 'history' | 'notifications';
  onTabChange: (tab: 'pending' | 'confirmed' | 'orders' | 'history' | 'notifications') => void;
  unreadNotifications?: number;
}

export default function Navigation({ activeTab, onTabChange, unreadNotifications = 0 }: Props) {
  const menuItems = [
    { id: 'pending', label: 'Demandes', icon: Package },
    { id: 'confirmed', label: 'Confirmées', icon: CheckCircle },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'history', label: 'Historique', icon: History }
  ];

  return (
    <div className="mb-6 flex space-x-4 overflow-x-auto pb-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id as any)}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap relative
            ${(activeTab === item.id)
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'}
          `}
        >
          <item.icon className="h-5 w-5 mr-2" />
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}