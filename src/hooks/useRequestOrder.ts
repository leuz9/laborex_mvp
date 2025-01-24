import { useState, useCallback } from 'react';
import type { MedicationRequest, Medication } from '../types';
import { useAuth } from './useAuth';
import { useOrders } from './useOrders';

export function useRequestOrder(request: MedicationRequest) {
  const { user: currentUser } = useAuth();
  const { createOrder } = useOrders();
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showGroupOrderModal, setShowGroupOrderModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);

  const handleOrder = useCallback(async (pharmacyId: string, medication: Medication) => {
    if (!currentUser) return;

    // Vérifier si la pharmacie a d'autres médicaments disponibles
    const pharmacyMedications = request.medications.filter(med => 
      request.confirmedPharmacies?.includes(pharmacyId)
    );
    const otherMedications = pharmacyMedications.filter(med => med.id !== medication.id);

    if (otherMedications.length > 0) {
      setSelectedPharmacy(pharmacyId);
      setSelectedMedications([medication]);
      setShowGroupOrderModal(true);
    } else {
      // Commander directement si un seul médicament disponible
      await processOrder(pharmacyId, [medication]);
    }
  }, [currentUser, request.medications, request.confirmedPharmacies]);

  const processOrder = useCallback(async (pharmacyId: string, medications: Medication[]) => {
    if (!currentUser) return;
    
    setOrderLoading(pharmacyId);
    setOrderError(null);

    try {
      const result = await createOrder(
        currentUser.id,
        pharmacyId,
        medications,
        request.id
      );

      if (!result.success) {
        setOrderError('Erreur lors de la création de la commande');
      }

      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError('Une erreur est survenue');
      return { success: false };
    } finally {
      setOrderLoading(null);
      setShowGroupOrderModal(false);
    }
  }, [currentUser, createOrder, request.id]);

  const handleGroupOrder = useCallback((medications: Medication[]) => {
    if (selectedPharmacy) {
      processOrder(selectedPharmacy, medications);
    }
  }, [selectedPharmacy, processOrder]);

  const closeGroupOrderModal = useCallback(() => {
    setShowGroupOrderModal(false);
    setSelectedPharmacy(null);
    setSelectedMedications([]);
  }, []);

  return {
    showGroupOrderModal,
    selectedPharmacy,
    selectedMedications,
    orderLoading,
    orderError,
    handleOrder,
    handleGroupOrder,
    closeGroupOrderModal
  };
}