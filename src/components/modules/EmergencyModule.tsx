import React, { useState } from 'react';
import {
  Activity,
  Bed,
  Plus,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { EmergencyCasesView } from '../emergency/EmergencyCasesView';
import { TraumaBayOverview } from '../emergency/TraumaBayOverview';
import { EmergencyCaseDetailPage } from '../emergency/EmergencyCaseDetailPage';
import { RapidIntakeModal } from '../emergency/RapidIntakeModal';
import { EmergencyRecord } from '../../types';

type EmergencySubView = 'CASES' | 'TRAUMA_BAYS' | 'CASE_DETAIL';

export const EmergencyModule: React.FC = () => {
  const {
    emergencyRecords,
    registerEmergencyPatient,
    updateEmergencyRecord,
    patients
  } = useHospital();

  const [activeSubView, setActiveSubView] = useState<EmergencySubView>('CASES');
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [isRapidIntakeOpen, setIsRapidIntakeOpen] = useState(false);

  const handleSelectCase = (emergencyId: string) => {
    setSelectedEmergencyId(emergencyId);
    setActiveSubView('CASE_DETAIL');
  };

  const handleIntakeSubmit = (data: Omit<EmergencyRecord, 'emergencyId' | 'arrivedAt'>) => {
    const created = registerEmergencyPatient(data);
    setSelectedEmergencyId(created.emergencyId);
    setActiveSubView('CASE_DETAIL');
  };

  const activeEmergencyCount = emergencyRecords.filter(
    (r) => r.status === 'In Trauma Bay' || r.status === 'Triaged'
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Header & Sub-View Switcher Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-base">Emergency Department & Trauma Triage</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
              {activeEmergencyCount} Active ER Cases
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rapid trauma intake, automated triage scoring (GCS, BP, SpO2), trauma bay tracking, and immediate surgical/ICU escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveSubView('CASES')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubView === 'CASES'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>ER Cases Board</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('TRAUMA_BAYS')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubView === 'TRAUMA_BAYS'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Trauma Bays</span>
            </button>

            {selectedEmergencyId && (
              <button
                type="button"
                onClick={() => setActiveSubView('CASE_DETAIL')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSubView === 'CASE_DETAIL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Case File</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsRapidIntakeOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Intake Victim</span>
          </button>
        </div>
      </div>

      {/* Sub-Views */}
      {activeSubView === 'CASES' && (
        <EmergencyCasesView
          records={emergencyRecords}
          onSelectCase={handleSelectCase}
          onOpenIntakeModal={() => setIsRapidIntakeOpen(true)}
          onUpdateStatus={updateEmergencyRecord}
        />
      )}

      {activeSubView === 'TRAUMA_BAYS' && (
        <TraumaBayOverview
          records={emergencyRecords}
          onSelectCase={handleSelectCase}
          onOpenIntakeModal={() => setIsRapidIntakeOpen(true)}
          onUpdateStatus={updateEmergencyRecord}
        />
      )}

      {activeSubView === 'CASE_DETAIL' && selectedEmergencyId && (
        <EmergencyCaseDetailPage
          emergencyId={selectedEmergencyId}
          onBack={() => setActiveSubView('CASES')}
        />
      )}

      {/* Rapid Emergency Intake Modal */}
      {isRapidIntakeOpen && (
        <RapidIntakeModal
          patients={patients}
          onClose={() => setIsRapidIntakeOpen(false)}
          onIntake={handleIntakeSubmit}
        />
      )}
    </div>
  );
};
