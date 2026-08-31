import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, Vitals } from '../../types';
import { PatientDirectoryView } from '../reception/PatientDirectoryView';
import { LiveQueueBoardView } from '../reception/LiveQueueBoardView';
import { NewPatientModal } from '../reception/NewPatientModal';
import { DispatchToDoctorModal } from '../reception/DispatchToDoctorModal';
import { ReceptionPrintStationView } from '../reception/ReceptionPrintStationView';
import { ReceptionTariffLookupView } from '../reception/ReceptionTariffLookupView';
import { ReceptionShiftSummaryView } from '../reception/ReceptionShiftSummaryView';
import { ReceptionAnalyticsView } from '../reception/ReceptionAnalyticsView';
import { PatientDetailModal } from '../modals/PatientDetailModal';

interface ReceptionModuleProps {
  onOpenPatientCard?: (patient: Patient) => void;
  onOpenCardPrint?: () => void;
}

export const ReceptionModule: React.FC<ReceptionModuleProps> = ({
  onOpenPatientCard,
  onOpenCardPrint
}) => {
  const {
    patients,
    registerPatient,
    checkDuplicatePatient,
    selectedPatientMrn,
    setSelectedPatientMrn,
    getPatientByMrn,
    opdQueue,
    dispatchPatientToOPD,
    receptionSubView,
    setReceptionSubView
  } = useHospital();

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [dispatchModalPatient, setDispatchModalPatient] = useState<Patient | null>(null);
  const [detailModalPatient, setDetailModalPatient] = useState<Patient | null>(null);

  const selectedPatient = selectedPatientMrn
    ? getPatientByMrn(selectedPatientMrn) || patients[0]
    : patients[0];

  const handleSelectPatient = (mrn: string) => {
    setSelectedPatientMrn(mrn);
    const p = getPatientByMrn(mrn) || patients.find((x) => x.mrn === mrn);
    if (p) {
      setDetailModalPatient(p);
    }
  };

  const handlePrintCard = (patient: Patient) => {
    setSelectedPatientMrn(patient.mrn);
    if (onOpenPatientCard) {
      onOpenPatientCard(patient);
    } else if (onOpenCardPrint) {
      onOpenCardPrint();
    }
  };

  const handleRegisterNewPatient = (
    patientData: Omit<Patient, 'mrn' | 'registeredAt'>,
    autoDispatch: boolean,
    targetRoom: number,
    vitals: Vitals
  ) => {
    const created = registerPatient(patientData);
    if (autoDispatch) {
      dispatchPatientToOPD(created.mrn, targetRoom, 'Routine', vitals);
    }
    setSelectedPatientMrn(created.mrn);
    setDetailModalPatient(created);
  };

  const handleDispatchPatient = (
    mrn: string,
    assignedRoom: number,
    priority: 'Routine' | 'Urgent' | 'Elderly/Child',
    vitals: Vitals
  ) => {
    dispatchPatientToOPD(mrn, assignedRoom, priority, vitals);
    setDispatchModalPatient(null);
  };

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: MASTER PATIENT DIRECTORY */}
      {receptionSubView === 'DIRECTORY' && (
        <PatientDirectoryView
          patients={patients}
          opdQueue={opdQueue}
          onSelectPatient={handleSelectPatient}
          onOpenRegisterModal={() => setShowAddPatientModal(true)}
          onOpenDispatchModal={(patient) => setDispatchModalPatient(patient)}
          onOpenPrintCard={handlePrintCard}
        />
      )}

      {/* SUBVIEW 2: LIVE OPD QUEUE BOARD */}
      {receptionSubView === 'QUEUE_BOARD' && (
        <LiveQueueBoardView
          opdQueue={opdQueue}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {/* SUBVIEW 3: ID CARD PRINTING DESK */}
      {receptionSubView === 'PRINT_STATION' && (
        <ReceptionPrintStationView
          onOpenPatientCard={handlePrintCard}
        />
      )}

      {/* SUBVIEW 4: HOSPITAL TARIFFS & FEE SCHEDULE */}
      {receptionSubView === 'TARIFFS' && (
        <ReceptionTariffLookupView />
      )}

      {/* SUBVIEW 5: FRONT DESK SHIFT SUMMARY */}
      {receptionSubView === 'SHIFT_SUMMARY' && (
        <ReceptionShiftSummaryView />
      )}

      {/* SUBVIEW 6: INTAKE & REGISTRY ANALYTICS */}
      {receptionSubView === 'ANALYTICS' && (
        <ReceptionAnalyticsView />
      )}

      {/* MODAL 1: PATIENT DETAILS OVERLAY MODAL */}
      {detailModalPatient && (
        <PatientDetailModal
          patient={detailModalPatient}
          onClose={() => setDetailModalPatient(null)}
          onOpenDispatchModal={(p) => setDispatchModalPatient(p)}
          onOpenPrintCard={handlePrintCard}
        />
      )}

      {/* MODAL 2: REGISTER NEW PATIENT */}
      {showAddPatientModal && (
        <NewPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onRegister={handleRegisterNewPatient}
          checkDuplicate={checkDuplicatePatient}
        />
      )}

      {/* MODAL 3: DISPATCH TO OPD DOCTOR */}
      {dispatchModalPatient && (
        <DispatchToDoctorModal
          patient={dispatchModalPatient}
          onClose={() => setDispatchModalPatient(null)}
          onDispatch={handleDispatchPatient}
        />
      )}
    </div>
  );
};
