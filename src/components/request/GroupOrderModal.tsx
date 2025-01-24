import React, { useState } from 'react';
import { ShoppingBag, Loader2, CreditCard, MessageSquare } from 'lucide-react';
import type { Medication } from '../../types';

interface Props {
  selectedPharmacy: string;
  selectedMedications: Medication[];
  medicationsByPharmacy: Medication[];
  orderLoading: string | null;
  availabilityDetails?: {
    [medicationId: string]: {
      price?: number;
      comment?: string;
    };
  };
  onClose: () => void;
  onConfirm: (medications: Medication[]) => void;
}

export default function GroupOrderModal({
  selectedPharmacy,
  selectedMedications,
  medicationsByPharmacy,
  orderLoading,
  availabilityDetails,
  onClose,
  onConfirm
}: Props) {
  const [localSelectedMedications, setLocalSelectedMedications] = useState(selectedMedications);

  const toggleMedication = (medication: Medication) => {
    setLocalSelectedMedications(prev => {
      const isSelected = prev.some(m => m.id === medication.id);
      if (isSelected) {
        return prev.filter(m => m.id !== medication.id);
      } else {
        return [...prev, medication];
      }
    });
  };

  // Calculer le total de la commande
  const totalAmount = localSelectedMedications.reduce((total, med) => {
    const price = availabilityDetails?.[med.id]?.price || med.price;
    return total + price;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Commander plusieurs médicaments</h3>
        <p className="text-sm text-gray-600 mb-4">
          Cette pharmacie dispose également d'autres médicaments de votre demande. 
          Souhaitez-vous les inclure dans votre commande ?
        </p>
        <div className="space-y-3 mb-6">
          {medicationsByPharmacy.map(med => {
            const isSelected = localSelectedMedications.some(m => m.id === med.id);
            const details = availabilityDetails?.[med.id];

            return (
              <label
                key={med.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMedication(med)}
                  className="form-checkbox h-5 w-5 text-blue-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
                      {details?.price || med.price} FCFA
                    </div>
                  </div>
                  {details?.comment && (
                    <div className="mt-2 flex items-start text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                      <p>{details.comment}</p>
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Total de la commande */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total</span>
            <span className="text-lg font-bold text-gray-900">{totalAmount} FCFA</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(localSelectedMedications)}
            disabled={localSelectedMedications.length === 0 || orderLoading === selectedPharmacy}
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
            Commander {localSelectedMedications.length} médicament{localSelectedMedications.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}