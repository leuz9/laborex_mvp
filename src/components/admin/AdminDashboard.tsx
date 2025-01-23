import React, { useState } from 'react';
import { 
  BarChart2, Package, Users, ShoppingBag, Bell, Map, LogOut,
  ClipboardList
} from 'lucide-react';
import Overview from './Overview';
import MedicationManagement from './MedicationManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import AlertManagement from './AlertManagement';
import RequestManagement from './RequestManagement';
import MapView from '../MapView';

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'users' | 'orders' | 'alerts' | 'map' | 'requests'>('overview');

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart2 },
    { id: 'medications', label: 'Médicaments', icon: Package },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'requests', label: 'Demandes', icon: ClipboardList },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'alerts', label: 'Alertes', icon: Bell },
    { id: 'map', label: 'Cartographie', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed w-64 h-full bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">PharmaDispo Admin</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center px-6 py-3 text-left
                ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'medications' && <MedicationManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'requests' && <RequestManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'alerts' && <AlertManagement />}
        {activeTab === 'map' && <MapView />}
      </div>
    </div>
  );
}