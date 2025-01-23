import React from 'react';
import { ShoppingBag, Users, Store, Clock, AlertCircle } from 'lucide-react';
import { mockStatistics } from '../../mockData';

export default function Overview() {
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