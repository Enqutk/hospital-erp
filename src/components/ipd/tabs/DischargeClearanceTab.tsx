import React from 'react';
import {
  CheckCircle,
  LogOut,
  User,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { IPDAdmission } from '../../../types';

interface DischargeClearanceTabProps {
  ipdAdmissions: IPDAdmission[];
  onUpdateDischargeChecklist: (admissionId: string, checklist: Partial<IPDAdmission['dischargeChecklistStatus']>) => void;
  onFinalizeDischarge: (admissionId: string, disposition: IPDAdmission['dischargeDisposition']) => void;
}

export const DischargeClearanceTab: React.FC<DischargeClearanceTabProps> = ({
  ipdAdmissions,
  onUpdateDischargeChecklist,
  onFinalizeDischarge
}) => {
  const activeAdmissions = ipdAdmissions.filter((a) => a.status === 'Active');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>4-Department Discharge Clearance Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify clinical, pharmacy, billing settlement, and nursing sign-offs prior to releasing inpatient beds.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {activeAdmissions.length} Inpatients
          </span>
        </div>

        {/* Clearances List */}
        <div className="space-y-3.5 pt-1">
          {activeAdmissions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No active inpatients currently requiring discharge clearances.
            </div>
          ) : (
            activeAdmissions.map((adm) => {
              const isClearedAll =
                adm.dischargeChecklistStatus.clinicalClearance &&
                adm.dischargeChecklistStatus.pharmacyClearance &&
                adm.dischargeChecklistStatus.billingClearance &&
                adm.dischargeChecklistStatus.nursingClearance;

              const clearedCount =
                (adm.dischargeChecklistStatus.clinicalClearance ? 1 : 0) +
                (adm.dischargeChecklistStatus.pharmacyClearance ? 1 : 0) +
                (adm.dischargeChecklistStatus.billingClearance ? 1 : 0) +
                (adm.dischargeChecklistStatus.nursingClearance ? 1 : 0);

              return (
                <div
                  key={adm.admissionId}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    isClearedAll
                      ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{adm.patientName}</span>
                        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200">
                          {adm.bedNumber} ({adm.wardName})
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 font-medium">MRN: {adm.mrn}</span>
                      </div>
                      <div className="text-slate-700 text-xs mt-1">
                        <span className="text-slate-500">Diagnosis:</span> <strong>{adm.diagnosis}</strong>
                      </div>
                    </div>

                    <div>
                      {isClearedAll ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ready for Discharge (4/4)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-900 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300 text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Clearances in Progress ({clearedCount}/4)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Department Checklist Badges / Toggles */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                        <input
                          type="checkbox"
                          checked={adm.dischargeChecklistStatus.clinicalClearance}
                          onChange={(e) =>
                            onUpdateDischargeChecklist(adm.admissionId, { clinicalClearance: e.target.checked })
                          }
                          className="rounded text-slate-900 focus:ring-slate-500 w-4 h-4"
                        />
                        <span className="font-semibold text-xs text-slate-800">1. Doctor Sign-off</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                        <input
                          type="checkbox"
                          checked={adm.dischargeChecklistStatus.pharmacyClearance}
                          onChange={(e) =>
                            onUpdateDischargeChecklist(adm.admissionId, { pharmacyClearance: e.target.checked })
                          }
                          className="rounded text-slate-900 focus:ring-slate-500 w-4 h-4"
                        />
                        <span className="font-semibold text-xs text-slate-800">2. Pharmacy Return</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                        <input
                          type="checkbox"
                          checked={adm.dischargeChecklistStatus.billingClearance}
                          onChange={(e) =>
                            onUpdateDischargeChecklist(adm.admissionId, { billingClearance: e.target.checked })
                          }
                          className="rounded text-slate-900 focus:ring-slate-500 w-4 h-4"
                        />
                        <span className="font-semibold text-xs text-slate-800">3. Cashier Billing</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                        <input
                          type="checkbox"
                          checked={adm.dischargeChecklistStatus.nursingClearance}
                          onChange={(e) =>
                            onUpdateDischargeChecklist(adm.admissionId, { nursingClearance: e.target.checked })
                          }
                          className="rounded text-slate-900 focus:ring-slate-500 w-4 h-4"
                        />
                        <span className="font-semibold text-xs text-slate-800">4. Nursing Release</span>
                      </label>
                    </div>

                    {/* Finalize Action */}
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500">
                        Admitted by <strong className="text-slate-700">{adm.admittingClinician}</strong> on {adm.admissionDateTime}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          id={`disp-${adm.admissionId}`}
                          defaultValue="Recovered / Home"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                        >
                          <option value="Recovered / Home">Recovered / Discharged Home</option>
                          <option value="Referred to Tertiary">Referred to Tertiary Hospital</option>
                          <option value="Against Medical Advice">Discharged Against Medical Advice</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const sel = (document.getElementById(`disp-${adm.admissionId}`) as HTMLSelectElement)?.value as any;
                            onFinalizeDischarge(adm.admissionId, sel || 'Recovered / Home');
                          }}
                          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer text-xs shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Finalize Discharge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
