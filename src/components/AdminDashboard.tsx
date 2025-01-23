import React, { useState } from 'react';
import { Users, Settings, BarChart2, Bell, Shield, Database, UserPlus, Trash2 } from 'lucide-react';
import type { AdminSettings, TeamMember } from '../types';

interface AdminDashboardProps {
  settings: AdminSettings;
  onUpdateSettings: (settings: AdminSettings) => void;
  teamMembers: TeamMember[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  teamMembers
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'teams' | 'metrics' | 'notifications'>('roles');
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const handleUpdateRole = (roleId: string, updates: Partial<AdminSettings['roles'][0]>) => {
    const updatedSettings = {
      ...settings,
      roles: settings.roles.map(role =>
        role.id === roleId ? { ...role, ...updates } : role
      )
    };
    onUpdateSettings(updatedSettings);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Administration</h2>
            <p className="text-gray-300">Gestion des paramètres et configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span>Utilisateurs</span>
            </div>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5" />
              <span>Rôles</span>
            </div>
            <div className="text-2xl font-bold">{settings.roles.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5" />
              <span>Métriques</span>
            </div>
            <div className="text-2xl font-bold">{settings.metrics.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </div>
            <div className="text-2xl font-bold">
              {settings.notifications.filter(n => n.enabled).length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'roles', label: 'Rôles & Permissions', icon: Shield },
              { key: 'teams', label: 'Équipes', icon: Users },
              { key: 'metrics', label: 'Métriques', icon: BarChart2 },
              { key: 'notifications', label: 'Notifications', icon: Bell }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Rôles</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <UserPlus className="w-4 h-4" />
                  Nouveau Rôle
                </button>
              </div>

              <div className="space-y-4">
                {settings.roles.map((role) => (
                  <div key={role.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{role.name}</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingRole(role.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Équipes</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Users className="w-4 h-4" />
                  Nouvelle Équipe
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.teams.map((team) => (
                  <div key={team.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Users className="w-4 h-4" />
                      <span>{team.members.length} membres</span>
                    </div>

                    <div className="flex -space-x-2">
                      {team.members.map((memberId, index) => {
                        const member = teamMembers.find(m => m.id === memberId);
                        return (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                            title={member?.name}
                          >
                            <span className="text-xs font-medium">
                              {member?.name.charAt(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Configuration des Métriques</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <BarChart2 className="w-4 h-4" />
                  Nouvelle Métrique
                </button>
              </div>

              <div className="space-y-4">
                {settings.metrics.map((metric) => (
                  <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Poids: <span className="font-medium">{metric.weight}%</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Objectif: <span className="font-medium">{metric.target}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Paramètres des Notifications</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Bell className="w-4 h-4" />
                  Nouvelle Notification
                </button>
              </div>

              <div className="space-y-4">
                {settings.notifications.map((notification, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.type}</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {notification.recipients.map((recipient, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                            >
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notification.enabled}
                            className="sr-only peer"
                            onChange={() => {
                              const updatedSettings = {
                                ...settings,
                                notifications: settings.notifications.map((n, i) =>
                                  i === index ? { ...n, enabled: !n.enabled } : n
                                )
                              };
                              onUpdateSettings(updatedSettings);
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;