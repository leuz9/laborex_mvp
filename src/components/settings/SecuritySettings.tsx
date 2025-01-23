import React, { useState } from 'react';
import { Lock, Key, Shield, Smartphone } from 'lucide-react';

const SecuritySettings: React.FC = () => {
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de changement de mot de passe
  };

  const handleTwoFactorSetup = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de configuration 2FA
  };

  return (
    <div className="space-y-6">
      {/* Changement de mot de passe */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Changer le mot de passe
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>

      {/* Double authentification */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Double authentification
        </h3>
        {!showTwoFactorSetup ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              La double authentification ajoute une couche de sécurité supplémentaire à votre compte.
            </p>
            <button
              onClick={() => setShowTwoFactorSetup(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Activer la double authentification
            </button>
          </div>
        ) : (
          <form onSubmit={handleTwoFactorSetup} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Scannez le QR code
                  </h4>
                  <p className="text-sm text-gray-600">
                    Utilisez une application d'authentification pour scanner le code
                  </p>
                </div>
              </div>
              <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                [QR Code]
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code de vérification
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Entrez le code à 6 chiffres"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Vérifier et activer
              </button>
              <button
                type="button"
                onClick={() => setShowTwoFactorSetup(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Sessions actives */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Sessions actives
        </h3>
        <div className="space-y-4">
          {[
            {
              device: 'Chrome sur Windows',
              location: 'Paris, France',
              lastActive: 'Il y a 2 minutes',
              current: true
            },
            {
              device: 'Firefox sur MacOS',
              location: 'Lyon, France',
              lastActive: 'Il y a 2 jours',
              current: false
            }
          ].map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Session actuelle
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {session.location} • {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;