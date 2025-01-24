import React from 'react';
import { UserIcon, Phone } from 'lucide-react';
import { useRequestDetails } from '../../hooks/useRequestDetails';

interface Props {
  userId: string;
}

export default function RequestUserInfo({ userId }: Props) {
  const { user, loading, error } = useRequestDetails(userId);

  if (loading || error || !user) return null;

  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <UserIcon className="mr-2" size={20} />
        Informations du patient
      </h3>
      <div className="space-y-2">
        <p className="text-gray-600">{user.name}</p>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600 flex items-center">
          <Phone className="mr-2" size={16} />
          {user.phone || 'Non renseigné'}
        </p>
      </div>
    </div>
  );
}