import React from 'react';
import { X, Package, Clock, MapPin, AlertTriangle, User as UserIcon, Phone, Store } from 'lucide-react';
import type { MedicationRequest, User } from '../types';
import { mockUsers, mockPharmacies } from '../mockData';

interface Props {
  request: MedicationRequest;
  isPharmacyView?: boolean;
  onClose: () => void;
}

export default function RequestDetailsPopup({ request, isPharmacyView = false, onClose }: Props) {
  const user = mockUsers.find(u => u.id === request.userId) as User;
  const confirmedPharmacies = request.confirmedPharmacies 
    ? mockPharmacies.filter(p => request.confirmedPharmacies?.includes(p.id))
    : [];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Détails de la demande</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* En-tête avec statut et priorité */}
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

            {/* Informations sur le demandeur (visible uniquement pour les pharmacies) */}
            {isPharmacyView && (
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
                    +221 77 XXX XX XX
                  </p>
                </div>
              </div>
            )}

            {/* Liste des médicaments */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Package className="mr-2" size={20} />
                Médicaments demandés
              </h3>
              <div className="space-y-3">
                {request.medications.map(med => (
                  <div key={med.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                    <p className="text-sm text-gray-500">{med.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacies confirmées (visible uniquement pour les demandes confirmées) */}
            {request.status === 'confirmed' && confirmedPharmacies.length > 0 && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Store className="mr-2" size={20} />
                  Pharmacies disponibles
                </h3>
                <div className="space-y-3">
                  {confirmedPharmacies.map(pharmacy => (
                    <div key={pharmacy.id} className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-800">{pharmacy.name}</p>
                      <p className="text-sm text-green-700">{pharmacy.address}</p>
                      {pharmacy.onDuty && (
                        <div className="mt-2 flex items-center text-green-700">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{pharmacy.onDuty.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations temporelles */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Clock className="mr-2" size={20} />
                Informations temporelles
              </h3>
              <p className="text-gray-600">
                Créée le : {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Localisation */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <MapPin className="mr-2" size={20} />
                Localisation
              </h3>
              <p className="text-gray-600">
                Latitude : {request.location.latitude}
                <br />
                Longitude : {request.location.longitude}
              </p>
            </div>

            {/* Notes importantes */}
            {request.priority === 'high' && (
              <div className="bg-red-50 p-4 rounded-lg flex items-start">
                <AlertTriangle className="text-red-500 mr-2 mt-1" size={20} />
                <p className="text-red-700 text-sm">
                  Cette demande est marquée comme prioritaire et nécessite une attention immédiate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}