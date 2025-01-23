import React from 'react';
import { Clock, Phone, MapPin } from 'lucide-react';
import { mockPharmacies } from '../mockData';

export default function DutyPharmacies() {
  // Filtrer les pharmacies de garde
  const dutyPharmacies = mockPharmacies.filter(pharmacy => pharmacy.onDuty);

  if (dutyPharmacies.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Pharmacies de garde</h2>
      <div className="space-y-4">
        {dutyPharmacies.map((pharmacy) => (
          <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg text-gray-900">{pharmacy.name}</h3>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <p className="text-sm">{pharmacy.address}</p>
                </div>
                <div className="flex items-center text-gray-600 mt-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <p className="text-sm">
                    {new Date(pharmacy.onDuty!.start).toLocaleTimeString()} - {new Date(pharmacy.onDuty!.end).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${pharmacy.onDuty!.phone}`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>{pharmacy.onDuty!.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}