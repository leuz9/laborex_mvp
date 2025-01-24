import React, { useState } from 'react';
import type { MedicationRequest } from '../../../types';

interface Props {
  request: MedicationRequest;
  medicationId: string;
  onClose: () => void;
  onConfirm: (restockDate: string) => void;
}

export default function UnavailableModal({ request, medicationId, onClose, onConfirm }: Props) {
  const [restockDate, setRestockDate] = useState('');
  const medication = request.medications.find(med => med.id === medicationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockDate) {
      onConfirm(restockDate);
    }
  };

  if (!medication) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prochaine disponibilité</h3>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-500 mb-4">
            Veuillez indiquer la date prévue de réapprovisionnement pour :
            <span className="block font-medium mt-1">{medication.name} - {medication.dosage}</span>
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de réapprovisionnement
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={restockDate}
              onChange={(e) => setRestockDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!restockDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}