import React, { useState } from 'react';
import {
  X,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
  User,
  HeartPulse,
  Activity,
  ArrowRight
} from 'lucide-react';
import { SurgicalProcedure } from '../../types';

interface SurgeryCaseDetailModalProps {
  surgery: SurgicalProcedure | null;
  onClose: () => void;
  onUpdateStatus: (surgeryId: string, status: SurgicalProcedure['status']) => void;
}

export const SurgeryCaseDetailModal: React.FC<SurgeryCaseDetailModalProps> = ({
  surgery,
  onClose,
  onUpdateStatus
}) => {
  if (!surgery) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WHO' | 'PACU'>('OVERVIEW');
  const [currentStatus, setCurrentStatus] = useState<SurgicalProcedure['status']>(surgery.status);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(surgery.surgeryId, currentStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Operative Report & Case Record
                </h3>
                <span className="font-mono text-[11px] bg-white text-indigo-900 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                  {surgery.surgeryId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-slate-800">{surgery.patientName}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-600">{surgery.mrn}</span>
                <span className="text-slate-300">•</span>
                <span>{surgery.operatingTheatre || surgery.targetOperatingRoom}</span>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/50 gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'OVERVIEW'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Operative Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WHO')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'WHO'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            WHO Safety Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PACU')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'PACU'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            PACU & Post-Op Plan
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    {surgery.procedureName || surgery.surgicalProcedureName}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {surgery.asaGrade || 'ASA II'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Pre-Operative Diagnosis: <strong>{surgery.preOpDiagnosis}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  Scheduled / Incision: <strong>{surgery.scheduledDateTime}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Surgical Team</span>
                  <div className="font-bold text-slate-900 mt-1">{surgery.leadSurgeon}</div>
                  <div className="text-[11px] text-slate-600">Assistant: {surgery.assistantSurgeon || 'Dr. Nahom Zewdu, MD'}</div>
                  <div className="text-[11px] text-slate-600">Scrub Nurse: {surgery.scrubNurse || 'Sister Roman Alemu, RN'}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Anesthesia Team</span>
                  <div className="font-bold text-slate-900 mt-1">{surgery.anaesthetist || surgery.anesthesiologistName}</div>
                  <div className="text-[11px] text-slate-600">Technique: <strong>{surgery.anesthesiaType}</strong></div>
                  <div className="text-[11px] text-slate-600">Circulator: {surgery.circulatingNurse || 'Nurse Tigist Mengistu, RN'}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-[11px]">Intraoperative Surgical Notes & Findings:</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs">
                  {surgery.surgicalNotes || 'Laparoscopic entry via Hasson technique. Gallbladder identified with multiple faceted stones. Calot triangle dissected, cystic duct and artery clipped and divided. Hemostasis secured. Specimen retrieved via Endobag.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WHO' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>WHO Surgical Safety Protocol Verified</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  All 3 phases (Sign-In, Time-Out, Sign-Out) completed by the surgical team in accordance with FPH Patient Safety Guidelines.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PACU' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-900 text-xs">Post-Anesthesia Recovery Plan</div>
                <div className="text-slate-700 text-xs">
                  {surgery.postOpPlan || 'Monitor in PACU for minimum 2 hours. Assess Aldrete score q15m. Target score >= 9 prior to ward transfer.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-950 block">Aldrete Recovery Score</span>
                  <div className="font-mono font-black text-amber-900 text-lg mt-0.5">9 / 10</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-950 block">Target Transfer</span>
                  <div className="font-semibold text-amber-950 text-xs mt-1">Surgical Inpatient Ward</div>
                </div>
              </div>
            </div>
          )}

          {/* Status Changer */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-800 mb-1">Update Case Status</label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-bold text-slate-900"
            >
              <option value="Scheduled">Scheduled (Pre-Op Prep)</option>
              <option value="In Progress">In Progress (Intraoperative Incision)</option>
              <option value="PACU Recovery">PACU Recovery (Aldrete Monitoring)</option>
              <option value="Completed">Completed & Transferred to Ward</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Close
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Update Case</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
