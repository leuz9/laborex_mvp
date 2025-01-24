import React, { useState } from 'react';
import { Clock, Package, User, Phone, CreditCard, Loader2, AlertCircle, CheckCircle, Banknote, Smartphone } from 'lucide-react';
import type { Order } from '../../types';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';
import { useOrders } from '../../hooks/useOrders';

interface Props {
  pharmacyId: string;
}

export default function OrderList({ pharmacyId }: Props) {
  const { orders, loading, error } = usePharmacyOrders(pharmacyId);
  const { updateOrderStatus } = useOrders();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setProcessingOrder(orderId);
    setUpdateError(null);

    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (!success) {
        setUpdateError('Une erreur est survenue lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setUpdateError('Une erreur est survenue');
    } finally {
      setProcessingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(order => 
    ['paid', 'preparing', 'ready'].includes(order.status)
  );

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Aucune commande active pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeOrders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          {/* En-tête de la commande */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'}
              `}>
                {order.status === 'paid' ? 'Payée' :
                 order.status === 'preparing' ? 'En préparation' :
                 order.status === 'ready' ? 'Prête' :
                 'Complétée'}
              </span>
              {order.paymentMethod && (
                <span className={`
                  flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${order.paymentMethod === 'card' ? 'bg-blue-50 text-blue-700' :
                    order.paymentMethod === 'mobile_money' ? 'bg-orange-50 text-orange-700' :
                    'bg-green-50 text-green-700'}
                `}>
                  {order.paymentMethod === 'card' ? (
                    <><CreditCard className="w-3 h-3 mr-1" /> Carte</>
                  ) : order.paymentMethod === 'mobile_money' ? (
                    <><Smartphone className="w-3 h-3 mr-1" /> Mobile Money</>
                  ) : (
                    <><Banknote className="w-3 h-3 mr-1" /> Espèces</>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center text-lg font-bold text-gray-900">
              <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
              {order.totalAmount} FCFA
            </div>
          </div>

          {/* Informations client */}
          {'user' in order && order.user && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Informations client</h4>
              <div className="space-y-2">
                <div className="flex items-center text-blue-800">
                  <User className="w-4 h-4 mr-2" />
                  <span>{order.user.name}</span>
                </div>
                <div className="flex items-center text-blue-800">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{order.user.phone || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Liste des médicaments */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Médicaments commandés
            </h4>
            {order.medications.map((med) => (
              <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                </div>
                <span className="font-medium text-gray-900">{med.price} FCFA</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            {order.status === 'paid' && (
              <button
                onClick={() => handleStatusUpdate(order.id, 'preparing')}
                disabled={!!processingOrder}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {processingOrder === order.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Package className="w-4 h-4 mr-2" />
                )}
                Commencer la préparation
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => handleStatusUpdate(order.id, 'ready')}
                disabled={!!processingOrder}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {processingOrder === order.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Marquer comme prête
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => handleStatusUpdate(order.id, 'completed')}
                disabled={!!processingOrder}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {processingOrder === order.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirmer la récupération
              </button>
            )}
          </div>

          {updateError && processingOrder === order.id && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="ml-3 text-sm text-red-700">{updateError}</p>
            </div>
          )}

          {/* Horodatage */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500 flex-wrap gap-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Commandé le {new Date(order.createdAt).toLocaleString()}
              </span>
              {order.preparedAt && (
                <span className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Préparation commencée le {new Date(order.preparedAt).toLocaleString()}
                </span>
              )}
              {order.readyAt && (
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Prête depuis le {new Date(order.readyAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}