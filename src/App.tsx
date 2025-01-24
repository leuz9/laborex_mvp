import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import ClientDashboard from './components/ClientDashboard';
import ClientHeader from './components/client/ClientHeader';
import UserSettings from './components/settings/UserSettings';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, login, logout, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  return (
    <>
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}

      {(() => {
        switch (user.role) {
          case 'admin':
            return <AdminDashboard onLogout={logout} onOpenSettings={() => setShowSettings(true)} />;
          case 'pharmacy':
            return (
              <PharmacyDashboard
                pharmacy={user}
                onLogout={logout}
                onOpenSettings={() => setShowSettings(true)}
              />
            );
          case 'client':
            return (
              <div className="min-h-screen bg-gray-100">
                <ClientHeader
                  user={user}
                  activeTab={clientTab}
                  onTabChange={setClientTab}
                  onLogout={logout}
                  onOpenSettings={() => setShowSettings(true)}
                />

                <div className="max-w-7xl mx-auto px-4">
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
      })()}
    </>
  );
}