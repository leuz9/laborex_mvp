import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import ClientDashboard from './components/ClientDashboard';
import { mockPharmacy, mockRequests } from './mockData';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [clientTab, setClientTab] = useState('search');

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'pharmacy':
      return (
        <PharmacyDashboard
          pharmacy={mockPharmacy}
          requests={mockRequests}
          onConfirmAvailability={(requestId) => {
            console.log('Confirming availability for request:', requestId);
          }}
        />
      );
    case 'client':
      return (
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-lg mb-8">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">PharmaDispo</h1>
                <button
                  onClick={() => setUser(null)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </nav>

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
              onMedicationSelect={(medication) => {
                setSelectedMedications(prev => [...prev, medication]);
              }}
              onRequestSubmit={(request) => {
                console.log('Submitting request:', request);
                setSelectedMedications([]);
                setClientTab('requests');
              }}
            />
          </div>
        </div>
      );
    default:
      return <div>Rôle non reconnu</div>;
  }
}