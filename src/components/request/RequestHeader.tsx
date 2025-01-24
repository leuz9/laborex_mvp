import React from 'react';
import type { MedicationRequest } from '../../types';

interface Props {
  request: MedicationRequest;
}

export default function RequestHeader({ request }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <span className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          request.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
          request.status === 'ready' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'}
      `}>
        {request.status === 'pending' ? 'En attente' :
         request.status === 'confirmed' ? 'Confirmé' :
         request.status === 'preparing' ? 'En préparation' :
         request.status === 'ready' ? 'Prêt' :
         'Complété'}
      </span>
      <span className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
          request.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'}
      `}>
        {request.priority === 'high' ? 'Priorité haute' :
         request.priority === 'medium' ? 'Priorité moyenne' :
         'Priorité basse'}
      </span>
    </div>
  );
}