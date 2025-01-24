import React from 'react';
import { Clock, Package, User, Phone, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import type { Order } from '../../types';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';

interface Props {
  pharmacyId: string;
}

export default function OrderList({ pharmacyId }: Props) {
  const { orders, loading, error } = usePharmacyOrders(pharmacyId);

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
        <p className="text-gray-500">Aucune commande pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          {/* En-tête de la commande */}
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
              <span className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center text-lg font-bold text-gray-900">
              <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
              {order.totalAmount} FCFA
            </div>
          </div>

          {/* Informations client */}
          {'user' in order && order.user && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Informations client</h4>
              <div className="space-y-2">
                <div className="flex items-center text-blue-800">
                  <User className="w-4 h-4 mr-2" />
                  <span>{order.user.name}</span>
                </div>
                <div className="flex items-center text-blue-800">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{order.user.phone || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Liste des médicaments */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Médicaments commandés
            </h4>
            {order.medications.map((med) => (
              <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                </div>
                <span className="font-medium text-gray-900">{med.price} FCFA</span>
              </div>
            ))}
          </div>

          {/* Horodatage */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              Commandé le {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}