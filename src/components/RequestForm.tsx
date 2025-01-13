import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Medication, MedicationRequest } from '../types';

interface Props {
  medications: Medication[];
  onSubmit: (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => void;
}

export default function RequestForm({ medications, onSubmit }: Props) {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would get the user's location here
    const mockLocation = {
      latitude: 48.8566,
      longitude: 2.3522
    };

    onSubmit({
      userId: 'user123', // This would come from auth
      medications,
      priority,
      status: 'pending',
      location: mockLocation
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Médicaments demandés</h2>
        <div className="space-y-2">
          {medications.map(med => (
            <div key={med.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{med.name}</p>
              <p className="text-sm text-gray-600">{med.dosage}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Niveau de priorité
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-start">
          <AlertCircle className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={20} />
          <p className="text-sm text-blue-700">
            Les pharmacies à proximité seront notifiées de votre demande. 
            Vous recevrez une notification dès qu'une pharmacie confirme la disponibilité.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Envoyer la demande
        </button>
      </form>
    </div>
  );
}