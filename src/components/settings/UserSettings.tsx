import React, { useState } from 'react';
import { User, Bell, Lock, Eye, Globe, Moon } from 'lucide-react';
import UserProfile from './UserProfile';

const UserSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      desktop: true,
      mobile: false
    },
    privacy: {
      profileVisibility: 'team',
      activityVisibility: 'public',
      showOnlineStatus: true
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      fontSize: 'medium'
    },
    language: 'fr'
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Profil utilisateur */}
      <UserProfile />

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Paramètres de notifications
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Notifications par email</span>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleNotificationChange('email')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Notifications bureau</span>
            <input
              type="checkbox"
              checked={settings.notifications.desktop}
              onChange={() => handleNotificationChange('desktop')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Notifications mobiles</span>
            <input
              type="checkbox"
              checked={settings.notifications.mobile}
              onChange={() => handleNotificationChange('mobile')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Confidentialité */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Paramètres de confidentialité
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibilité du profil
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  profileVisibility: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="team">Équipe uniquement</option>
              <option value="private">Privé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibilité de l'activité
            </label>
            <select
              value={settings.privacy.activityVisibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  activityVisibility: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="team">Équipe uniquement</option>
              <option value="private">Privé</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Afficher le statut en ligne</span>
            <input
              type="checkbox"
              checked={settings.privacy.showOnlineStatus}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  showOnlineStatus: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Apparence */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Apparence
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thème
            </label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => setSettings({
                ...settings,
                appearance: {
                  ...settings.appearance,
                  theme: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille de police
            </label>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => setSettings({
                ...settings,
                appearance: {
                  ...settings.appearance,
                  fontSize: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Mode compact</span>
            <input
              type="checkbox"
              checked={settings.appearance.compactMode}
              onChange={(e) => setSettings({
                ...settings,
                appearance: {
                  ...settings.appearance,
                  compactMode: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Langue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Langue
        </h3>
        <select
          value={settings.language}
          onChange={(e) => setSettings({
            ...settings,
            language: e.target.value
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
};

export default UserSettings;