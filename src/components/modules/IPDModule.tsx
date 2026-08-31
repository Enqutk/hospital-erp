import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { WardCode, IPDAdmission, DoctorAdmissionOrder } from '../../types';
import { IPDSubTab } from '../ipd/types';
import { IPDHeader } from '../ipd/IPDHeader';
import { IPDKpiStats } from '../ipd/IPDKpiStats';
import { IPDSubNav } from '../ipd/IPDSubNav';
import { DoctorOrdersTab } from '../ipd/tabs/DoctorOrdersTab';
import { BedMatrixTab } from '../ipd/tabs/BedMatrixTab';
import { PediatricsTab } from '../ipd/tabs/PediatricsTab';
import { ActiveInpatientsTab } from '../ipd/tabs/ActiveInpatientsTab';
import { DischargeClearanceTab } from '../ipd/tabs/DischargeClearanceTab';
import { DoctorOrderDetailView } from '../ipd/details/DoctorOrderDetailView';
import { InpatientClinicalChartView } from '../ipd/details/InpatientClinicalChartView';
import { AllocateBedModal } from '../ipd/modals/AllocateBedModal';
import { DirectAdmitModal } from '../ipd/modals/DirectAdmitModal';
import { TransferBedModal } from '../ipd/modals/TransferBedModal';
import { CreateBedOrderModal } from '../ipd/modals/CreateBedOrderModal';

