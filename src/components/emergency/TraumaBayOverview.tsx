import React from 'react';
import { Bed, Activity, HeartPulse, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmergencyRecord } from '../../types';

interface TraumaBayOverviewProps {
  records: EmergencyRecord[];
  onSelectCase: (emergencyId: string) => void;
  onOpenIntakeModal: () => void;
  onUpdateStatus: (emergencyId: string, status: EmergencyRecord['status']) => void;
}

const TRAUMA_BAYS: Array<{
  name: EmergencyRecord['activeTraumaBay'];
  category: 'Resuscitation (Critical Red)' | 'Trauma / Emergent' | 'Observation Unit';
  description: string;
}> = [
  {
    name: 'Resus Bay 1',
    category: 'Resuscitation (Critical Red)',
    description: 'Equipped with mechanical ventilator, defibrillator, rapid infuser & invasive monitors.'
  },
  {
    name: 'Resus Bay 2',
    category: 'Resuscitation (Critical Red)',
    description: 'Stat airway management, central line kits, chest tube setup.'
  },
  {
    name: 'Trauma Bay 1',
    category: 'Trauma / Emergent',
    description: 'Major trauma resuscitation, pelvic binders, FAST ultrasound on stand-by.'
  },
  {
    name: 'Trauma Bay 2',
    category: 'Trauma / Emergent',
    description: 'Acute coronary syndrome, stroke protocol, severe respiratory distress.'
  },
  {
    name: 'Observation A',
    category: 'Observation Unit',
    description: 'Short-stay clinical monitoring (2-6 hours) for stable triage patients.'
  },
  {
    name: 'Observation B',
    category: 'Observation Unit',
    description: 'Pediatric & minor trauma post-stabilization monitoring.'
  }
];

export const TraumaBayOverview: React.FC<TraumaBayOverviewProps> = ({
  records,
  onSelectCase,
  onOpenIntakeModal,
  onUpdateStatus
}) => {
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">Trauma Bay & Resuscitation Unit Status</span>
          <span className="text-slate-500">• Real-time bed occupancy across all 6 ER bays</span>
        </div>

        <button
          type="button"
          onClick={onOpenIntakeModal}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          Assign Patient to Bay
        </button>
      </div>

      {/* 6 Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {TRAUMA_BAYS.map((bay) => {
          const activeCase = records.find(
            (r) => r.activeTraumaBay === bay.name && r.status !== 'Discharged' && r.status !== 'Transferred to OT' && r.status !== 'Admitted to ICU'
          );

          const isResus = bay.category.includes('Resuscitation');

          return (
            <div
              key={bay.name}
              className={`bg-white border rounded-lg p-4 flex flex-col justify-between space-y-3 ${
                activeCase
                  ? activeCase.triageLevel === 'RED'
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-300'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Bay Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{bay.name}</span>
                      {isResus && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Level 1 Stat
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{bay.category}</span>
                  </div>

                  {activeCase ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeCase.triageLevel === 'RED'
                        ? 'bg-rose-900 text-white'
                        : activeCase.triageLevel === 'YELLOW'
                        ? 'bg-amber-700 text-white'
                        : 'bg-emerald-800 text-white'
                    }`}>
                      Code {activeCase.triageLevel}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                      Vacant / Ready
                    </span>
                  )}
                </div>

                {/* Patient / Occupancy Information */}
                {activeCase ? (
                  <div className="mt-3 space-y-2">
                    <div
                      onClick={() => onSelectCase(activeCase.emergencyId)}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors cursor-pointer space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{activeCase.patientName}</span>
                        <span className="font-mono text-[11px] text-slate-500">MRN: {activeCase.mrn}</span>
                      </div>

                      <p className="text-[11px] text-slate-700 line-clamp-2">
                        {activeCase.presentingComplaint}
                      </p>

                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-700">
                        <div>BP: <strong>{activeCase.criticalVitals.bpSystolic}/{activeCase.criticalVitals.bpDiastolic}</strong></div>
                        <div>HR: <strong>{activeCase.criticalVitals.heartRate}</strong></div>
                        <div>SpO2: <strong>{activeCase.criticalVitals.spO2}%</strong></div>
                        <div>GCS: <strong>{activeCase.criticalVitals.gcsScore || 15}/15</strong></div>
                      </div>

                      <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                        <span>Staff: {activeCase.attendingStaff}</span>
                        <span>Arrived: {activeCase.arrivedAt}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-center text-slate-400 text-xs">
                    Bay is vacant and prepared for trauma intake.
                  </div>
                )}
              </div>

              {/* Bay Capabilities & Quick Actions */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="text-[11px] text-slate-500 leading-tight">
                  {bay.description}
                </div>

                {activeCase && (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectCase(activeCase.emergencyId)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium cursor-pointer text-center"
                    >
                      Manage Case File
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
