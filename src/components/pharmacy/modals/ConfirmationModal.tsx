import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ConfirmationModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-bounce">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Disponibilité confirmée!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Le client a été notifié de la disponibilité des médicaments.
          </p>
        </div>
      </div>
    </div>
  );
}