import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import ClientDashboard from './components/ClientDashboard';
import { useAuth } from './hooks/useAuth';
import { mockPharmacy, mockRequests } from './mockData';

export default function App() {
  const { user, login, logout, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [clientTab, setClientTab] = useState('search');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegisterSuccess={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginForm
        onLogin={login}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard onLogout={logout} />;
    case 'pharmacy':
      return (
        <PharmacyDashboard
          pharmacy={mockPharmacy}
          requests={mockRequests}
          onLogout={logout}
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
                  onClick={logout}
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
              userId={user.id}
            />
          </div>
        </div>
      );
    default:
      return <div>Rôle non reconnu</div>;
  }
}