import React, { useState } from 'react';
import { Clock, Package, Calendar, CheckCircle, Loader2, AlertCircle, Phone, User, CreditCard, MessageSquare } from 'lucide-react';
import type { MedicationRequest } from '../../types';
import RequestDetailsPopup from '../RequestDetailsPopup';
import ConfirmationModal from './modals/ConfirmationModal';
import UnavailableModal from './modals/UnavailableModal';

interface Props {
  requests: MedicationRequest[];
  loading: boolean;
  error: string | null;
  activeTab: 'pending' | 'confirmed';
  onConfirmAvailability: (requestId: string) => Promise<boolean>;
  onSetUnavailable: (requestId: string, restockDate: string) => Promise<boolean>;
}

interface MedicationAvailability {
  available: boolean;
  price?: number;
  comment?: string;
}

export default function RequestList({
  requests,
  loading,
  error,
  activeTab,
  onConfirmAvailability,
  onSetUnavailable
}: Props) {
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [medicationAvailability, setMedicationAvailability] = useState<Record<string, MedicationAvailability>>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filteredRequests = requests.filter(request => 
    activeTab === 'pending' ? request.status === 'pending' : request.status === 'confirmed'
  );

  const handleConfirm = async (request: MedicationRequest) => {
    const hasAvailableMedications = Object.values(medicationAvailability).some(med => med.available);
    
    if (hasAvailableMedications) {
      setConfirmLoading(true);
      try {
        const success = await onConfirmAvailability(request.id);
        if (success) {
          setSelectedRequest(request);
          setShowConfirmation(true);
          setTimeout(() => {
            setShowConfirmation(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Error confirming availability:', error);
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleUnavailable = async (request: MedicationRequest, restockDate: string) => {
    const success = await onSetUnavailable(request.id, restockDate);
    if (success) {
      setShowUnavailableModal(false);
      setSelectedMedicationId(null);
    }
  };

  const toggleMedicationAvailability = (medicationId: string) => {
    setMedicationAvailability(prev => ({
      ...prev,
      [medicationId]: {
        available: !prev[medicationId]?.available,
        price: prev[medicationId]?.price,
        comment: prev[medicationId]?.comment
      }
    }));
  };

  const updateMedicationDetails = (medicationId: string, field: 'price' | 'comment', value: string | number) => {
    setMedicationAvailability(prev => ({
      ...prev,
      [medicationId]: {
        ...prev[medicationId],
        [field]: value
      }
    }));
  };

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
    <div className="space-y-4">
      {selectedRequest && !showConfirmation && !showUnavailableModal && (
        <RequestDetailsPopup
          request={selectedRequest}
          isPharmacyView={true}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {showConfirmation && selectedRequest && (
        <ConfirmationModal onClose={() => setShowConfirmation(false)} />
      )}

      {showUnavailableModal && selectedRequest && selectedMedicationId && (
        <UnavailableModal
          request={selectedRequest}
          medicationId={selectedMedicationId}
          onClose={() => {
            setShowUnavailableModal(false);
            setSelectedMedicationId(null);
          }}
          onConfirm={(restockDate) => handleUnavailable(selectedRequest, restockDate)}
        />
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {activeTab === 'pending' ? 'Aucune demande en attente' : 'Aucune demande confirmée'}
          </p>
        </div>
      ) : (
        filteredRequests.map(request => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
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
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(request)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Voir détails
              </button>
            </div>

            {activeTab === 'confirmed' && 'user' in request && request.user && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Informations client</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-800">
                    <User className="w-4 h-4 mr-2" />
                    <span>{request.user.name}</span>
                  </div>
                  <div className="flex items-center text-blue-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{request.user.phone || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {request.medications.map(med => (
                <div key={med.id} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="text-gray-400" size={20} />
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                      </div>
                    </div>
                    {activeTab === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setSelectedMedicationId(med.id);
                            setShowUnavailableModal(true);
                          }}
                          className="flex items-center px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Indisponible
                        </button>
                        <button
                          onClick={() => toggleMedicationAvailability(med.id)}
                          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors
                            ${medicationAvailability[med.id]?.available
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                          `}
                        >
                          {medicationAvailability[med.id]?.available ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Disponible
                            </>
                          ) : (
                            'Marquer disponible'
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'pending' && medicationAvailability[med.id]?.available && (
                    <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <CreditCard className="w-4 h-4 inline-block mr-1" />
                            Prix proposé (FCFA)
                          </label>
                          <input
                            type="number"
                            value={medicationAvailability[med.id]?.price || ''}
                            onChange={(e) => updateMedicationDetails(med.id, 'price', Number(e.target.value))}
                            placeholder="Prix en FCFA"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MessageSquare className="w-4 h-4 inline-block mr-1" />
                          Commentaire (facultatif)
                        </label>
                        <textarea
                          value={medicationAvailability[med.id]?.comment || ''}
                          onChange={(e) => updateMedicationDetails(med.id, 'comment', e.target.value)}
                          placeholder="Ajouter un commentaire..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeTab === 'pending' && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleConfirm(request)}
                  disabled={confirmLoading || !Object.values(medicationAvailability).some(med => med.available)}
                  className={`flex items-center px-4 py-2 rounded-lg
                    ${confirmLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : Object.values(medicationAvailability).some(med => med.available)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  {confirmLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {confirmLoading ? 'Confirmation...' : 'Confirmer disponibilité'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}