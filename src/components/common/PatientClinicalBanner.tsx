import React from 'react';
import {
  AlertTriangle,
  Droplet,
  Printer,
  ChevronDown,
  User,
  ShieldAlert,
  Clock
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
  const fullName = `${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim();

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          
          {/* Left: Patient Identity & Clinical Indicators */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={patient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                alt={patient.firstName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[280px]" title={fullName}>
                  {fullName}
                </span>
                
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                  {patient.mrn}
                </span>

                <span className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80">
                  {patient.gender} • {getAge(patient.dob)} yrs
                </span>

                {patient.bloodGroup && (
                  <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" />
                    {patient.bloodGroup}
                  </span>
                )}

                {hasAllergies ? (
                  <span className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-[11px]" title={patient.allergies?.join(', ')}>
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate max-w-[180px]">Allergies: {patient.allergies?.join(', ')}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    No Known Allergies
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Station Status & Patient Quick Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Active Station Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-emerald-700">Station:</span>
              <span className="text-[11px] font-bold">{patient.activeStation || 'Reception'}</span>
            </div>

            {/* Print Card Button */}
            {onOpenPatientCard && (
              <button
                onClick={() => onOpenPatientCard(patient)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-xs shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                title="Print Patient ID Card"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Card</span>
              </button>
            )}

            {/* Quick Switch Dropdown */}
            <div className="relative">
              <select
                value={patient.mrn}
                onChange={(e) => setSelectedPatientMrn(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1 focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer transition-colors max-w-[210px] truncate"
                title="Switch Active Patient"
              >
                {patients.map((p) => (
                  <option key={p.mrn} value={p.mrn}>
                    {p.firstName} {p.lastName} ({p.mrn})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
