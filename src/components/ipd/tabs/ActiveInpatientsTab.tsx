import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Stethoscope,
  ArrowRightLeft,
  Baby,
  Building,
  User,
  Clock,
  Eye
} from 'lucide-react';
import { IPDAdmission, Patient, WardCode } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface ActiveInpatientsTabProps {
  ipdAdmissions: IPDAdmission[];
  patients: Patient[];
  onOpenChart: (admission: IPDAdmission) => void;
  onOpenTransferModal: (admission: IPDAdmission) => void;
}

export const ActiveInpatientsTab: React.FC<ActiveInpatientsTabProps> = ({
  ipdAdmissions,
  patients,
  onOpenChart,
  onOpenTransferModal
}) => {
  const [selectedWard, setSelectedWard] = useState<WardCode | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const activeAdmissions = ipdAdmissions.filter((a) => a.status === 'Active');

  const filteredAdmissions = activeAdmissions.filter((adm) => {
    const matchesWard = selectedWard === 'ALL' || adm.wardCode === selectedWard;
    const matchesSearch =
      searchTerm === '' ||
      adm.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.admittingClinician.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesWard && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <span>Active Inpatient Roster</span>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeAdmissions.length} Admitted Patients
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current inpatients occupying hospital beds across general and specialty wards.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedWard('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedWard === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Wards ({activeAdmissions.length})
            </button>
            {WARDS_LIST.map((w) => {
              const count = activeAdmissions.filter((a) => a.wardCode === w.code).length;
              return (
                <button
                  key={w.code}
                  type="button"
                  onClick={() => setSelectedWard(w.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    selectedWard === w.code
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{w.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedWard === w.code ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, bed, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Clean Patient Cards List */}
        <div className="space-y-2.5 pt-2">
          {filteredAdmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-600">No Active Inpatients Found</div>
              <p className="text-[11px] text-slate-400">There are no inpatients matching your current search or filter.</p>
            </div>
          ) : (
            filteredAdmissions.map((adm) => {
              const pt = patients.find((p) => p.mrn === adm.mrn);
              const ageStr = pt ? getPatientAge(pt?.dob) : 'Adult';
              const isChild = adm.wardCode === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt?.dob), 10) < 15);

              return (
                <div
                  key={adm.admissionId}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Patient and Bed Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isChild ? 'bg-blue-100 text-blue-800' : 'bg-slate-900 text-white'
                      }`}
                    >
                      {isChild ? <Baby className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {adm.patientName}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Bed {adm.bedNumber} ({adm.wardName})
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 font-medium">
                          MRN: {adm.mrn}
                        </span>
                        {isChild && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Child Inpatient
                          </span>
                        )}
                      </div>

                      <div className="text-slate-700 text-xs line-clamp-1 font-medium">
                        <span className="text-slate-500 font-normal">Diagnosis:</span> {adm.diagnosis}
                      </div>

                      <div className="text-slate-500 text-[11px] flex items-center gap-3 flex-wrap">
                        <span>Admitted on: <strong>{adm.admissionDateTime}</strong></span>
                        <span>•</span>
                        <span>Clinician: <strong>{adm.admittingClinician.split(',')[0]}</strong></span>
                        {pt?.emergencyContactName && (
                          <>
                            <span>•</span>
                            <span>Contact: {pt.emergencyContactName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => onOpenTransferModal(adm)}
                      className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                      <span>Transfer Bed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChart(adm)}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>View Clinical Chart</span>
                    </button>
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
