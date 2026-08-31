import React, { useState } from 'react';
import {
  Baby,
  Plus,
  Droplets,
  ShieldCheck,
  User,
  Heart,
  Eye,
  Activity
} from 'lucide-react';
import { IPDAdmission, Patient, WardCode } from '../../../types';
import { getPatientAge, calculatePediatricFluids } from '../types';

interface PediatricsTabProps {
  ipdAdmissions: IPDAdmission[];
  patients: Patient[];
  onOpenDirectAdmit: (wardCode: WardCode, bedNumber?: string) => void;
  onOpenChart: (admission: IPDAdmission) => void;
}

export const PediatricsTab: React.FC<PediatricsTabProps> = ({
  ipdAdmissions,
  patients,
  onOpenDirectAdmit,
  onOpenChart
}) => {
  const [pedWeight, setPedWeight] = useState<number>(19.5);

  const pediatricAdmissions = ipdAdmissions.filter(
    (a) => a.wardCode === 'PEDIATRICS' && a.status === 'Active'
  );

  const { dailyMl, hourlyMl } = calculatePediatricFluids(pedWeight);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Baby className="w-4 h-4 text-blue-600" />
              <span>Pediatric & Child Inpatient Care Unit (Ward 03)</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {pediatricAdmissions.length} Admitted Children
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated pediatric unit management with bedside guardian oversight and fluid maintenance tools.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenDirectAdmit('PEDIATRICS')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Child Patient</span>
          </button>
        </div>

        {/* 2-Column: Child Inpatients List & Fluid Calculator Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Child Inpatients Cards */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Child Inpatient Roster
            </h3>

            {pediatricAdmissions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No pediatric patients currently admitted in Ward 03.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pediatricAdmissions.map((adm) => {
                  const pt = patients.find((p) => p.mrn === adm.mrn);
                  const ageStr = pt ? getPatientAge(pt.dob) : 'Child';

                  return (
                    <div
                      key={adm.admissionId}
                      className="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {adm.patientName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {ageStr} • <span className="font-mono font-bold text-slate-800">Bed {adm.bedNumber}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Inpatient
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="text-slate-700 font-medium line-clamp-2">
                          <span className="text-slate-500 font-normal">Diagnosis:</span> {adm.diagnosis}
                        </div>
                        <div className="text-slate-600 text-[11px] flex items-center gap-1.5 pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Guardian: <strong>{pt?.emergencyContactName || 'Mother Present'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {adm.admittingClinician.split(',')[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenChart(adm)}
                          className="font-bold text-slate-900 hover:text-slate-700 underline text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Chart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Interactive Pediatric IV Fluid Calculator */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pediatric Clinical Tools
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>IV Fluid Rate Calculator</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Holliday-Segar
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1.5">
                  Child Weight (kg):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="0.5"
                    value={pedWeight}
                    onChange={(e) => setPedWeight(parseFloat(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <span className="w-14 px-2 py-1 border border-slate-300 rounded-lg text-xs text-center font-bold text-slate-900 bg-white shadow-2xs">
                    {pedWeight} kg
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Hourly Infusion:</span>
                  <span className="font-mono font-bold text-sm text-slate-900 bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    {hourlyMl} mL/hr
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">24h Total Volume:</span>
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {dailyMl} mL/day
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standard maintenance fluid guideline for pediatric replenishment under continuous monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
