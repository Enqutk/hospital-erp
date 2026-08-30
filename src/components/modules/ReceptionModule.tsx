import React, { useState } from 'react';
import { UserPlus, LayoutGrid, Users, UserCheck } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, Vitals } from '../../types';
import { PatientDirectoryView } from '../reception/PatientDirectoryView';
import { PatientDetailPage } from '../reception/PatientDetailPage';
import { LiveQueueBoardView } from '../reception/LiveQueueBoardView';
import { NewPatientModal } from '../reception/NewPatientModal';
import { DispatchToDoctorModal } from '../reception/DispatchToDoctorModal';

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
    dispatchPatientToOPD
  } = useHospital();

  const [activeSubView, setActiveSubView] = useState<'DIRECTORY' | 'DETAIL' | 'QUEUE_BOARD'>('DIRECTORY');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [dispatchModalPatient, setDispatchModalPatient] = useState<Patient | null>(null);

  const selectedPatient = selectedPatientMrn
    ? getPatientByMrn(selectedPatientMrn) || patients[0]
    : patients[0];

  const handleSelectPatient = (mrn: string) => {
    setSelectedPatientMrn(mrn);
    setActiveSubView('DETAIL');
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
    setActiveSubView('DETAIL');
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
      {/* Module Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Reception & Patient Registry</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              Front Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master patient index, registration, electronic health records, and smart clinical routing.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubView('DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSubView === 'DIRECTORY'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Patient Directory
          </button>

          {selectedPatient && (
            <button
              type="button"
              onClick={() => setActiveSubView('DETAIL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeSubView === 'DETAIL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Patient Details ({selectedPatient.firstName} {selectedPatient.lastName})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSubView('QUEUE_BOARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSubView === 'QUEUE_BOARD'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Live OPD Queue
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: MASTER PATIENT DIRECTORY */}
      {activeSubView === 'DIRECTORY' && (
        <PatientDirectoryView
          patients={patients}
          opdQueue={opdQueue}
          onSelectPatient={handleSelectPatient}
          onOpenRegisterModal={() => setShowAddPatientModal(true)}
          onOpenDispatchModal={(patient) => setDispatchModalPatient(patient)}
          onOpenPrintCard={handlePrintCard}
        />
      )}

      {/* SUBVIEW 2: DEDICATED PATIENT DETAIL PAGE */}
      {activeSubView === 'DETAIL' && selectedPatient && (
        <PatientDetailPage
          patient={selectedPatient}
          onBack={() => setActiveSubView('DIRECTORY')}
          onOpenDispatchModal={(patient) => setDispatchModalPatient(patient)}
          onOpenPrintCard={handlePrintCard}
        />
      )}

      {/* SUBVIEW 3: LIVE OPD QUEUE BOARD */}
      {activeSubView === 'QUEUE_BOARD' && (
        <LiveQueueBoardView
          opdQueue={opdQueue}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {/* MODAL 1: REGISTER NEW PATIENT */}
      {showAddPatientModal && (
        <NewPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onRegister={handleRegisterNewPatient}
          checkDuplicate={checkDuplicatePatient}
        />
      )}

      {/* MODAL 2: DISPATCH TO OPD DOCTOR */}
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
