import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';

interface Props {
  orderId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ orderId, amount, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { markOrderAsPaid, updateOrderStatus } = useOrders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Marquer la commande comme payée
      const paymentSuccess = await markOrderAsPaid(orderId, paymentMethod);
      
      if (paymentSuccess) {
        // 2. Passer automatiquement en préparation
        const statusSuccess = await updateOrderStatus(orderId, 'preparing');
        
        if (statusSuccess) {
          setShowSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else {
          setError('La commande a été payée mais une erreur est survenue lors du passage en préparation');
        }
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

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Paiement effectué avec succès !
          </h3>
          <p className="text-sm text-gray-500">
            Votre commande est maintenant en cours de préparation.
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
            <h2 className="text-xl font-semibold">Paiement de la commande</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total à payer</span>
              <span>{amount} FCFA</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <div className="p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Payer {amount} FCFA
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}