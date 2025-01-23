import React from 'react';
import SearchMedication from '../SearchMedication';
import RequestForm from '../RequestForm';
import type { Medication, MedicationRequest } from '../../types';

interface Props {
  selectedMedications: Medication[];
  onMedicationSelect: (medication: Medication) => void;
  onRequestSubmit: (request: Omit<MedicationRequest, 'id' | 'createdAt'>) => Promise<boolean>;
}

export default function SearchView({ selectedMedications, onMedicationSelect, onRequestSubmit }: Props) {
  return (
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
  );
}