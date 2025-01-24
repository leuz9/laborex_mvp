import React, { useState } from 'react';
import { Package, Store, Phone, ShoppingBag, Loader2, MessageSquare, CreditCard, Check } from 'lucide-react';
import type { MedicationRequest, Medication } from '../../types';
import { useConfirmedPharmacies } from '../../hooks/useConfirmedPharmacies';

interface Props {
  request: MedicationRequest;
  isPharmacyView: boolean;
  onOrder: (pharmacyId: string, medication: Medication) => void;
  orderLoading: string | null;
  orderError: string | null;
}

interface OrderSelection {
  pharmacyId: string;
  medication: Medication;
}

export default function RequestMedicationList({
  request,
  isPharmacyView,
  onOrder,
  orderLoading,
  orderError
}: Props) {
  const { pharmacies, loading: pharmaciesLoading } = useConfirmedPharmacies(request.confirmedPharmacies);
  const [selectedOrders, setSelectedOrders] = useState<OrderSelection[]>([]);

  // Vérifier si une pharmacie n'a qu'un seul médicament disponible
  const hasSingleMedication = (pharmacyId: string): boolean => {
    const availableMedications = request.medications.filter(med => 
      request.confirmedPharmacies?.includes(pharmacyId)
    );
    return availableMedications.length === 1;
  };

  // Récupérer les détails de disponibilité pour un médicament
  const getAvailabilityDetails = (pharmacyId: string, medicationId: string) => {
    if (!request.availabilityDetails?.[pharmacyId]?.[medicationId]) return null;
    return request.availabilityDetails[pharmacyId][medicationId];
  };

  // Gérer la sélection d'une commande
  const toggleOrderSelection = (pharmacyId: string, medication: Medication) => {
    setSelectedOrders(prev => {
      const isSelected = prev.some(
        order => order.pharmacyId === pharmacyId && order.medication.id === medication.id
      );

      if (isSelected) {
        return prev.filter(
          order => !(order.pharmacyId === pharmacyId && order.medication.id === medication.id)
        );
      } else {
        return [...prev, { pharmacyId, medication }];
      }
    });
  };

  // Vérifier si une commande est sélectionnée
  const isOrderSelected = (pharmacyId: string, medicationId: string) => {
    return selectedOrders.some(
      order => order.pharmacyId === pharmacyId && order.medication.id === medicationId
    );
  };

  // Traiter toutes les commandes sélectionnées
  const handleBulkOrder = async () => {
    // Grouper les commandes par pharmacie
    const ordersByPharmacy = selectedOrders.reduce((acc, order) => {
      if (!acc[order.pharmacyId]) {
        acc[order.pharmacyId] = [];
      }
      acc[order.pharmacyId].push(order.medication);
      return acc;
    }, {} as Record<string, Medication[]>);

    // Traiter chaque groupe de commandes
    for (const [pharmacyId, medications] of Object.entries(ordersByPharmacy)) {
      await onOrder(pharmacyId, medications[0]); // Le modal de groupe s'ouvrira automatiquement s'il y a plusieurs médicaments
    }

    // Réinitialiser les sélections
    setSelectedOrders([]);
  };

  return (
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
                  {pharmacies.map(pharmacy => {
                    const isSingleMed = hasSingleMedication(pharmacy.id);
                    const availabilityDetails = getAvailabilityDetails(pharmacy.id, med.id);
                    const isSelected = isOrderSelected(pharmacy.id, med.id);

                    return (
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
                            {isSingleMed && availabilityDetails && (
                              <div className="mt-2 space-y-1">
                                {availabilityDetails.price && (
                                  <div className="flex items-center text-sm text-green-800">
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    <span>{availabilityDetails.price} FCFA</span>
                                  </div>
                                )}
                                {availabilityDetails.comment && (
                                  <div className="flex items-start text-sm text-green-800">
                                    <MessageSquare className="w-3 h-3 mr-1 mt-1" />
                                    <span>{availabilityDetails.comment}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleOrderSelection(pharmacy.id, med)}
                            disabled={!!orderLoading}
                            className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                              orderLoading === pharmacy.id
                                ? 'bg-gray-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {orderLoading === pharmacy.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSelected ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Sélectionné
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4 mr-1" />
                                Sélectionner
                              </>
                            )}
                          </button>
                        </div>
                        {orderError && orderLoading === pharmacy.id && (
                          <p className="text-xs text-red-600 mt-2">{orderError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedOrders.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleBulkOrder}
            disabled={!!orderLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Envoyer {selectedOrders.length} commande{selectedOrders.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}