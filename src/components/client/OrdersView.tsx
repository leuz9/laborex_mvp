import React, { useState } from 'react';
import { Loader2, AlertCircle, ShoppingBag, Filter, Search, Clock, Star } from 'lucide-react';
import OrderTracking from '../OrderTracking';
import { useClientOrders } from '../../hooks/useClientOrders';

interface Props {
  userId: string;
}

export default function OrdersView({ userId }: Props) {
  const { orders, loading, error } = useClientOrders(userId);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Filtrer et trier les commandes
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.medications.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.totalAmount - a.totalAmount;
      }
    });

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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Pas de commandes</h3>
        <p className="mt-1 text-sm text-gray-500">Vos commandes apparaîtront ici.</p>
      </div>
    );
  }

  const selectedOrderData = orders.find(order => order.id === selectedOrder);

  return (
    <div className="space-y-6">
      {selectedOrderData && (
        <OrderTracking
          order={selectedOrderData}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Filtres et recherche */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="completed">Complétée</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Trier par date</option>
              <option value="amount">Trier par montant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order.id)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {order.status === 'pending' ? 'En attente' :
                   order.status === 'paid' ? 'Payée' :
                   order.status === 'preparing' ? 'En préparation' :
                   order.status === 'ready' ? 'Prête' :
                   'Complétée'}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {order.totalAmount} FCFA
                </span>
                {order.rating && (
                  <div className="flex items-center justify-end mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{order.rating}/5</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {order.medications.map(med => (
                <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {med.price} FCFA
                  </span>
                </div>
              ))}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {order.paymentMethod && (
                  <span>
                    Paiement : {order.paymentMethod === 'card' ? 'Carte bancaire' :
                               order.paymentMethod === 'mobile_money' ? 'Mobile Money' :
                               'Espèces'}
                  </span>
                )}
                {order.preparedAt && (
                  <span>Préparé le : {new Date(order.preparedAt).toLocaleString()}</span>
                )}
                {order.completedAt && (
                  <span>Terminé le : {new Date(order.completedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Aucune commande ne correspond à vos critères</p>
          </div>
        )}
      </div>
    </div>
  );
}