import React, { useState } from 'react';
import { X, Package, Clock, MapPin, AlertTriangle, UserIcon, Phone, Store, ShoppingBag, Loader2, Check } from 'lucide-react';
import type { MedicationRequest, Medication } from '../types';
import { useRequestDetails } from '../hooks/useRequestDetails';
import { useConfirmedPharmacies } from '../hooks/useConfirmedPharmacies';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';

interface Props {
  request: MedicationRequest;
  isPharmacyView?: boolean;
  onClose: () => void;
}

export default function RequestDetailsPopup({ request, isPharmacyView = false, onClose }: Props) {
  const { user: currentUser } = useAuth();
  const { user, loading: userLoading, error: userError } = useRequestDetails(request.userId);
  const { pharmacies, loading: pharmaciesLoading } = useConfirmedPharmacies(request.confirmedPharmacies);
  const { createOrder } = useOrders();
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showGroupOrderModal, setShowGroupOrderModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);

  // Grouper les médicaments par pharmacie
  const medicationsByPharmacy = pharmacies.reduce((acc, pharmacy) => {
    const availableMedications = request.medications.filter(med => 
      request.confirmedPharmacies?.includes(pharmacy.id)
    );
    if (availableMedications.length > 0) {
      acc[pharmacy.id] = availableMedications;
    }
    return acc;
  }, {} as Record<string, Medication[]>);

  const handleOrder = async (pharmacyId: string, medication: Medication) => {
    if (!currentUser) return;

    // Vérifier si la pharmacie a d'autres médicaments disponibles
    const pharmacyMedications = medicationsByPharmacy[pharmacyId] || [];
    const otherMedications = pharmacyMedications.filter(med => med.id !== medication.id);

    if (otherMedications.length > 0) {
      setSelectedPharmacy(pharmacyId);
      setSelectedMedications([medication]);
      setShowGroupOrderModal(true);
    } else {
      // Commander directement si un seul médicament disponible
      await processOrder(pharmacyId, [medication]);
    }
  };

  const processOrder = async (pharmacyId: string, medications: Medication[]) => {
    if (!currentUser) return;
    
    setOrderLoading(pharmacyId);
    setOrderError(null);

    try {
      const success = await createOrder(
        currentUser.id,
        pharmacyId,
        medications,
        request.id
      );

      if (success) {
        onClose();
      } else {
        setOrderError('Erreur lors de la création de la commande');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError('Une erreur est survenue');
    } finally {
      setOrderLoading(null);
      setShowGroupOrderModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal de commande groupée */}
      {showGroupOrderModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Commander plusieurs médicaments</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cette pharmacie dispose également d'autres médicaments de votre demande. 
              Souhaitez-vous les inclure dans votre commande ?
            </p>
            <div className="space-y-3 mb-6">
              {medicationsByPharmacy[selectedPharmacy].map(med => {
                const isSelected = selectedMedications.some(m => m.id === med.id);
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
                      <p className="text-sm text-gray-500">{med.price} FCFA</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGroupOrderModal(false);
                  setSelectedPharmacy(null);
                  setSelectedMedications([]);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => processOrder(selectedPharmacy, selectedMedications)}
                disabled={selectedMedications.length === 0 || orderLoading === selectedPharmacy}
                className={`flex items-center px-4 py-2 rounded-lg text-white ${
                  orderLoading === selectedPharmacy
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {orderLoading === selectedPharmacy ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShoppingBag className="w-4 h-4 mr-2" />
                )}
                Commander {selectedMedications.length} médicament{selectedMedications.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
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
            {isPharmacyView && user && (
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
                    {user.phone || 'Non renseigné'}
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

                    {!isPharmacyView && request.status === 'confirmed' && pharmacies.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Store className="w-4 h-4 mr-1" />
                          Pharmacies disponibles
                        </h4>
                        <div className="space-y-2">
                          {pharmacies.map(pharmacy => (
                            <div key={pharmacy.id} className="bg-green-50 p-3 rounded-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-green-800 text-sm">{pharmacy.name}</p>
                                  <div className="flex items-center text-green-700 mt-1">
                                    <Phone className="w-3 h-3 mr-1" />
                                    <span className="text-xs">
                                      {pharmacy.phone || 'Numéro non disponible'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleOrder(pharmacy.id, med)}
                                  disabled={!!orderLoading}
                                  className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                                    orderLoading === pharmacy.id
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {orderLoading === pharmacy.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-4 h-4 mr-1" />
                                      Commander
                                    </>
                                  )}
                                </button>
                              </div>
                              {orderError && orderLoading === pharmacy.id && (
                                <p className="text-xs text-red-600 mt-2">{orderError}</p>
                              )}
                            </div>
                          ))}
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