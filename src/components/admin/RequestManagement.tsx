import React from 'react';
import { Clock, AlertCircle, Package, MapPin, Loader2 } from 'lucide-react';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import type { MedicationRequest } from '../../types';

export default function RequestManagement() {
  const { requests, loading, error } = useAdminRequests();

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Gestion des demandes</h2>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune demande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {request.priority === 'high' ? 'Priorité haute' :
                         request.priority === 'medium' ? 'Priorité moyenne' :
                         'Priorité basse'}
                      </span>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${request.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          request.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'confirmed' ? 'Confirmé' :
                         request.status === 'preparing' ? 'En préparation' :
                         request.status === 'ready' ? 'Prêt' :
                         'Complété'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        ID Client: {request.userId}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 mt-1" />
                      <span>
                        Position: {request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-gray-700 mb-2">Médicaments demandés:</div>
                    {request.medications.map(med => (
                      <div key={med.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm text-gray-500">{med.dosage}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {med.price} FCFA
                        </div>
                      </div>
                    ))}
                  </div>

                  {request.confirmedPharmacies && request.confirmedPharmacies.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {request.confirmedPharmacies.length} pharmacie(s) ont confirmé la disponibilité
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}