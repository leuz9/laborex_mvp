import React from 'react';
import type { Medication, MedicationRequest } from '../types';
import SearchView from './client/SearchView';
import RequestsView from './client/RequestsView';
import NotificationsView from './client/NotificationsView';
import DutyView from './client/DutyView';
import OrdersView from './client/OrdersView';
import { useRequests } from '../hooks/useRequests';

interface Props {
  activeTab: 'search' | 'requests' | 'notifications' | 'duty' | 'orders';
  selectedMedications: Medication[];
  onMedicationSelect: (medication: Medication) => void;
  onRequestSubmit: (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => void;
  userId: string;
}

export default function ClientDashboard({
  activeTab,
  selectedMedications,
  onMedicationSelect,
  onRequestSubmit,
  userId
}: Props) {
  const { createRequest } = useRequests(userId);

  const handleRequestSubmit = async (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => {
    const success = await createRequest(request);
    if (success) {
      onRequestSubmit(request);
    }
    return success;
  };

  return (
    <div>
      {activeTab === 'search' && (
        <SearchView
          selectedMedications={selectedMedications}
          onMedicationSelect={onMedicationSelect}
          onRequestSubmit={handleRequestSubmit}
        />
      )}

      {activeTab === 'duty' && <DutyView />}

      {activeTab === 'requests' && <RequestsView userId={userId} />}

      {activeTab === 'orders' && <OrdersView userId={userId} />}

      {activeTab === 'notifications' && <NotificationsView userId={userId} />}
    </div>
  );
}