import React, { useState } from 'react';
import { X, Package, Clock, MapPin, AlertTriangle, UserIcon, Phone, Store, Navigation2, Check } from 'lucide-react';
import type { MedicationRequest, User, Medication } from '../types';
import { mockUsers, mockPharmacies } from '../mockData';

interface Props {
  request: MedicationRequest;
  isPharmacyView?: boolean;
  onClose: () => void;
}

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function RequestDetailsPopup({ request, isPharmacyView = false, onClose }: Props) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);

  const user = mockUsers.find(u => u.id === request.userId) as User;
  const confirmedPharmacies = request.confirmedPharmacies 
    ? mockPharmacies.filter(p => request.confirmedPharmacies?.includes(p.id))
    : [];

  // Grouper les pharmacies par médicament
  const pharmaciesByMedication = request.medications.reduce((acc, med) => {
    acc[med.id] = confirmedPharmacies.filter(pharmacy => {
      return request.confirmedPharmacies?.includes(pharmacy.id);
    });
    return acc;
  }, {} as Record<string, typeof confirmedPharmacies>);

  const handleOrder = (pharmacyId: string, medication: Medication) => {
    const pharmacy = mockPharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return;

    // Vérifier si d'autres médicaments sont disponibles dans cette pharmacie
    const otherAvailableMedications = request.medications.filter(med => 
      med.id !== medication.id && pharmaciesByMedication[med.id]?.some(p => p.id === pharmacyId)
    );

    if (otherAvailableMedications.length > 0) {
      setSelectedPharmacy(pharmacyId);
      setSelectedMedications([medication]);
      setShowOrderModal(true);
    } else {
      // Si pas d'autres médicaments disponibles, commander directement
      console.log('Commander auprès de la pharmacie:', pharmacyId, 'médicaments:', [medication]);
    }
  };

  const handleConfirmOrder = () => {
    if (!selectedPharmacy) return;
    console.log('Commander auprès de la pharmacie:', selectedPharmacy, 'médicaments:', selectedMedications);
    setShowOrderModal(false);
    setSelectedPharmacy(null);
    setSelectedMedications([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {showOrderModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Commander plusieurs médicaments</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cette pharmacie dispose également d'autres médicaments de votre demande. 
              Souhaitez-vous les inclure dans votre commande ?
            </p>
            <div className="space-y-3 mb-6">
              {request.medications.map(med => {
                const isAvailable = pharmaciesByMedication[med.id]?.some(p => p.id === selectedPharmacy);
                const isSelected = selectedMedications.some(m => m.id === med.id);
                if (!isAvailable) return null;

                return (
                  <label
                    key={med.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedMedications(prev => prev.filter(m => m.id !== med.id));
                        } else {
                          setSelectedMedications(prev => [...prev, med]);
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedPharmacy(null);
                  setSelectedMedications([]);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmer la commande
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Détails de la demande</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* En-tête avec statut et priorité */}
            <div className="flex flex-wrap gap-3">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  request.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'}
              `}>
                {request.status === 'pending' ? 'En attente' :
                 request.status === 'confirmed' ? 'Confirmé' :
                 request.status === 'preparing' ? 'En préparation' :
                 request.status === 'ready' ? 'Prêt' :
                 'Complété'}
              </span>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                  request.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'}
              `}>
                {request.priority === 'high' ? 'Priorité haute' :
                 request.priority === 'medium' ? 'Priorité moyenne' :
                 'Priorité basse'}
              </span>
            </div>

            {/* Informations sur le demandeur (visible uniquement pour les pharmacies) */}
            {isPharmacyView && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <UserIcon className="mr-2" size={20} />
                  Informations du patient
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600">{user.name}</p>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-gray-600 flex items-center">
                    <Phone className="mr-2" size={16} />
                    +221 77 XXX XX XX
                  </p>
                </div>
              </div>
            )}

            {/* Liste des médicaments avec leurs pharmacies disponibles */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Package className="mr-2" size={20} />
                Médicaments demandés
              </h3>
              <div className="space-y-4">
                {request.medications.map(med => (
                  <div key={med.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                      <p className="text-sm text-gray-500">{med.description}</p>
                    </div>

                    {request.status === 'confirmed' && pharmaciesByMedication[med.id]?.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Store className="w-4 h-4 mr-1" />
                          Pharmacies disponibles
                        </h4>
                        <div className="space-y-2">
                          {pharmaciesByMedication[med.id].map(pharmacy => {
                            const distance = calculateDistance(
                              request.location.latitude,
                              request.location.longitude,
                              pharmacy.location.latitude,
                              pharmacy.location.longitude
                            );

                            return (
                              <div key={pharmacy.id} className="bg-green-50 p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-green-800 text-sm">{pharmacy.name}</p>
                                    <p className="text-xs text-green-700">{pharmacy.address}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center text-green-700">
                                        <Navigation2 className="w-3 h-3 mr-1" />
                                        <span className="text-xs">{distance.toFixed(1)} km</span>
                                      </div>
                                      {pharmacy.onDuty && (
                                        <div className="flex items-center text-green-700">
                                          <Phone className="w-3 h-3 mr-1" />
                                          <span className="text-xs">{pharmacy.onDuty.phone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleOrder(pharmacy.id, med)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Commander
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Informations temporelles */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Clock className="mr-2" size={20} />
                Informations temporelles
              </h3>
              <p className="text-gray-600">
                Créée le : {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Localisation */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <MapPin className="mr-2" size={20} />
                Localisation
              </h3>
              <p className="text-gray-600">
                Latitude : {request.location.latitude}
                <br />
                Longitude : {request.location.longitude}
              </p>
            </div>

            {/* Notes importantes */}
            {request.priority === 'high' && (
              <div className="bg-red-50 p-4 rounded-lg flex items-start">
                <AlertTriangle className="text-red-500 mr-2 mt-1" size={20} />
                <p className="text-red-700 text-sm">
                  Cette demande est marquée comme prioritaire et nécessite une attention immédiate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}