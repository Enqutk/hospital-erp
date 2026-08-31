import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  Activity,
  BedDouble,
  HeartPulse,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Clock,
  ShieldCheck,
  User
} from 'lucide-react';
import { EmergencyRecord, TriageLevel } from '../../types';

interface EmergencyCaseModalProps {
  caseRecord: EmergencyRecord | null;
  onClose: () => void;
  onUpdateStatus: (emergencyId: string, status: EmergencyRecord['status']) => void;
}

export const EmergencyCaseModal: React.FC<EmergencyCaseModalProps> = ({
  caseRecord,
  onClose,
  onUpdateStatus
}) => {
  if (!caseRecord) return null;

  const [triageStatus, setTriageStatus] = useState<EmergencyRecord['status']>(caseRecord.status);
  const [traumaBay, setTraumaBay] = useState(caseRecord.activeTraumaBay || 'Resus Bay 1');
  const [clinicianNotes, setClinicianNotes] = useState(
    'Airway patent, cervical collar in place. High-flow oxygen via non-rebreather mask (15L/min). Two wide-bore 16G IV lines secured.'
  );

  const [highFlowO2, setHighFlowO2] = useState(true);
  const [ivFluids, setIvFluids] = useState(true);
  const [statLabs, setStatLabs] = useState(true);
  const [bloodCrossmatch, setBloodCrossmatch] = useState(caseRecord.triageLevel === 'RED');

  const getTriagePill = (level: TriageLevel) => {
    switch (level) {
      case 'RED':
        return 'bg-rose-600 text-white font-bold';
      case 'YELLOW':
        return 'bg-amber-600 text-white font-bold';
      case 'GREEN':
        return 'bg-emerald-700 text-white font-bold';
      case 'BLUE':
        return 'bg-sky-700 text-white font-bold';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(caseRecord.emergencyId, triageStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Emergency Trauma Case Management
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${getTriagePill(caseRecord.triageLevel)}`}>
                  CODE {caseRecord.triageLevel}
                </span>
                <span className="font-mono text-[11px] bg-white text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {caseRecord.emergencyId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-800">{caseRecord.patientName}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-600">{caseRecord.mrn}</span>
                <span className="text-slate-300">•</span>
                <span>Arrived: {caseRecord.arrivedAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Presenting Complaint & Trauma Bay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Presenting Trauma / Complaint</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{caseRecord.presentingComplaint}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Trauma Bay</span>
              <div className="font-semibold text-slate-800 text-xs mt-0.5">{caseRecord.activeTraumaBay}</div>
            </div>
          </div>

          {/* Critical Triage Vitals Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Blood Pressure</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                {caseRecord.vitals?.bpSystolic ?? 120}/{caseRecord.vitals?.bpDiastolic ?? 80} mmHg
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Heart Rate</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                {caseRecord.vitals?.heartRate ?? 75} bpm
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">SpO2 (Pulse Ox)</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                {caseRecord.vitals?.spO2 ?? 98}%
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">GCS Score</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                {caseRecord.vitals?.gcs || 15}/15
              </span>
            </div>
          </div>

          {/* Stat Resuscitation & Emergency Orders */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">Active Resuscitation & Stabilization Orders:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={highFlowO2}
                  onChange={(e) => setHighFlowO2(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-semibold text-slate-800">High-Flow O2 (15L Non-Rebreather)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={ivFluids}
                  onChange={(e) => setIvFluids(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-semibold text-slate-800">1000mL Ringer's Lactate / NS Bolus</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={statLabs}
                  onChange={(e) => setStatLabs(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-semibold text-slate-800">Stat Trauma Labs (ABG, CBC, LFT/RFT)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={bloodCrossmatch}
                  onChange={(e) => setBloodCrossmatch(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-semibold text-slate-800">Emergency Blood Bank Crossmatch (2u PRBC)</span>
              </label>
            </div>
          </div>

          {/* Clinician Notes */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800 text-[11px]">Emergency Clinician Log & Resuscitation Notes:</label>
            <textarea
              rows={3}
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-rose-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
            />
          </div>

          {/* Disposition & Status Escalation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Clinical ER Status</label>
              <select
                value={triageStatus}
                onChange={(e) => setTriageStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-semibold text-slate-900"
              >
                <option value="In Trauma Bay">In Trauma Bay (Active Care)</option>
                <option value="Triaged">Triaged (Awaiting Resus)</option>
                <option value="Admitted to ICU">Admitted to ICU / Critical Care</option>
                <option value="Transferred to OT">Transferred to Emergency OT (Surgery)</option>
                <option value="Admitted to Ward">Admitted to General Inpatient Ward</option>
                <option value="Discharged">Stabilized & Discharged</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Active Bed / Bay</label>
              <input
                type="text"
                value={traumaBay}
                onChange={(e) => setTraumaBay(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-mono font-semibold"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update Case & Save Orders</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
