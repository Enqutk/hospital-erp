import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { OTSuitesView } from '../ot/OTSuitesView';
import { OTRegistryView } from '../ot/OTRegistryView';
import { OTWHOChecklistView } from '../ot/OTWHOChecklistView';
import { OTAnalyticsView } from '../ot/OTAnalyticsView';
import { ScheduleSurgeryModal } from '../modals/ScheduleSurgeryModal';
import { SurgeryCaseDetailModal } from '../modals/SurgeryCaseDetailModal';
import { SurgicalProcedure } from '../../types';

export const OTModule: React.FC = () => {
  const {
    surgeries = [],
    updateSurgeryStatus,
    otSubView,
    setOtSubView
  } = useHospital();

  const [selectedCase, setSelectedCase] = useState<SurgicalProcedure | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: LIVE OPERATING SUITES */}
      {otSubView === 'SUITES' && (
        <OTSuitesView
          onSelectCase={(s) => setSelectedCase(s)}
          onOpenScheduleModal={() => setScheduleModalOpen(true)}
        />
      )}

      {/* SUBVIEW 2: SURGICAL REGISTRY & SCHEDULE */}
      {otSubView === 'REGISTRY' && (
        <OTRegistryView
          onSelectCase={(s) => setSelectedCase(s)}
          onOpenScheduleModal={() => setScheduleModalOpen(true)}
        />
      )}

      {/* SUBVIEW 3: WHO SURGICAL SAFETY PROTOCOL */}
      {otSubView === 'WHO_CHECKLIST' && (
        <OTWHOChecklistView />
      )}

      {/* SUBVIEW 4: THEATER ANALYTICS & TELEMETRY */}
      {otSubView === 'ANALYTICS' && (
        <OTAnalyticsView />
      )}

      {/* MODAL 1: SCHEDULE SURGERY MODAL */}
      {scheduleModalOpen && (
        <ScheduleSurgeryModal
          onClose={() => setScheduleModalOpen(false)}
        />
      )}

      {/* MODAL 2: OPERATIVE CASE DETAIL & PACU MODAL */}
      {selectedCase && (
        <SurgeryCaseDetailModal
          surgery={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateStatus={updateSurgeryStatus}
        />
      )}
    </div>
  );
};
