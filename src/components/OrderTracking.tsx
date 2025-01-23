import React from 'react';
import { Package, CheckCircle, Truck, ShoppingBag } from 'lucide-react';
import type { Order } from '../types';

interface Props {
  order: Order;
}

export default function OrderTracking({ order }: Props) {
  const steps = [
    { status: 'pending', label: 'Commande reçue', icon: ShoppingBag },
    { status: 'paid', label: 'Paiement confirmé', icon: CheckCircle },
    { status: 'preparing', label: 'En préparation', icon: Package },
    { status: 'ready', label: 'Prêt à récupérer', icon: Truck },
    { status: 'completed', label: 'Commande récupérée', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Suivi de commande #{order.id}</h2>
      
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
              <div className="ml-4">
                <p className={`font-medium ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-gray-500">
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
    </div>
  );
}