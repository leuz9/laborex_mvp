import React, { useState } from 'react';
import { 
  Users, ShoppingBag, Store, Clock, AlertCircle,
  BarChart2, Settings, Bell, Search, Map
} from 'lucide-react';
import { mockStatistics, mockUsers, mockOrders, mockNotifications } from '../mockData';
import type { User, Order, Notification } from '../types';
import MapView from './MapView';

// Composant Overview
function Overview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Commandes</h3>
          <ShoppingBag className="text-blue-600" />
        </div>
        <p className="text-3xl font-bold">{mockStatistics.totalOrders}</p>
        <p className="text-sm text-gray-500 mt-2">Total des commandes</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Utilisateurs</h3>
          <Users className="text-green-600" />
        </div>
        <p className="text-3xl font-bold">{mockStatistics.totalUsers}</p>
        <p className="text-sm text-gray-500 mt-2">Utilisateurs actifs</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pharmacies</h3>
          <Store className="text-purple-600" />
        </div>
        <p className="text-3xl font-bold">{mockStatistics.totalPharmacies}</p>
        <p className="text-sm text-gray-500 mt-2">Pharmacies partenaires</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Temps de réponse</h3>
          <Clock className="text-orange-600" />
        </div>
        <p className="text-3xl font-bold">{mockStatistics.averageResponseTime}min</p>
        <p className="text-sm text-gray-500 mt-2">Temps de réponse moyen</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Demandes en attente</h3>
          <AlertCircle className="text-red-600" />
        </div>
        <p className="text-3xl font-bold">{mockStatistics.pendingRequests}</p>
        <p className="text-sm text-gray-500 mt-2">À traiter</p>
      </div>
    </div>
  );
}

// Composant UserManagement
function UserManagement() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des utilisateurs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'pharmacy' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900 mr-2">
                    Éditer
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Désactiver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant OrderManagement
function OrderManagement() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des commandes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pharmacie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {mockUsers.find(u => u.id === order.userId)?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.pharmacyId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.totalAmount} FCFA</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant AlertManagement
function AlertManagement() {
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'alerts' | 'map'>('overview');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed w-64 h-full bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">PharmaDispo Admin</h1>
        </div>
        <nav className="mt-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart2 },
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'orders', label: 'Commandes', icon: ShoppingBag },
            { id: 'alerts', label: 'Alertes', icon: Bell },
            { id: 'map', label: 'Cartographie', icon: Map },
          ].map(item => (
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'alerts' && <AlertManagement />}
        {activeTab === 'map' && <MapView />}
      </div>
    </div>
  );
}