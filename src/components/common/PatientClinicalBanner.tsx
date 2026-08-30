import React from 'react';
import {
  AlertTriangle,
  Droplet,
  Printer
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface PatientClinicalBannerProps {
  onOpenPatientCard?: (patient: any) => void;
}

export const PatientClinicalBanner: React.FC<PatientClinicalBannerProps> = ({ onOpenPatientCard }) => {
  const { patients, selectedPatientMrn, setSelectedPatientMrn, getPatientByMrn } = useHospital();

  const patient = selectedPatientMrn ? getPatientByMrn(selectedPatientMrn) : patients[0];

  if (!patient) return null;

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const hasAllergies = patient.allergies && patient.allergies.length > 0;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          
          {/* Patient Details */}
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={patient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt={patient.firstName}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </span>
                <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                  {patient.mrn}
                </span>
                <span className="text-slate-500">
                  {patient.gender}, {getAge(patient.dob)} yrs
                </span>
                {patient.bloodGroup && (
                  <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded text-[11px]">
                    <Droplet className="w-2.5 h-2.5 fill-rose-500" />
                    {patient.bloodGroup}
                  </span>
                )}
                {hasAllergies ? (
                  <span className="flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded text-[11px]">
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                    Allergies: {patient.allergies?.join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    No allergies
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Patient Actions & Quick Switch */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-slate-500 text-[11px]">
              Station: <strong className="text-emerald-700">{patient.activeStation || 'Reception'}</strong>
            </span>

            {onOpenPatientCard && (
              <button
                onClick={() => onOpenPatientCard(patient)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                title="Print Patient Card"
              >
                <Printer className="w-3 h-3 text-slate-500" />
                <span>Card</span>
              </button>
            )}

            <select
              value={patient.mrn}
              onChange={(e) => setSelectedPatientMrn(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded px-2 py-1 outline-hidden cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.mrn} value={p.mrn}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
};
