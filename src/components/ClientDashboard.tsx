import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import SearchMedication from './SearchMedication';
import RequestForm from './RequestForm';
import DutyPharmacies from './DutyPharmacies';
import RequestDetailsPopup from './RequestDetailsPopup';
import type { Medication, MedicationRequest } from '../types';
import { mockRequests, mockNotifications } from '../mockData';

interface Props {
  activeTab: 'search' | 'requests' | 'notifications' | 'duty';
  selectedMedications: Medication[];
  onMedicationSelect: (medication: Medication) => void;
  onRequestSubmit: (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => void;
}

export default function ClientDashboard({
  activeTab,
  selectedMedications,
  onMedicationSelect,
  onRequestSubmit
}: Props) {
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);

  return (
    <div>
      {selectedRequest && (
        <RequestDetailsPopup
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {activeTab === 'search' && (
        <>
          <SearchMedication onMedicationSelect={onMedicationSelect} />
          {selectedMedications.length > 0 && (
            <div className="mt-8">
              <RequestForm
                medications={selectedMedications}
                onSubmit={onRequestSubmit}
              />
            </div>
          )}
        </>
      )}

      {activeTab === 'duty' && (
        <div className="max-w-3xl mx-auto">
          <DutyPharmacies />
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Mes Demandes</h2>
          {mockRequests.map(request => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}
                  `}>
                    {request.priority === 'high' ? 'Priorité haute' :
                     request.priority === 'medium' ? 'Priorité moyenne' :
                     'Priorité basse'}
                  </span>
                  <span className={`
                    ml-2 px-2 py-1 rounded-full text-sm
                    ${request.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'confirmed' ? 'Confirmé' :
                     request.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {request.medications.map(med => (
                  <div key={med.id} className="flex items-center">
                    <span className="font-medium">{med.name}</span>
                    <span className="text-gray-500 ml-2">- {med.dosage}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          {mockNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className="flex items-start">
                <Bell className={`flex-shrink-0 w-5 h-5 mt-1 ${
                  notification.read ? 'text-gray-400' : 'text-blue-500'
                }`} />
                <div className="ml-3">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}