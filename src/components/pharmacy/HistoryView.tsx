import React, { useState } from 'react';
import { Calendar, Package, ShoppingBag, Search, Filter, Clock, User, Phone, CreditCard } from 'lucide-react';
import type { MedicationRequest, Order } from '../../types';
import { usePharmacyRequests } from '../../hooks/usePharmacyRequests';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';

interface Props {
  pharmacyId: string;
}

type HistoryItem = (MedicationRequest | Order) & { type: 'request' | 'order' };

export default function HistoryView({ pharmacyId }: Props) {
  const { requests } = usePharmacyRequests(pharmacyId);
  const { orders } = usePharmacyOrders(pharmacyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'requests' | 'orders'>('all');

  // Combine and sort requests and orders
  const history: HistoryItem[] = [
    ...requests.map(request => ({ ...request, type: 'request' as const })),
    ...orders.map(order => ({ ...order, type: 'order' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter history items
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.type === 'request'
      ? item.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : item.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const matchesType = typeFilter === 'all' || typeFilter === item.type + 's';

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par médicament..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'requests' | 'orders')}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tout</option>
              <option value="requests">Demandes</option>
              <option value="orders">Commandes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste de l'historique */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {/* En-tête */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {item.type === 'request' ? (
                  <Package className="text-blue-600" />
                ) : (
                  <ShoppingBag className="text-green-600" />
                )}
                <div>
                  <span className="font-medium">
                    {item.type === 'request' ? 'Demande' : 'Commande'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    #{item.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Informations client */}
            {'user' in item && item.user && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Informations client</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-800">
                    <User className="w-4 h-4 mr-2" />
                    <span>{item.user.name}</span>
                  </div>
                  <div className="flex items-center text-blue-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{item.user.phone || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Statut */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === 'request'
                  ? item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : item.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                  : item.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : item.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Liste des médicaments */}
            <div className="space-y-2">
              {item.medications.map((med) => (
                <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                  {'price' in med && (
                    <div className="flex items-center text-gray-900">
                      <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
                      {med.price} FCFA
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Montant total pour les commandes */}
            {'totalAmount' in item && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{item.totalAmount} FCFA</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Aucun élément trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}