import React, { useState } from 'react';
import { Package, CreditCard, Smartphone, Banknote, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { Medication } from '../types';
import { useOrders } from '../hooks/useOrders';

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
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([medications[0]]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'cash'>('card');
  const [orderId, setOrderId] = useState<string | null>(null);
  const { markOrderAsPaid } = useOrders();
  const [showSuccess, setShowSuccess] = useState(false);

  const totalAmount = selectedMedications.reduce((total, med) => total + med.price, 0);

  const handleConfirm = async () => {
    if (selectedMedications.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onConfirm(pharmacyId, selectedMedications);
      if (result.success && result.orderId) {
        setOrderId(result.orderId);
        setShowPayment(true);
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

  const handlePayment = async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const success = await markOrderAsPaid(orderId, paymentMethod);
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Une erreur est survenue lors du paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const toggleMedication = (medication: Medication) => {
    setSelectedMedications(prev => {
      const isSelected = prev.some(med => med.id === medication.id);
      if (isSelected) {
        return prev.filter(med => med.id !== medication.id);
      } else {
        return [...prev, medication];
      }
    });
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Commande confirmée !
          </h3>
          <p className="text-sm text-gray-500">
            {paymentMethod === 'cash' 
              ? 'Votre commande est en cours de préparation. Préparez le montant exact pour la livraison.'
              : 'Votre paiement a été accepté. La pharmacie va préparer votre commande.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">
              {showPayment ? 'Paiement de la commande' : 'Confirmer la commande'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {!showPayment ? (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Sélectionnez les médicaments à commander chez <span className="font-medium">{pharmacyName}</span>
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {medications.map(med => {
                  const isSelected = selectedMedications.some(m => m.id === med.id);
                  const isFirstMedication = med.id === medications[0].id;

                  return (
                    <label
                      key={med.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      } ${isFirstMedication ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isFirstMedication && toggleMedication(med)}
                        disabled={isFirstMedication}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.dosage}</p>
                          </div>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
                            {med.price} FCFA
                          </div>
                        </div>
                        {isFirstMedication && (
                          <p className="text-xs text-gray-500 mt-2">
                            Ce médicament est déjà sélectionné
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total à payer</span>
                  <span>{totalAmount} FCFA</span>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                        <span>Carte bancaire</span>
                      </div>
                    </div>
                  </label>

                  <label className="block">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={() => setPaymentMethod('mobile_money')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-gray-400 mr-2" />
                        <span>Mobile Money (Orange Money, Wave)</span>
                      </div>
                    </div>
                  </label>

                  <label className="block">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <Banknote className="w-5 h-5 text-gray-400 mr-2" />
                        <span>Paiement à la livraison</span>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de carte
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={19}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Vous recevrez un message pour confirmer le paiement sur votre téléphone.
                    </p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Préparez le montant exact pour faciliter la transaction.
                    </p>
                  </div>
                )}
              </form>
            </>
          )}

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
              onClick={showPayment ? handlePayment : handleConfirm}
              disabled={loading || (!showPayment && selectedMedications.length === 0)}
              className={`flex items-center px-4 py-2 rounded-lg text-white ${
                loading || (!showPayment && selectedMedications.length === 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {showPayment ? (
                    `Payer ${totalAmount} FCFA`
                  ) : (
                    `Commander ${selectedMedications.length} médicament${selectedMedications.length > 1 ? 's' : ''}`
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}