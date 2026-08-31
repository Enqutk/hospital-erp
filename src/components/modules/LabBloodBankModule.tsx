import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { LabOrder, BloodDonor, CrossmatchRecord } from '../../types';
import { LabOrdersView } from '../lab/LabOrdersView';
import { LabResultEntryView } from '../lab/LabResultEntryView';
import { BloodBankInventoryView } from '../lab/BloodBankInventoryView';
import { BloodDonorRegistryView } from '../lab/BloodDonorRegistryView';
import { CrossmatchSafetyView } from '../lab/CrossmatchSafetyView';
import { LabQualityControlView } from '../lab/LabQualityControlView';
import { LabAnalyticsView } from '../lab/LabAnalyticsView';
import { NewLabOrderModal } from '../lab/NewLabOrderModal';
import { LabResultEntryModal } from '../modals/LabResultEntryModal';
import { LabReportPrintModal } from '../modals/LabReportPrintModal';
import { BloodDonorModal } from '../modals/BloodDonorModal';

import { CrossmatchModal } from '../modals/CrossmatchModal';
import { CrossmatchCertificateModal } from '../modals/CrossmatchCertificateModal';

interface LabBloodBankModuleProps {
  onOpenLabPrint: (labOrderId: string) => void;
}

export const LabBloodBankModule: React.FC<LabBloodBankModuleProps> = ({ onOpenLabPrint }) => {
  const {
    labOrders,
    updateLabResults,
    createLabOrder,
    bloodUnits,
    bloodDonors,
    crossmatchRecords,
    registerBloodDonor,
    updateBloodDonor,
    addBloodUnit,
    createCrossmatch,
    updateCrossmatch,
    patients,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser,
    labSubView,
    setLabSubView
  } = useHospital();

  const [selectedLabOrderId, setSelectedLabOrderId] = useState<string>(labOrders[0]?.labOrderId || '');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editModalOrder, setEditModalOrder] = useState<LabOrder | null>(null);
  const [detailsModalOrder, setDetailsModalOrder] = useState<LabOrder | null>(null);

  // Blood Donor Modal State
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null);

  // Crossmatch Modal State
  const [showCrossmatchModal, setShowCrossmatchModal] = useState(false);
  const [editingCrossmatch, setEditingCrossmatch] = useState<CrossmatchRecord | null>(null);
  const [certificateCrossmatch, setCertificateCrossmatch] = useState<CrossmatchRecord | null>(null);

  const handleOpenDetails = (order: LabOrder) => {
    setSelectedLabOrderId(order.labOrderId);
    setDetailsModalOrder(order);
  };

  const handleOpenEdit = (order: LabOrder) => {
    setSelectedLabOrderId(order.labOrderId);
    setEditModalOrder(order);
  };

  const handleVerifyResults = (labOrderId: string, results: LabOrder['results'], isCritical: boolean) => {
    updateLabResults(
      labOrderId,
      results,
      isCritical ? 'Critical Alert' : 'Verified'
    );
  };

  const handleCreateNewOrder = (orderData: Omit<LabOrder, 'labOrderId'>) => {
    const created = createLabOrder(orderData);
    setSelectedLabOrderId(created.labOrderId);
    setEditModalOrder(created);
  };

  const handleOpenEnrollDonor = () => {
    setEditingDonor(null);
    setShowDonorModal(true);
  };

  const handleOpenEditDonor = (donor: BloodDonor) => {
    setEditingDonor(donor);
    setShowDonorModal(true);
  };

  const handleSaveDonor = (donorData: {
    fullName: string;
    phone: string;
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    eligible: boolean;
    donationsCount: number;
    lastDonationDate: string;
    addUnitToBank?: boolean;
  }) => {
    let donorCardId = editingDonor?.donorCardId;

    if (editingDonor) {
      updateBloodDonor(editingDonor.donorCardId, {
        fullName: donorData.fullName,
        phone: donorData.phone,
        bloodGroup: donorData.bloodGroup,
        eligible: donorData.eligible,
        donationsCount: donorData.donationsCount,
        lastDonationDate: donorData.lastDonationDate
      });
    } else {
      const created = registerBloodDonor({
        fullName: donorData.fullName,
        phone: donorData.phone,
        bloodGroup: donorData.bloodGroup,
        eligible: donorData.eligible,
        donationsCount: donorData.donationsCount,
        lastDonationDate: donorData.lastDonationDate
      });
      donorCardId = created.donorCardId;
    }

    if (donorData.addUnitToBank && donorData.eligible && donorCardId) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 35);

      addBloodUnit({
        bloodGroup: donorData.bloodGroup,
        collectionDate: donorData.lastDonationDate || new Date().toISOString().substring(0, 10),
        expiryDate: expiry.toISOString().substring(0, 10),
        screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true },
        status: 'Available',
        donorCardId: donorCardId,
        volumeMl: 450
      });
    }
  };

  const handleLogQuickDonation = (donor: BloodDonor) => {
    const today = new Date().toISOString().substring(0, 10);
    updateBloodDonor(donor.donorCardId, {
      donationsCount: donor.donationsCount + 1,
      lastDonationDate: today
    });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 35);

    addBloodUnit({
      bloodGroup: donor.bloodGroup as any,
      collectionDate: today,
      expiryDate: expiry.toISOString().substring(0, 10),
      screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true },
      status: 'Available',
      donorCardId: donor.donorCardId,
      volumeMl: 450
    });
  };

  const handleOpenCreateCrossmatch = () => {
    setEditingCrossmatch(null);
    setShowCrossmatchModal(true);
  };

  const handleOpenEditCrossmatch = (record: CrossmatchRecord) => {
    setEditingCrossmatch(record);
    setShowCrossmatchModal(true);
  };

  const handleSaveCrossmatch = (data: {
    mrn: string;
    matchedUnitId: string;
    crossmatchingResult: 'Compatible (No Agglutination)' | 'Incompatible';
    status: 'Cleared for Transfusion' | 'Testing' | 'Rejected';
  }) => {
    const p = getPatientByMrn(data.mrn);
    if (editingCrossmatch) {
      updateCrossmatch(editingCrossmatch.matchId, {
        matchedUnitId: data.matchedUnitId,
        crossmatchingResult: data.crossmatchingResult,
        status: data.status
      });
    } else {
      createCrossmatch({
        mrn: data.mrn,
        patientName: p ? `${p.firstName} ${p.lastName}` : 'Patient',
        patientBloodGroup: p?.bloodGroup || 'A+',
        requestedUnits: 1,
        matchedUnitId: data.matchedUnitId,
        crossmatchingResult: data.crossmatchingResult,
        status: data.status
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: LAB ORDERS WORKLIST */}
      {labSubView === 'ORDERS' && (
        <LabOrdersView
          labOrders={labOrders}
          selectedLabOrderId={selectedLabOrderId}
          onOpenDetailsModal={handleOpenDetails}
          onOpenEditModal={handleOpenEdit}
          onOpenOrderModal={() => setShowNewOrderModal(true)}
          onOpenLabPrint={onOpenLabPrint}
        />
      )}

      {/* SUBVIEW 2: PARAMETRIC RESULT ENTRY & VALIDATION WORKSTATION */}
      {labSubView === 'RESULTS' && (
        <LabResultEntryView
          labOrders={labOrders}
          selectedLabOrderId={selectedLabOrderId}
          onSelectOrder={(order) => setSelectedLabOrderId(order.labOrderId)}
          onVerifyResults={handleVerifyResults}
          onOpenLabPrint={onOpenLabPrint}
          verifyingTechName={`${currentUser.name} (MLS)`}
        />
      )}

      {/* SUBVIEW 3: BLOOD UNITS INVENTORY & COLD CHAIN */}
      {labSubView === 'BLOOD_BANK' && (
        <BloodBankInventoryView
          bloodUnits={bloodUnits}
          onOpenDonorIntake={() => setLabSubView('DONORS')}
        />
      )}

      {/* SUBVIEW 4: DONOR REGISTRY & INTAKE (MODAL DRIVEN) */}
      {labSubView === 'DONORS' && (
        <BloodDonorRegistryView
          bloodDonors={bloodDonors}
          onOpenEnrollModal={handleOpenEnrollDonor}
          onOpenEditModal={handleOpenEditDonor}
          onLogDonation={handleLogQuickDonation}
        />
      )}

      {/* SUBVIEW 5: COMPATIBILITY & CROSSMATCHING (MODAL DRIVEN) */}
      {labSubView === 'CROSSMATCH' && (
        <CrossmatchSafetyView
          patients={patients}
          bloodUnits={bloodUnits}
          crossmatchRecords={crossmatchRecords}
          selectedPatientMrn={selectedPatientMrn}
          onOpenCreateModal={handleOpenCreateCrossmatch}
          onOpenEditModal={handleOpenEditCrossmatch}
          onOpenCertificateModal={(rec) => setCertificateCrossmatch(rec)}
        />
      )}

      {/* SUBVIEW 6: QUALITY CONTROL & ANALYZERS */}
      {labSubView === 'QC' && (
        <LabQualityControlView />
      )}

      {/* SUBVIEW 7: LABORATORY ANALYTICS & TAT */}
      {labSubView === 'ANALYTICS' && (
        <LabAnalyticsView />
      )}

      {/* MODAL 1: PARAMETRIC RESULT ENTRY MODAL */}
      {editModalOrder && (
        <LabResultEntryModal
          labOrder={editModalOrder}
          onClose={() => setEditModalOrder(null)}
          onVerifyResults={handleVerifyResults}
          onOpenLabPrint={onOpenLabPrint}
          verifyingTechName={`${currentUser.name} (MLS)`}
        />
      )}

      {/* MODAL 2: LAB REPORT & DETAILS CERTIFICATE MODAL */}
      {detailsModalOrder && (
        <LabReportPrintModal
          labOrder={detailsModalOrder}
          onClose={() => setDetailsModalOrder(null)}
        />
      )}

      {/* MODAL 3: NEW STAT LAB ORDER */}
      {showNewOrderModal && (
        <NewLabOrderModal
          patients={patients}
          onClose={() => setShowNewOrderModal(false)}
          onCreateOrder={handleCreateNewOrder}
        />
      )}

      {/* MODAL 4: ENROLL / EDIT BLOOD DONOR MODAL */}
      {showDonorModal && (
        <BloodDonorModal
          donor={editingDonor}
          onClose={() => {
            setShowDonorModal(false);
            setEditingDonor(null);
          }}
          onSave={handleSaveDonor}
        />
      )}

      {/* MODAL 5: CREATE / EDIT CROSSMATCH MODAL */}
      {showCrossmatchModal && (
        <CrossmatchModal
          crossmatch={editingCrossmatch}
          patients={patients}
          bloodUnits={bloodUnits}
          selectedPatientMrn={selectedPatientMrn}
          onClose={() => {
            setShowCrossmatchModal(false);
            setEditingCrossmatch(null);
          }}
          onSave={handleSaveCrossmatch}
        />
      )}

      {/* MODAL 6: CROSSMATCH CERTIFICATE & PRINT SLIP MODAL */}
      {certificateCrossmatch && (
        <CrossmatchCertificateModal
          crossmatch={certificateCrossmatch}
          onClose={() => setCertificateCrossmatch(null)}
        />
      )}
    </div>
  );
};
