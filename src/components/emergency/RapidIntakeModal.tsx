import React, { useState } from 'react';
import { X, Flame, AlertOctagon, HeartPulse, Zap } from 'lucide-react';
import { Patient, EmergencyRecord, TriageLevel, Vitals } from '../../types';

interface RapidIntakeModalProps {
  patients: Patient[];
  onClose: () => void;
  onIntake: (data: Omit<EmergencyRecord, 'emergencyId' | 'arrivedAt'>) => void;
}

export const RapidIntakeModal: React.FC<RapidIntakeModalProps> = ({
  patients,
  onClose,
  onIntake
}) => {
  const [selectedMrn, setSelectedMrn] = useState<string>(patients[0]?.mrn || 'FPH-2025-0101');
  const [isUnregisteredVictim, setIsUnregisteredVictim] = useState<boolean>(false);
  const [unidentifiedName, setUnidentifiedName] = useState<string>('Unidentified Trauma Patient (Male ~35yo)');
  const [presentingComplaint, setPresentingComplaint] = useState<string>('Polytrauma / Road traffic accident with suspected head injury & shock');
  const [activeTraumaBay, setActiveTraumaBay] = useState<EmergencyRecord['activeTraumaBay']>('Resus Bay 1');
  const [attendingStaff, setAttendingStaff] = useState<string>('Dr. Yonas Alemayehu (ER Lead)');

  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 88,
    bpDiastolic: 54,
    heartRate: 128,
    respRate: 28,
    tempCelsius: 36.6,
    spO2: 89,
    gcsScore: 10
  });

  // Calculate Automated Triage Level based on clinical criteria
  const calculateTriageLevel = (): { level: TriageLevel; reason: string } => {
    if (vitals.gcsScore && vitals.gcsScore <= 9) {
      return { level: 'RED', reason: 'Critical Coma / Altered Mental Status (GCS ≤ 9)' };
    }
    if (vitals.spO2 < 90 || vitals.bpSystolic < 90 || vitals.heartRate > 130) {
      return { level: 'RED', reason: 'Hemodynamic shock / Critical Hypoxia (SpO2 < 90% or SBP < 90)' };
    }
    if (vitals.spO2 < 94 || vitals.heartRate > 110 || vitals.respRate > 24 || vitals.tempCelsius > 39.0) {
      return { level: 'YELLOW', reason: 'Emergent condition / Marked physiological distress' };
    }
    if (vitals.spO2 >= 95 && vitals.bpSystolic >= 100 && vitals.heartRate <= 100) {
      return { level: 'GREEN', reason: 'Non-urgent stable vitals / Standard outpatient fast-track' };
    }
    return { level: 'YELLOW', reason: 'Borderline clinical status requiring bay observation' };
  };

  const triageResult = calculateTriageLevel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let mrn = selectedMrn;
    let patientName = '';

    if (isUnregisteredVictim) {
      mrn = `ER-UNID-${Math.floor(1000 + Math.random() * 9000)}`;
      patientName = unidentifiedName.trim() || 'Unidentified Trauma Patient';
    } else {
      const p = patients.find((pat) => pat.mrn === selectedMrn);
      patientName = p ? `${p.firstName} ${p.lastName}` : 'Emergency Patient';
    }

    onIntake({
      mrn,
      patientName,
      triageLevel: triageResult.level,
      presentingComplaint: presentingComplaint.trim(),
      criticalVitals: vitals,
      activeTraumaBay,
      attendingStaff: attendingStaff.trim(),
      triageScoreReason: triageResult.reason,
      status: triageResult.level === 'RED' ? 'In Trauma Bay' : 'Triaged'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rapid Emergency Intake & Triage</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated clinical scoring engine (GCS, Vitals, SpO2) and trauma bay bed assignment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Patient Selection Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Patient Identification</label>
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isUnregisteredVictim}
                  onChange={(e) => setIsUnregisteredVictim(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Unidentified / John Doe Emergency Victim</span>
              </label>
            </div>

            {!isUnregisteredVictim ? (
              <div>
                <select
                  value={selectedMrn}
                  onChange={(e) => setSelectedMrn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.mrn} value={p.mrn}>
                      {p.firstName} {p.lastName} ({p.mrn}) — Blood: {p.bloodGroup || 'O+'} — Payer: {p.payerClass.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unidentified Trauma Male ~30yo"
                  value={unidentifiedName}
                  onChange={(e) => setUnidentifiedName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Bay Assignment & Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Active Trauma Bay Assignment <span className="text-rose-600">*</span>
              </label>
              <select
                value={activeTraumaBay}
                onChange={(e) => setActiveTraumaBay(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="Resus Bay 1">Resus Bay 1 (Critical Red)</option>
                <option value="Resus Bay 2">Resus Bay 2 (Critical Red)</option>
                <option value="Trauma Bay 1">Trauma Bay 1 (Major Trauma)</option>
                <option value="Trauma Bay 2">Trauma Bay 2 (Medical Emergency)</option>
                <option value="Observation A">Observation A (Green Fast-Track)</option>
                <option value="Observation B">Observation B (Observation Unit)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Attending Clinician / Nurse <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={attendingStaff}
                onChange={(e) => setAttendingStaff(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Mechanism of Injury / Chief Complaint */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Presenting Complaint / Trauma Mechanism <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={presentingComplaint}
              onChange={(e) => setPresentingComplaint(e.target.value)}
              placeholder="Describe mechanism, airway status, visible hemorrhages, pain level..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Clinical Parameters for Automated Triage Engine */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                Critical Intake Vitals & Triage Parameters
              </span>
              <span className="text-[11px] text-slate-500">Ethiopian MoH Protocol</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500">GCS (3-15)</span>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={vitals.gcsScore || 15}
                  onChange={(e) => setVitals({ ...vitals, gcsScore: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">BP Sys</span>
                <input
                  type="number"
                  value={vitals.bpSystolic}
                  onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">BP Dia</span>
                <input
                  type="number"
                  value={vitals.bpDiastolic}
                  onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">Heart Rate</span>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">Resp Rate</span>
                <input
                  type="number"
                  value={vitals.respRate}
                  onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">SpO2 (%)</span>
                <input
                  type="number"
                  value={vitals.spO2}
                  onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">
                  Calculated Triage: Code {triageResult.level}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {triageResult.reason}
                </div>
              </div>

              <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                triageResult.level === 'RED'
                  ? 'bg-rose-900 text-white'
                  : triageResult.level === 'YELLOW'
                  ? 'bg-amber-700 text-white'
                  : 'bg-emerald-800 text-white'
              }`}>
                CODE {triageResult.level}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium cursor-pointer"
            >
              Register & Assign Bay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
