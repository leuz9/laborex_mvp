import React, { useState } from 'react';
import { CheckCircle, XCircle, Package, Phone, Calendar } from 'lucide-react';
import type { MedicationRequest, Pharmacy } from '../types';
import RequestDetailsPopup from './RequestDetailsPopup';

interface Props {
  pharmacy: Pharmacy;
  requests: MedicationRequest[];
  onConfirmAvailability: (requestId: string) => void;
}

export default function PharmacyDashboard({ pharmacy, requests, onConfirmAvailability }: Props) {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed'>('pending');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);
  const [restockDate, setRestockDate] = useState('');

  const filteredRequests = requests.filter(request => 
    activeTab === 'pending' ? request.status === 'pending' : request.status === 'confirmed'
  );

  const handleConfirm = (request: MedicationRequest) => {
    onConfirmAvailability(request.id);
    setSelectedRequest(request);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  const handleUnavailable = (request: MedicationRequest) => {
    setSelectedRequest(request);
    setShowUnavailableModal(true);
  };

  const handleRestockSubmit = () => {
    console.log('Restock date set for:', restockDate);
    setShowUnavailableModal(false);
    setRestockDate('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Popup de détails */}
      {selectedRequest && !showConfirmation && !showUnavailableModal && (
        <RequestDetailsPopup
          request={selectedRequest}
          isPharmacyView={true}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Modal de Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-bounce">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Disponibilité confirmée!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Le client a été notifié de la disponibilité des médicaments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Réapprovisionnement */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Prochaine disponibilité</h3>
            <p className="text-sm text-gray-500 mb-4">
              Veuillez indiquer la date prévue de réapprovisionnement pour :
              {selectedRequest?.medications.map(med => (
                <span key={med.id} className="block font-medium mt-1">{med.name} - {med.dosage}</span>
              ))}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de réapprovisionnement
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={restockDate}
                onChange={(e) => setRestockDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnavailableModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleRestockSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{pharmacy.name}</h1>
        <p className="text-gray-600 mb-6">{pharmacy.address}</p>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Demandes en attente
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'confirmed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActiveTab('confirmed')}
          >
            Demandes confirmées
          </button>
        </div>

        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}
                  `}>
                    {request.priority === 'high' ? 'Priorité haute' :
                     request.priority === 'medium' ? 'Priorité moyenne' :
                     'Priorité basse'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {request.medications.map(med => (
                  <div key={med.id} className="flex items-center">
                    <Package className="text-gray-400 mr-2" size={16} />
                    <span>{med.name} - {med.dosage}</span>
                  </div>
                ))}
              </div>

              {request.status === 'confirmed' && (
                <div className="flex items-center text-gray-600 mb-4">
                  <Phone className="mr-2" size={16} />
                  <span>+221 77 123 45 67</span>
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(request);
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Confirmer disponibilité
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnavailable(request);
                    }}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Calendar className="mr-2" size={16} />
                    Indisponible
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}