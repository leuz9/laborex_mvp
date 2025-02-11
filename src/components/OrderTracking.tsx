import React, { useState } from 'react';
import { Package, CheckCircle, Truck, ShoppingBag, CreditCard, Star, Loader2, Phone, MapPin, Store, X } from 'lucide-react';
import type { Order } from '../types';
import PaymentModal from './PaymentModal';
import RatingModal from './RatingModal';
import { useOrders } from '../hooks/useOrders';
import { usePharmacyDetails } from '../hooks/usePharmacyDetails';

interface Props {
  order: Order;
  onClose?: () => void;
}

export default function OrderTracking({ order, onClose }: Props) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { updateOrderStatus } = useOrders();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyDetails(order.pharmacyId);

  const steps = [
    { status: 'pending', label: 'Commande reçue', icon: ShoppingBag },
    { status: 'paid', label: 'Paiement confirmé', icon: CheckCircle },
    { status: 'preparing', label: 'En préparation', icon: Package },
    { status: 'ready', label: 'Prêt à récupérer', icon: Truck },
    { status: 'completed', label: 'Commande récupérée', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);

  const handleConfirmPickup = async () => {
    setConfirmLoading(true);
    try {
      const success = await updateOrderStatus(order.id, 'completed');
      if (success) {
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error confirming pickup:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      {showRatingModal && (
        <RatingModal
          orderId={order.id}
          pharmacyId={order.pharmacyId}
          onClose={() => {
            setShowRatingModal(false);
            onClose?.();
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          orderId={order.id}
          amount={order.totalAmount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            onClose?.();
          }}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold">Suivi de commande #{order.id.slice(0, 8)}</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Informations de la pharmacie */}
            {pharmacy && !pharmacyLoading && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Store className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">{pharmacy.name}</h3>
                </div>
                {pharmacy.phone && (
                  <div className="flex items-center text-blue-800 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{pharmacy.phone}</span>
                  </div>
                )}
                {pharmacy.address && (
                  <div className="flex items-center text-blue-800">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{pharmacy.address}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Suivi des étapes */}
            <div className="relative mb-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex items-center mb-8 relative">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      ${isCurrent ? 'ring-4 ring-green-100' : ''}
                    `}>
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        absolute left-5 top-10 w-0.5 h-8
                        ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Liste des médicaments */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Médicaments commandés</h3>
              <div className="space-y-2">
                {order.medications.map(med => (
                  <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                    <span className="font-medium text-gray-900">{med.price} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{order.totalAmount} FCFA</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              {order.status === 'pending' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payer {order.totalAmount} FCFA
                </button>
              )}

              {order.status === 'ready' && (
                <button
                  onClick={handleConfirmPickup}
                  disabled={confirmLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {confirmLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Confirmer la récupération
                </button>
              )}

              {order.status === 'completed' && !order.rating && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Noter la pharmacie
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}