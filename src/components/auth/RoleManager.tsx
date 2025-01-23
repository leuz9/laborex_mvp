import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface RoleManagerProps {
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const RoleManager: React.FC<RoleManagerProps> = ({ onUpdateRole }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Gestion des rôles</h2>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau rôle
        </button>
      </div>

      <div className="space-y-4">
        {Object.keys(ROLE_PERMISSIONS).map((role) => (
          <div
            key={role}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 capitalize">{role}</h3>
                <p className="text-sm text-gray-600">
                  {ROLE_PERMISSIONS[role as UserRole].length} permissions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRole(role as UserRole);
                    setShowPermissions(true);
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedRole === role && showPermissions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ROLE_PERMISSIONS[role as UserRole].map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManager;