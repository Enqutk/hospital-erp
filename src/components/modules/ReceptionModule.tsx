import React, { useState } from 'react';
import { UserPlus, LayoutGrid, Users, UserCheck, Activity } from 'lucide-react';
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

  const waitingInQueueCount = (opdQueue || []).filter((q) => q.status === 'Waiting').length;

  return (
    <div className="space-y-4">
      {/* Module Navigation & Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-base tracking-tight">Reception & Patient Registry</h1>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold px-2 py-0.5 rounded-md">
              Front Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master patient index, registration, electronic health records, and smart clinical routing.
          </p>
        </div>

        {/* Cohesive Sub-Navigation Segmented Control */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveSubView('DIRECTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'DIRECTORY'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Directory</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {patients.length}
            </span>
          </button>

          {selectedPatient && (
            <button
              type="button"
              onClick={() => setActiveSubView('DETAIL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer max-w-[200px] truncate ${
                activeSubView === 'DETAIL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">Chart: {selectedPatient.firstName}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSubView('QUEUE_BOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'QUEUE_BOARD'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Live OPD Queue</span>
            {waitingInQueueCount > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
                {waitingInQueueCount}
              </span>
            )}
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
