import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { DrugItem, Prescription } from '../../types';
import { PharmacyDispensaryView } from '../pharmacy/PharmacyDispensaryView';
import { PharmacyHistoryView } from '../pharmacy/PharmacyHistoryView';
import { PharmacyStockInventoryView } from '../pharmacy/PharmacyStockInventoryView';
import { ControlledDrugsView } from '../pharmacy/ControlledDrugsView';
import { PharmacyAnalyticsView } from '../pharmacy/PharmacyAnalyticsView';
import { DispensePrescriptionModal } from '../modals/DispensePrescriptionModal';
import { DrugItemModal } from '../modals/DrugItemModal';

interface PharmacyModuleProps {
  onOpenRxPrint: (rxId: string) => void;
}

export const PharmacyModule: React.FC<PharmacyModuleProps> = ({ onOpenRxPrint }) => {
  const {
    drugInventory,
    prescriptions,
    dispensePrescription,
    addNewDrugItem,
    updateDrugItem,
    currentUser,
    pharmacySubView,
    setPharmacySubView
  } = useHospital();

  // Modals state
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<Prescription | null>(null);
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugItem | null>(null);

  const handleOpenDispenseModal = (rx: Prescription) => {
    setSelectedRxForDispense(rx);
  };

  const handleConfirmDispense = (rxId: string) => {
    dispensePrescription(rxId);
    setSelectedRxForDispense(null);
  };

  const handleOpenAddDrug = () => {
    setEditingDrug(null);
    setShowDrugModal(true);
  };

  const handleOpenEditDrug = (drug: DrugItem) => {
    setEditingDrug(drug);
    setShowDrugModal(true);
  };

  const handleSaveDrug = (drugData: DrugItem) => {
    if (editingDrug) {
      updateDrugItem(editingDrug.drugCode, drugData);
    } else {
      addNewDrugItem(drugData);
    }
  };

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: PRESCRIPTION DISPENSARY WORKLIST */}
      {pharmacySubView === 'DISPENSARY' && (
        <PharmacyDispensaryView
          prescriptions={prescriptions}
          drugInventory={drugInventory}
          onOpenDispenseModal={handleOpenDispenseModal}
          onOpenRxPrint={onOpenRxPrint}
        />
      )}

      {/* SUBVIEW 2: DISPENSING HISTORY & AUDIT LOGS */}
      {pharmacySubView === 'HISTORY' && (
        <PharmacyHistoryView
          prescriptions={prescriptions}
          onOpenRxPrint={onOpenRxPrint}
        />
      )}

      {/* SUBVIEW 3: MULTI-STORE PERPETUAL STOCK INVENTORY */}
      {pharmacySubView === 'STOCK' && (
        <PharmacyStockInventoryView
          drugInventory={drugInventory}
          onOpenAddDrugModal={handleOpenAddDrug}
          onOpenEditDrugModal={handleOpenEditDrug}
        />
      )}

      {/* SUBVIEW 4: CONTROLLED SUBSTANCES & COLD-CHAIN VAULT */}
      {pharmacySubView === 'CONTROLLED' && (
        <ControlledDrugsView />
      )}

      {/* SUBVIEW 5: DISPENSARY & STOCK ANALYTICS */}
      {pharmacySubView === 'ANALYTICS' && (
        <PharmacyAnalyticsView />
      )}

      {/* MODAL 1: DISPENSE PRESCRIPTION MODAL */}
      {selectedRxForDispense && (
        <DispensePrescriptionModal
          prescription={selectedRxForDispense}
          drugInventory={drugInventory}
          pharmacistName={`${currentUser.name} (Lead Pharmacist)`}
          onClose={() => setSelectedRxForDispense(null)}
          onConfirmDispense={handleConfirmDispense}
          onOpenRxPrint={onOpenRxPrint}
        />
      )}

      {/* MODAL 2: ADD / EDIT FORMULARY DRUG MODAL */}
      {showDrugModal && (
        <DrugItemModal
          drug={editingDrug}
          onClose={() => {
            setShowDrugModal(false);
            setEditingDrug(null);
          }}
          onSave={handleSaveDrug}
        />
      )}
    </div>
  );
};
