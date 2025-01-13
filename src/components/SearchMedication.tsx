import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Medication } from '../types';

interface Props {
  onMedicationSelect: (medication: Medication) => void;
}

export default function SearchMedication({ onMedicationSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock medication data - in real app, this would come from an API
  const medications: Medication[] = [
    { id: '1', name: 'Paracetamol', description: 'Pain reliever', dosage: '500mg' },
    { id: '2', name: 'Ibuprofen', description: 'Anti-inflammatory', dosage: '400mg' },
  ];

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un médicament..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {searchTerm && (
        <div className="mt-4 bg-white rounded-lg shadow-lg">
          {filteredMedications.map(medication => (
            <div
              key={medication.id}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => onMedicationSelect(medication)}
            >
              <h3 className="font-medium">{medication.name}</h3>
              <p className="text-sm text-gray-600">{medication.description}</p>
              <p className="text-sm text-gray-500">Dosage: {medication.dosage}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}