import React from 'react';
import { X } from 'lucide-react';
import type { MedicationRequest } from '../../types';
import RequestHeader from './RequestHeader';
import RequestUserInfo from './RequestUserInfo';
import RequestMedicationList from './RequestMedicationList';
import RequestTimeInfo from './RequestTimeInfo';
import RequestLocationInfo from './RequestLocationInfo';
import RequestPriorityAlert from './RequestPriorityAlert';
import GroupOrderModal from './GroupOrderModal';
import { useRequestOrder } from '../../hooks/useRequestOrder';

interface Props {
  request: MedicationRequest;
  isPharmacyView?: boolean;
  onClose: () => void;
}

export default function RequestDetailsPopup({ request, isPharmacyView = false, onClose }: Props) {
  const {
    showGroupOrderModal,
    selectedPharmacy,
    selectedMedications,
    orderLoading,
    orderError,
    handleOrder,
    handleGroupOrder,
    closeGroupOrderModal
  } = useRequestOrder(request, onClose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal de commande groupée */}
      {showGroupOrderModal && selectedPharmacy && (
        <GroupOrderModal
          selectedPharmacy={selectedPharmacy}
          selectedMedications={selectedMedications}
          medicationsByPharmacy={request.medications}
          orderLoading={orderLoading}
          onClose={closeGroupOrderModal}
          onConfirm={handleGroupOrder}
        />
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
            <RequestHeader request={request} />

            {isPharmacyView && <RequestUserInfo userId={request.userId} />}

            <RequestMedicationList
              request={request}
              isPharmacyView={isPharmacyView}
              onOrder={handleOrder}
              orderLoading={orderLoading}
              orderError={orderError}
            />

            <RequestTimeInfo createdAt={request.createdAt} />

            <RequestLocationInfo location={request.location} />

            {request.priority === 'high' && <RequestPriorityAlert />}
          </div>
        </div>
      </div>
    </div>
  );
}