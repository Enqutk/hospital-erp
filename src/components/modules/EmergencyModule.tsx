import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { EmergencyCasesView } from '../emergency/EmergencyCasesView';
import { TraumaBayOverview } from '../emergency/TraumaBayOverview';
import { EmergencyAnalyticsView } from '../emergency/EmergencyAnalyticsView';
import { RapidIntakeModal } from '../emergency/RapidIntakeModal';
import { EmergencyCaseModal } from '../modals/EmergencyCaseModal';
import { EmergencyRecord } from '../../types';

export const EmergencyModule: React.FC = () => {
  const {
    emergencyRecords,
    registerEmergencyPatient,
    updateEmergencyRecord,
    patients,
    emergencySubView,
    setEmergencySubView
  } = useHospital();

  const [selectedCase, setSelectedCase] = useState<EmergencyRecord | null>(null);
  const [isRapidIntakeOpen, setIsRapidIntakeOpen] = useState(false);

  const handleSelectCase = (emergencyId: string) => {
    const matched = emergencyRecords.find((r) => r.emergencyId === emergencyId);
    if (matched) {
      setSelectedCase(matched);
    }
  };

  const handleIntakeSubmit = (data: Omit<EmergencyRecord, 'emergencyId' | 'arrivedAt'>) => {
    const created = registerEmergencyPatient(data);
    setSelectedCase(created);
    setIsRapidIntakeOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: ACTIVE EMERGENCY & TRIAGE ROSTER */}
      {emergencySubView === 'ACTIVE_CASES' && (
        <EmergencyCasesView
          records={emergencyRecords}
          onSelectCase={handleSelectCase}
          onOpenIntakeModal={() => setIsRapidIntakeOpen(true)}
          onUpdateStatus={updateEmergencyRecord}
        />
      )}

      {/* SUBVIEW 2: TRAUMA BAY MATRIX */}
      {emergencySubView === 'TRAUMA_BAYS' && (
        <TraumaBayOverview
          records={emergencyRecords}
          onSelectCase={handleSelectCase}
          onOpenIntakeModal={() => setIsRapidIntakeOpen(true)}
          onUpdateStatus={updateEmergencyRecord}
        />
      )}

      {/* SUBVIEW 3: EMERGENCY TELEMETRY & ANALYTICS */}
      {emergencySubView === 'ANALYTICS' && (
        <EmergencyAnalyticsView />
      )}

      {/* MODAL 1: RAPID EMERGENCY INTAKE MODAL */}
      {isRapidIntakeOpen && (
        <RapidIntakeModal
          patients={patients}
          onClose={() => setIsRapidIntakeOpen(false)}
          onIntake={handleIntakeSubmit}
        />
      )}

      {/* MODAL 2: ACTIVE TRAUMA CASE MANAGEMENT MODAL */}
      {selectedCase && (
        <EmergencyCaseModal
          caseRecord={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateStatus={updateEmergencyRecord}
        />
      )}
    </div>
  );
};