export const IPDModule: React.FC = () => {
  const {
    beds,
    ipdAdmissions,
    admissionOrders,
    createAdmissionOrder,
    allocateBedForOrder,
    cancelAdmissionOrder,
    patients,
    admitPatientToBed,
    transferBed,
    updateBedStatus,
    updateDischargeChecklist,
    finalizeDischarge,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser
  } = useHospital();

  // Navigation State
  const [activeSubTab, setActiveSubTab] = useState<IPDSubTab>('DOCTOR_ORDERS');

  // Detail Page State (Separation of Concerns: Separate full views for details)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<DoctorAdmissionOrder | null>(null);
  const [selectedAdmissionForChart, setSelectedAdmissionForChart] = useState<IPDAdmission | null>(null);

  // Modals state
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [newDoctorOrderModalOpen, setNewDoctorOrderModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [orderToAllocate, setOrderToAllocate] = useState<DoctorAdmissionOrder | null>(null);
  const [activeAdmissionForTransfer, setActiveAdmissionForTransfer] = useState<IPDAdmission | null>(null);

  // Quick preset state for direct admit modal
  const [admitModalPreset, setAdmitModalPreset] = useState<{ wardCode: WardCode; bedNumber?: string }>({
    wardCode: 'PEDIATRICS'
  });

  // KPI Calculations
  const pendingOrders = (admissionOrders || []).filter((o) => o.status === 'Pending Bed Allocation');
  const totalOrders = (admissionOrders || []).length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'Cleaning').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const pediatricBeds = beds.filter((b) => b.wardCode === 'PEDIATRICS');
  const pediatricOccupied = pediatricBeds.filter((b) => b.status === 'Occupied').length;
  const pediatricAvailable = pediatricBeds.filter((b) => b.status === 'Available').length;

  const activeInpatients = ipdAdmissions.filter((a) => a.status === 'Active');

  // Handler for allocating bed from modal or detail view
  const handleOpenAllocateModal = (order: DoctorAdmissionOrder) => {
    setOrderToAllocate(order);
    setAllocateModalOpen(true);
  };

  const handleConfirmBedAllocation = (orderId: string, wardCode: WardCode, bedNumber: string) => {
    allocateBedForOrder(orderId, wardCode, bedNumber);
    setAllocateModalOpen(false);
    setOrderToAllocate(null);
    if (selectedOrderForDetail && selectedOrderForDetail.orderId === orderId) {
      // Update the local selected order view
      setSelectedOrderForDetail((prev) =>
        prev ? { ...prev, status: 'Bed Allocated', assignedBedNumber: bedNumber } : null
      );
    }
  };

  const handleOpenDirectAdmit = (wardCode: WardCode = 'PEDIATRICS', bedNumber?: string) => {
    setAdmitModalPreset({ wardCode, bedNumber });
    setAdmitModalOpen(true);
  };

  const handleOpenTransferModal = (admission: IPDAdmission) => {
    setActiveAdmissionForTransfer(admission);
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = (admissionId: string, targetWard: WardCode, targetBed: string, reason: string) => {
    transferBed(admissionId, targetWard, targetBed, reason);
    setTransferModalOpen(false);
    setActiveAdmissionForTransfer(null);
    // If viewing chart of this admission, refresh
    if (selectedAdmissionForChart && selectedAdmissionForChart.admissionId === admissionId) {
      const updated = ipdAdmissions.find((a) => a.admissionId === admissionId);
      if (updated) setSelectedAdmissionForChart(updated);
    }
  };

  const handleOpenChartByBedNumber = (bedNumber: string) => {
    const matchingAdm = ipdAdmissions.find((a) => a.bedNumber === bedNumber && a.status === 'Active');
    if (matchingAdm) {
      setSelectedOrderForDetail(null);
      setSelectedAdmissionForChart(matchingAdm);
    } else {
      setSelectedOrderForDetail(null);
      setActiveSubTab('ACTIVE_INPATIENTS');
    }
  };

  // If a Doctor Order Detail view is active, render the dedicated Detail Page!
  if (selectedOrderForDetail) {
    const patient = getPatientByMrn(selectedOrderForDetail.mrn);
    return (
      <div className="space-y-5">
        <IPDHeader
          onOpenNewOrder={() => setNewDoctorOrderModalOpen(true)}
          onOpenDirectAdmit={() => handleOpenDirectAdmit('PEDIATRICS')}
        />
        <DoctorOrderDetailView
          order={selectedOrderForDetail}
          patient={patient}
          onBack={() => setSelectedOrderForDetail(null)}
          onAllocateBed={(order) => handleOpenAllocateModal(order)}
          onCancelOrder={(orderId) => {
            cancelAdmissionOrder(orderId, 'Cancelled from order details view');
            setSelectedOrderForDetail(null);
          }}
          onOpenChart={handleOpenChartByBedNumber}
        />

        {/* Modals needed in detail view */}
        <AllocateBedModal
          order={orderToAllocate}
          beds={beds}
          onClose={() => {
            setAllocateModalOpen(false);
            setOrderToAllocate(null);
          }}
          onConfirm={handleConfirmBedAllocation}
        />
      </div>
    );
  }

  // If an Inpatient Clinical Chart view is active, render the dedicated Clinical Chart Page!
  if (selectedAdmissionForChart) {
    const patient = getPatientByMrn(selectedAdmissionForChart.mrn);
    const bed = beds.find((b) => b.bedNumber === selectedAdmissionForChart.bedNumber);

    return (
      <div className="space-y-5">
        <IPDHeader
          onOpenNewOrder={() => setNewDoctorOrderModalOpen(true)}
          onOpenDirectAdmit={() => handleOpenDirectAdmit('PEDIATRICS')}
        />
        <InpatientClinicalChartView
          admission={selectedAdmissionForChart}
          patient={patient}
          bed={bed}
          onBack={() => setSelectedAdmissionForChart(null)}
          onTransfer={(adm) => handleOpenTransferModal(adm)}
          onGoToDischargeTab={() => {
            setSelectedAdmissionForChart(null);
            setActiveSubTab('DISCHARGE_CLEARANCE');
          }}
        />

        {/* Modals needed in chart view */}
        <TransferBedModal
          admission={activeAdmissionForTransfer}
          beds={beds}
          onClose={() => {
            setTransferModalOpen(false);
            setActiveAdmissionForTransfer(null);
          }}
          onTransfer={handleExecuteTransfer}
        />
      </div>
    );
  }

  // Otherwise, render the Clean Main Dashboard with KPI strip, Sub Navigation, and Sub-Tabs
  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <IPDHeader
        onOpenNewOrder={() => setNewDoctorOrderModalOpen(true)}
        onOpenDirectAdmit={() => handleOpenDirectAdmit('PEDIATRICS')}
      />

      {/* 2. KPI Overview Strip */}
      <IPDKpiStats
        activeSubTab={activeSubTab}
        onSelectTab={(tab) => setActiveSubTab(tab)}
        pendingOrdersCount={pendingOrders.length}
        totalOrdersCount={totalOrders}
        totalBedsCount={totalBeds}
        occupiedBedsCount={occupiedBeds}
        occupancyRate={occupancyRate}
        pediatricOccupied={pediatricOccupied}
        pediatricTotal={pediatricBeds.length}
        pediatricAvailable={pediatricAvailable}
        availableBedsCount={availableBeds}
        cleaningBedsCount={cleaningBeds}
      />

      {/* 3. Sub Navigation Tabs */}
      <IPDSubNav
        activeSubTab={activeSubTab}
        onSelectTab={(tab) => setActiveSubTab(tab)}
        pendingOrdersCount={pendingOrders.length}
        totalBedsCount={totalBeds}
        activeInpatientsCount={activeInpatients.length}
      />

      {/* 4. Active Sub-Tab View */}
      {activeSubTab === 'DOCTOR_ORDERS' && (
        <DoctorOrdersTab
          admissionOrders={admissionOrders}
          patients={patients}
          onOpenNewOrderModal={() => setNewDoctorOrderModalOpen(true)}
          onOpenAllocateModal={handleOpenAllocateModal}
          onSelectOrderForDetail={(order) => setSelectedOrderForDetail(order)}
          onOpenChart={handleOpenChartByBedNumber}
        />
      )}

      {activeSubTab === 'BED_MATRIX' && (
        <BedMatrixTab
          beds={beds}
          ipdAdmissions={ipdAdmissions}
          onOpenDirectAdmit={(ward, bedNo) => handleOpenDirectAdmit(ward, bedNo)}
          onOpenTransferModal={handleOpenTransferModal}
          onOpenChart={(adm) => setSelectedAdmissionForChart(adm)}
          onUpdateBedStatus={updateBedStatus}
        />
      )}

      {activeSubTab === 'PEDIATRICS' && (
        <PediatricsTab
          ipdAdmissions={ipdAdmissions}
          patients={patients}
          onOpenDirectAdmit={(ward) => handleOpenDirectAdmit(ward)}
          onOpenChart={(adm) => setSelectedAdmissionForChart(adm)}
        />
      )}

      {activeSubTab === 'ACTIVE_INPATIENTS' && (
        <ActiveInpatientsTab
          ipdAdmissions={ipdAdmissions}
          patients={patients}
          onOpenChart={(adm) => setSelectedAdmissionForChart(adm)}
          onOpenTransferModal={handleOpenTransferModal}
        />
      )}

      {activeSubTab === 'DISCHARGE_CLEARANCE' && (
        <DischargeClearanceTab
          ipdAdmissions={ipdAdmissions}
          onUpdateDischargeChecklist={updateDischargeChecklist}
          onFinalizeDischarge={finalizeDischarge}
        />
      )}

      {/* 5. Modals */}
      <AllocateBedModal
        order={orderToAllocate}
        beds={beds}
        onClose={() => {
          setAllocateModalOpen(false);
          setOrderToAllocate(null);
        }}
        onConfirm={handleConfirmBedAllocation}
      />

      <DirectAdmitModal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        patients={patients}
        beds={beds}
        initialMrn={selectedPatientMrn || undefined}
        initialWard={admitModalPreset.wardCode}
        initialBed={admitModalPreset.bedNumber}
        onAdmit={(mrn, wardCode, bedNumber, diagnosis, doc) => {
          admitPatientToBed(mrn, wardCode, bedNumber, diagnosis, doc);
        }}
      />

      <TransferBedModal
        admission={activeAdmissionForTransfer}
        beds={beds}
        onClose={() => {
          setTransferModalOpen(false);
          setActiveAdmissionForTransfer(null);
        }}
        onTransfer={handleExecuteTransfer}
      />

      <CreateBedOrderModal
        isOpen={newDoctorOrderModalOpen}
        onClose={() => setNewDoctorOrderModalOpen(false)}
        patients={patients}
        currentUser={currentUser}
        initialMrn={selectedPatientMrn || undefined}
        onCreateOrder={(orderData) => {
          createAdmissionOrder(orderData);
        }}
      />
    </div>
  );
};
