import React, { useState } from 'react';
import { Package, CreditCard, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { Medication } from '../types';
import PaymentModal from './PaymentModal';

interface Props {
  pharmacyId: string;
  pharmacyName: string;
  medications: Medication[];
  onConfirm: (pharmacyId: string, medications: Medication[]) => Promise<{ success: boolean; orderId?: string }>;
  onClose: () => void;
}

export default function OrderConfirmationModal({
  pharmacyId,
  pharmacyName,
  medications,
  onConfirm,
  onClose
}: Props) {
  const [step, setStep] = useState<'confirmation' | 'payment'>('confirmation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const totalAmount = medications.reduce((total, med) => total + med.price, 0);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const { success, orderId } = await onConfirm(pharmacyId, medications);
      if (success && orderId) {
        setOrderId(orderId);
        setStep('payment');
      } else {
        setError('Une erreur est survenue lors de la création de la commande');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {step === 'confirmation' ? (
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold">Confirmer la commande</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Vous êtes sur le point de commander les médicaments suivants auprès de <span className="font-medium">{pharmacyName}</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {medications.map(med => (
                <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                  </div>
                  <span className="font-medium">{med.price} FCFA</span>
                </div>
              ))}

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{totalAmount} FCFA</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Procéder au paiement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : orderId ? (
        <PaymentModal
          orderId={orderId}
          amount={totalAmount}
          onClose={onClose}
          onSuccess={onClose}
        />
      ) : null}
    </div>
  );
}