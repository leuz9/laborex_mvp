import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import SearchMedication from './components/SearchMedication';
import RequestForm from './components/RequestForm';
import PharmacyDashboard from './components/PharmacyDashboard';
import ClientDashboard from './components/ClientDashboard';
import type { Medication, MedicationRequest } from './types';
import { mockPharmacy, mockRequests } from './mockData';

export default function App() {
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [view, setView] = useState<'client' | 'pharmacy' | 'admin'>('client');
  const [clientTab, setClientTab] = useState<'search' | 'requests' | 'notifications' | 'duty'>('search');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedications(prev => {
      if (!prev.find(med => med.id === medication.id)) {
        return [...prev, medication];
      }
      return prev;
    });
  };

  const handleRequestSubmit = (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => {
    // Simulate request submission
    setTimeout(() => {
      setShowConfirmation(true);
      setSelectedMedications([]);
      
      // After 5 seconds, hide confirmation and switch to requests tab
      setTimeout(() => {
        setShowConfirmation(false);
        setClientTab('requests');
      }, 5000);
    }, 1000);
  };

  const handleConfirmAvailability = (requestId: string) => {
    // In a real app, this would make an API call
    console.log('Confirming availability for request:', requestId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Demande envoyée avec succès!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Nous vous notifierons dès qu'une pharmacie confirmera la disponibilité de vos médicaments.
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">PharmaDispo</h1>
            <div className="space-x-4">
              <button
                onClick={() => setView('client')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                Vue Client
              </button>
              <button
                onClick={() => setView('pharmacy')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'pharmacy' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                Vue Pharmacie
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                Administration
              </button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'admin' ? (
        <AdminDashboard />
      ) : view === 'client' ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setClientTab('search')}
              className={`px-4 py-2 rounded-lg ${
                clientTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Rechercher
            </button>
            <button
              onClick={() => setClientTab('duty')}
              className={`px-4 py-2 rounded-lg ${
                clientTab === 'duty' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Pharmacies de garde
            </button>
            <button
              onClick={() => setClientTab('requests')}
              className={`px-4 py-2 rounded-lg ${
                clientTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Mes Demandes
            </button>
            <button
              onClick={() => setClientTab('notifications')}
              className={`px-4 py-2 rounded-lg ${
                clientTab === 'notifications' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Notifications
            </button>
          </div>

          <ClientDashboard
            activeTab={clientTab}
            selectedMedications={selectedMedications}
            onMedicationSelect={handleMedicationSelect}
            onRequestSubmit={handleRequestSubmit}
          />
        </div>
      ) : (
        <PharmacyDashboard
          pharmacy={mockPharmacy}
          requests={mockRequests}
          onConfirmAvailability={handleConfirmAvailability}
        />
      )}
    </div>
  );
}