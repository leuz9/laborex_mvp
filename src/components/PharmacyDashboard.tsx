import React, { useState } from 'react';
import { CheckCircle, XCircle, Package, Phone, Calendar, Store, Bell, Map, Menu, X, ChevronDown } from 'lucide-react';
import type { MedicationRequest, Pharmacy, Medication } from '../types';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [medicationAvailability, setMedicationAvailability] = useState<Record<string, boolean>>({});

  const filteredRequests = requests.filter(request => 
    activeTab === 'pending' ? request.status === 'pending' : request.status === 'confirmed'
  );

  const handleConfirm = (request: MedicationRequest) => {
    // Vérifier si au moins un médicament est marqué comme disponible
    const hasAvailableMedications = request.medications.some(med => medicationAvailability[med.id]);
    
    if (hasAvailableMedications) {
      onConfirmAvailability(request.id);
      setSelectedRequest(request);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }
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

  const toggleMedicationAvailability = (medicationId: string) => {
    setMedicationAvailability(prev => ({
      ...prev,
      [medicationId]: !prev[medicationId]
    }));
  };

  const menuItems = [
    { icon: Package, label: 'Demandes', onClick: () => setActiveTab('pending') },
    { icon: CheckCircle, label: 'Confirmées', onClick: () => setActiveTab('confirmed') },
    { icon: Bell, label: 'Notifications', onClick: () => console.log('Notifications') },
    { icon: Map, label: 'Carte', onClick: () => console.log('Carte') },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">{pharmacy.name}</span>
              </div>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${(activeTab === 'pending' && item.label === 'Demandes') ||
                    (activeTab === 'confirmed' && item.label === 'Confirmées')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Menu mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Popups et modals */}
        {selectedRequest && !showConfirmation && !showUnavailableModal && (
          <RequestDetailsPopup
            request={selectedRequest}
            isPharmacyView={true}
            onClose={() => setSelectedRequest(null)}
          />
        )}

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

        {/* Liste des demandes */}
        <div className="space-y-4">
          {filteredRequests.map(request => (
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

              <div className="space-y-4">
                {request.medications.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="text-gray-400" size={20} />
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                      </div>
                    </div>
                    {activeTab === 'pending' && (
                      <button
                        onClick={() => toggleMedicationAvailability(med.id)}
                        className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors
                          ${medicationAvailability[med.id]
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                      >
                        {medicationAvailability[med.id] ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Disponible
                          </>
                        ) : (
                          'Marquer disponible'
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {activeTab === 'pending' && (
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleUnavailable(request)}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Indisponible
                  </button>
                  <button
                    onClick={() => handleConfirm(request)}
                    className={`flex items-center px-4 py-2 rounded-lg
                      ${Object.values(medicationAvailability).some(Boolean)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                    disabled={!Object.values(medicationAvailability).some(Boolean)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmer disponibilité
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