import React, { useState } from 'react';
import { Package, CheckCircle, Truck, ShoppingBag, CreditCard, Star, Loader2 } from 'lucide-react';
import type { Order } from '../types';
import PaymentModal from './PaymentModal';
import RatingModal from './RatingModal';
import { useOrders } from '../hooks/useOrders';

interface Props {
  order: Order;
  onClose?: () => void;
}

export default function OrderTracking({ order, onClose }: Props) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { updateOrderStatus } = useOrders();

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

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Suivi de commande #{order.id.slice(0, 8)}</h2>
        
        <div className="relative">
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

        {order.status === 'pending' && (
          <div className="mt-6">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Payer {order.totalAmount} FCFA
            </button>
          </div>
        )}

        {order.status === 'ready' && (
          <div className="mt-6">
            <button
              onClick={handleConfirmPickup}
              disabled={confirmLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {confirmLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Confirmer la récupération
            </button>
            <p className="text-sm text-gray-500 text-center mt-2">
              Cliquez ici une fois que vous avez récupéré votre commande
            </p>
          </div>
        )}

        {order.status === 'completed' && !order.rating && (
          <div className="mt-6">
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Star className="w-5 h-5 mr-2" />
              Noter la pharmacie
            </button>
          </div>
        )}
      </div>
    </>
  );
}