import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import type { Medication } from '../types';
import { useMedications } from '../hooks/useMedications';

interface Props {
  onMedicationSelect: (medication: Medication) => void;
}

export default function SearchMedication({ onMedicationSelect }: Props) {
  const { medications, loading, error } = useMedications();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Catégories de médicaments
  const categories = [
    'Analgésiques',
    'Antibiotiques',
    'Antipaludéens',
    'Antiacides',
    'Anti-inflammatoires',
    'Autres'
  ];
  
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {searchTerm && (
        <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
          {filteredMedications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun médicament trouvé
            </div>
          ) : (
            filteredMedications.map(medication => (
              <div
                key={medication.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onMedicationSelect(medication)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{medication.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{medication.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                        Dosage: {medication.dosage}
                      </span>
                      <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {medication.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {medication.price} FCFA
                    </span>
                    <div className="mt-1">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        medication.stock > 10 ? 'bg-green-100 text-green-800' :
                        medication.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {medication.stock > 0 ? `${medication.stock} en stock` : 'Rupture de stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}