import React, { useState } from 'react';
import {
  X,
  Scissors,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface ScheduleSurgeryModalProps {
  onClose: () => void;
}

export const ScheduleSurgeryModal: React.FC<ScheduleSurgeryModalProps> = ({ onClose }) => {
  const { patients = [], createSurgerySchedule, currentUser } = useHospital();

  const [patientMrn, setPatientMrn] = useState(patients[0]?.mrn || 'FPH-2025-0101');
  const [procedureName, setProcedureName] = useState('Laparoscopic Cholecystectomy');
  const [preOpDiagnosis, setPreOpDiagnosis] = useState('Symptomatic Cholelithiasis with Biliary Colic');
  const [operatingTheatre, setOperatingTheatre] = useState('OR-1 (Main General & Orthopedic Suite)');
  const [leadSurgeon, setLeadSurgeon] = useState(currentUser.name || 'Dr. Michael Assefa, MD, FACS');
  const [anaesthetist, setAnaesthetist] = useState('Dr. Yared Getachew, MD (Senior Anesthesiologist)');
  const [anesthesiaType, setAnesthesiaType] = useState('General Anesthesia');
  const [asaGrade, setAsaGrade] = useState<'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA E (Emergency)'>('ASA II');
  const [scheduledDateTime, setScheduledDateTime] = useState(
    `${new Date().toISOString().split('T')[0]} 09:00`
  );
  const [surgicalNotes, setSurgicalNotes] = useState('Pre-operative workup complete. Consent verified, crossmatched blood standby.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPat = patients.find((p) => p.mrn === patientMrn);
    const patName = selectedPat ? `${selectedPat.firstName} ${selectedPat.lastName}` : 'Patient';

    createSurgerySchedule({
      mrn: patientMrn,
      patientName: patName,
      procedureName,
      preOpDiagnosis,
      operatingTheatre,
      leadSurgeon,
      assistantSurgeon: 'Dr. Nahom Zewdu, MD',
      anaesthetist,
      anesthesiaType,
      asaGrade,
      scrubNurse: 'Sister Roman Alemu, RN',
      circulatingNurse: 'Nurse Tigist Mengistu, RN',
      scheduledDateTime,
      status: 'Scheduled',
      surgicalNotes,
      postOpPlan: 'PACU recovery for 2h then transfer to Ward.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Schedule Operating Theater Case
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Book theater suite, assign surgical & anesthesia teams, and record ASA classification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Select Patient *</label>
              <select
                value={patientMrn}
                onChange={(e) => setPatientMrn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.mrn} value={p.mrn}>
                    {p.firstName} {p.lastName} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Target Operating Suite *</label>
              <select
                value={operatingTheatre}
                onChange={(e) => setOperatingTheatre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-semibold"
              >
                <option value="OR-1 (Main General & Orthopedic Suite)">OR-1 (Main General & Ortho)</option>
                <option value="OR-2 (Laparoscopic & Endoscopy Suite)">OR-2 (Laparoscopic & Endo)</option>
                <option value="OR-3 (Maternity & Emergency Suite)">OR-3 (Maternity & Emergency)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Planned Surgical Procedure *</label>
            <input
              type="text"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Pre-Operative Diagnosis</label>
            <input
              type="text"
              value={preOpDiagnosis}
              onChange={(e) => setPreOpDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Lead Consultant Surgeon *</label>
              <input
                type="text"
                value={leadSurgeon}
                onChange={(e) => setLeadSurgeon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Anesthesiologist *</label>
              <input
                type="text"
                value={anaesthetist}
                onChange={(e) => setAnaesthetist(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Anesthesia Modality</label>
              <select
                value={anesthesiaType}
                onChange={(e) => setAnesthesiaType(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-medium"
              >
                <option value="General Anesthesia">General Anesthesia</option>
                <option value="Spinal Block">Spinal Block</option>
                <option value="Epidural">Epidural</option>
                <option value="Local with Sedation">Local with Sedation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">ASA Physical Grade</label>
              <select
                value={asaGrade}
                onChange={(e) => setAsaGrade(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-bold"
              >
                <option value="ASA I">ASA I</option>
                <option value="ASA II">ASA II</option>
                <option value="ASA III">ASA III</option>
                <option value="ASA IV">ASA IV</option>
                <option value="ASA E (Emergency)">ASA E (Emergency)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Pre-op Notes & Standby Blood Units</label>
            <input
              type="text"
              value={surgicalNotes}
              onChange={(e) => setSurgicalNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
            />
          </div>

          {/* Footer */}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Book Suite</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
