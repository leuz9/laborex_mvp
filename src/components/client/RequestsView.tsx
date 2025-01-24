import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import RequestDetailsPopup from '../RequestDetailsPopup';
import type { MedicationRequest } from '../../types';
import { useRequests } from '../../hooks/useRequests';

interface Props {
  userId: string;
}

export default function RequestsView({ userId }: Props) {
  const { requests, loading, error } = useRequests(userId);
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);

  return (
    <div className="space-y-4">
      {selectedRequest && (
        <RequestDetailsPopup
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      <h2 className="text-xl font-semibold mb-4">Mes Demandes</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
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
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Vous n'avez pas encore de demandes</p>
        </div>
      ) : (
        requests.map(request => (
          <div
            key={request.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-x-2">
                <span className={`
                  px-2 py-1 rounded-full text-sm font-medium
                  ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}
                `}>
                  {request.priority === 'high' ? 'Priorité haute' :
                   request.priority === 'medium' ? 'Priorité moyenne' :
                   'Priorité basse'}
                </span>
                <span className={`
                  px-2 py-1 rounded-full text-sm font-medium
                  ${request.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {request.status === 'pending' ? 'En attente' :
                   request.status === 'confirmed' ? 'Confirmé' :
                   request.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              {request.medications.map(med => (
                <div key={med.id} className="flex items-center">
                  <div>
                    <span className="font-medium">{med.name}</span>
                    <span className="text-gray-500 ml-2">- {med.dosage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}