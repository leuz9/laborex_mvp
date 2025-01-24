import React, { useState } from 'react';
import type { User } from '../types';
import DashboardHeader from './pharmacy/DashboardHeader';
import Navigation from './pharmacy/Navigation';
import RequestList from './pharmacy/RequestList';
import OrderList from './pharmacy/OrderList';
import HistoryView from './pharmacy/HistoryView';
import NotificationsView from './pharmacy/NotificationsView';
import FinanceView from './pharmacy/FinanceView';
import RatingsView from './pharmacy/RatingsView';
import { usePharmacyRequests } from '../hooks/usePharmacyRequests';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
  pharmacy: User;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function PharmacyDashboard({
  pharmacy,
  onLogout,
  onOpenSettings
}: Props) {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'orders' | 'history' | 'notifications' | 'finance' | 'ratings'>('pending');
  const { requests, loading, error, confirmAvailability, setUnavailable } = usePharmacyRequests(pharmacy.id);
  const { notifications } = useNotifications(pharmacy.id);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleConfirmAvailability = async (requestId: string) => {
    try {
      const success = await confirmAvailability(requestId);
      return success;
    } catch (error) {
      console.error('Error confirming availability:', error);
      return false;
    }
  };

  const handleSetUnavailable = async (requestId: string, restockDate: string) => {
    try {
      const success = await setUnavailable(requestId, restockDate);
      return success;
    } catch (error) {
      console.error('Error setting unavailable:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        pharmacy={pharmacy} 
        onLogout={onLogout} 
        onOpenSettings={onOpenSettings}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadNotifications={unreadNotifications}
        />

        {activeTab === 'orders' ? (
          <OrderList pharmacyId={pharmacy.id} />
        ) : activeTab === 'history' ? (
          <HistoryView pharmacyId={pharmacy.id} />
        ) : activeTab === 'notifications' ? (
          <NotificationsView pharmacyId={pharmacy.id} />
        ) : activeTab === 'finance' ? (
          <FinanceView pharmacyId={pharmacy.id} />
        ) : activeTab === 'ratings' ? (
          <RatingsView pharmacyId={pharmacy.id} />
        ) : (
          <RequestList
            requests={requests}
            loading={loading}
            error={error}
            activeTab={activeTab}
            onConfirmAvailability={handleConfirmAvailability}
            onSetUnavailable={handleSetUnavailable}
          />
        )}
      </div>
    </div>
  );
}