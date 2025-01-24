import React from 'react';
import { Store } from 'lucide-react';
import type { User } from '../../types';
import UserProfileMenu from '../UserProfileMenu';

interface Props {
  pharmacy: User;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function DashboardHeader({ pharmacy, onLogout, onOpenSettings }: Props) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">{pharmacy.name}</span>
            </div>
          </div>

          <UserProfileMenu
            user={pharmacy}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>
    </nav>
  );
}