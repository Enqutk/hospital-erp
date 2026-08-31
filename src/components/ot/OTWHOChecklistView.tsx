import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  UserCheck,
  Clock,
  Printer
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const OTWHOChecklistView: React.FC = () => {
  const { surgeries = [], updateWhoChecklist } = useHospital();
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>(surgeries[0]?.surgeryId || '');

  const activeSurgery = surgeries.find((s) => s.surgeryId === selectedSurgeryId) || surgeries[0];

  const [signInChecks, setSignInChecks] = useState({
    identitySiteProcedure: true,
    siteMarked: true,
    anesthesiaCheckComplete: true,
    pulseOximeterFunctioning: true,
    knownAllergyChecked: true,
    difficultAirwayEvaluated: true,
    bloodLossRiskAssessed: true
  });

  const [timeOutChecks, setTimeOutChecks] = useState({
    teamMembersIntroduced: true,
    surgeonReviewCriticalSteps: true,
    anesthesiaReviewConcerns: true,
    nursingSterilityConfirmed: true,
    antibioticProphylaxisGiven: true,
    essentialImagingDisplayed: true
  });

  const [signOutChecks, setSignOutChecks] = useState({
    procedureRecordedConfirmed: true,
    instrumentSpongeNeedleCountsCorrect: true,
    specimenLabelledCorrectly: true,
    equipmentProblemsIdentified: false,
    keyRecoveryConcernsReviewed: true
  });

  return (
    <div className="space-y-4 text-xs">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">WHO Surgical Safety Checklist Protocol</h2>
            <p className="text-slate-500 text-[11px]">
              Standardized 3-phase patient safety protocol: Sign-In before induction, Time-Out before incision, Sign-Out before closure
            </p>
          </div>
        </div>

        {/* Case selector */}
        <select
          value={selectedSurgeryId}
          onChange={(e) => setSelectedSurgeryId(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold cursor-pointer"
        >
          {surgeries.map((s) => (
            <option key={s.surgeryId} value={s.surgeryId}>
              {s.surgeryId} - {s.patientName} ({s.procedureName || s.surgicalProcedureName})
            </option>
          ))}
        </select>
      </div>

      {/* 3-Phase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Phase 1: SIGN IN (Before Induction) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="font-bold text-slate-900 text-xs">SIGN IN</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Before Induction</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'identitySiteProcedure', label: 'Patient confirmed identity, site & consent' },
              { id: 'siteMarked', label: 'Surgical incision site marked / Not applicable' },
              { id: 'anesthesiaCheckComplete', label: 'Anesthesia safety check completed' },
              { id: 'pulseOximeterFunctioning', label: 'Pulse oximeter on patient & functioning' },
              { id: 'knownAllergyChecked', label: 'Known allergies checked & verified' },
              { id: 'difficultAirwayEvaluated', label: 'Difficult airway / aspiration risk evaluated' },
              { id: 'bloodLossRiskAssessed', label: 'Risk of >500ml blood loss assessed (access/fluids ready)' }
            ].map((chk) => (
              <label key={chk.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(signInChecks as any)[chk.id]}
                  onChange={(e) => setSignInChecks({ ...signInChecks, [chk.id]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <span className="text-slate-700 font-medium text-[11px] leading-tight">{chk.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phase 2: TIME OUT (Before Skin Incision) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="font-bold text-slate-900 text-xs">TIME OUT</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Before Skin Incision</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'teamMembersIntroduced', label: 'All team members introduced by name & role' },
              { id: 'surgeonReviewCriticalSteps', label: 'Surgeon reviews: critical steps, duration & blood loss' },
              { id: 'anesthesiaReviewConcerns', label: 'Anesthesia reviews: patient-specific concerns' },
              { id: 'nursingSterilityConfirmed', label: 'Nursing confirms: sterility indicators & equipment' },
              { id: 'antibioticProphylaxisGiven', label: 'Antibiotic prophylaxis administered within 60 mins' },
              { id: 'essentialImagingDisplayed', label: 'Essential PACS imaging correctly displayed' }
            ].map((chk) => (
              <label key={chk.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(timeOutChecks as any)[chk.id]}
                  onChange={(e) => setTimeOutChecks({ ...timeOutChecks, [chk.id]: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded mt-0.5"
                />
                <span className="text-slate-700 font-medium text-[11px] leading-tight">{chk.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phase 3: SIGN OUT (Before Leaving Room) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="font-bold text-slate-900 text-xs">SIGN OUT</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Before Wound Closure</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'procedureRecordedConfirmed', label: 'Name of procedure recorded & confirmed' },
              { id: 'instrumentSpongeNeedleCountsCorrect', label: 'Instrument, sponge & needle counts correct' },
              { id: 'specimenLabelledCorrectly', label: 'Surgical specimen labelled correctly (Patient & MRN)' },
              { id: 'equipmentProblemsIdentified', label: 'Any equipment problems to be addressed' },
              { id: 'keyRecoveryConcernsReviewed', label: 'Surgeon, anesthesia & nurse review PACU recovery plan' }
            ].map((chk) => (
              <label key={chk.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(signOutChecks as any)[chk.id]}
                  onChange={(e) => setSignOutChecks({ ...signOutChecks, [chk.id]: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                />
                <span className="text-slate-700 font-medium text-[11px] leading-tight">{chk.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
