import React, { useState } from 'react';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import type { Medication, MedicationRequest } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../hooks/useAuth';

interface Props {
  medications: Medication[];
  onSubmit: (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => Promise<boolean>;
}

export default function RequestForm({ medications, onSubmit }: Props) {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location, error: locationError } = useGeolocation();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!location) {
      setError('La localisation est nécessaire pour envoyer une demande');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour envoyer une demande');
      return;
    }

    try {
      setLoading(true);
      const success = await onSubmit({
        userId: user.id,
        medications,
        priority,
        status: 'pending',
        location
      });

      if (!success) {
        setError('Une erreur est survenue lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Une erreur est survenue lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Médicaments demandés</h2>
        <div className="space-y-3">
          {medications.map(med => (
            <div key={med.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{med.name}</h3>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {med.price} FCFA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau de priorité
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">
              {location ? (
                `Position actuelle : ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              ) : locationError ? (
                <span className="text-red-600">Erreur de localisation. Veuillez activer votre GPS.</span>
              ) : (
                'Récupération de votre position...'
              )}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Les pharmacies à proximité seront notifiées de votre demande. 
              Vous recevrez une notification dès qu'une pharmacie confirme la disponibilité.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !location || !user}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            loading || !location || !user
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer la demande'
          )}
        </button>
      </form>
    </div>
  );
}