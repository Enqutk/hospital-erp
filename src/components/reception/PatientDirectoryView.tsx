import React, { useState } from 'react';
import {
  Search,
  Plus,
  Printer,
  Send,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  CreditCard,
  Building,
  UserCheck,
  Stethoscope,
  Filter
} from 'lucide-react';
import { Patient, OPDQueueItem } from '../../types';
import { calculateAge } from '../../utils/opdRouting';

interface PatientDirectoryViewProps {
  patients: Patient[];
  opdQueue: OPDQueueItem[];
  onSelectPatient: (mrn: string) => void;
  onOpenRegisterModal: () => void;
  onOpenDispatchModal: (patient: Patient) => void;
  onOpenPrintCard: (patient: Patient) => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  patients,
  opdQueue,
  onSelectPatient,
  onOpenRegisterModal,
  onOpenDispatchModal,
  onOpenPrintCard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payerFilter, setPayerFilter] = useState('ALL');

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
    const matchesSearch =
      query === '' ||
      p.mrn.toLowerCase().includes(query) ||
      fullName.includes(query) ||
      p.phone.includes(query) ||
      p.nationalId.toLowerCase().includes(query);

    const matchesPayer = payerFilter === 'ALL' || p.payerClass.toLowerCase().includes(payerFilter.toLowerCase());
    return matchesSearch && matchesPayer;
  });

  const getPayerBadge = (payerClass: string) => {
    const lower = payerClass.toLowerCase();
    if (lower.includes('cbhi')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
          CBHI
        </span>
      );
    }
    if (lower.includes('cash')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          Cash (Self-Pay)
        </span>
      );
    }
    if (lower.includes('corp') || lower.includes('company')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
          Corporate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/80">
        Private / Insured
      </span>
    );
  };

  const payerCounts = {
    ALL: patients.length,
    CBHI: patients.filter((p) => p.payerClass.toLowerCase().includes('cbhi')).length,
    Cash: patients.filter((p) => p.payerClass.toLowerCase().includes('cash')).length,
    Corporate: patients.filter((p) => p.payerClass.toLowerCase().includes('corp')).length,
    Private: patients.filter((p) => p.payerClass.toLowerCase().includes('priv') || p.payerClass.toLowerCase().includes('insur')).length,
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Master Patient Index</span>
                <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {filteredPatients.length} of {patients.length} records
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Search, triage, and route registered patients to clinical consultation rooms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

        {/* Search input & Payer Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, phone number, or national ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto text-xs">
            {(['ALL', 'CBHI', 'Cash', 'Corporate', 'Private'] as const).map((payer) => (
              <button
                key={payer}
                type="button"
                onClick={() => setPayerFilter(payer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  payerFilter === payer
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{payer === 'ALL' ? 'All Payers' : payer}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  payerFilter === payer ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {payerCounts[payer] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table / List View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-600">No matching patient records found</div>
            <div className="text-[11px] text-slate-400">Try adjusting your search criteria or register a new patient</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Profile & MRN</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Payer & Policy</th>
                  <th className="py-3 px-4">Phone & National ID</th>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredPatients.map((p) => {
                  const age = calculateAge(p.dob);
                  const queueEntry = (opdQueue || []).find(
                    (q) => q.mrn === p.mrn && (q.status === 'Waiting' || q.status === 'In Consultation' || q.status === 'Results Ready' || q.status === 'Awaiting Lab/Radiology')
                  );
                  const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim();

                  return (
                    <tr
                      key={p.mrn}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(p.mrn)}
                    >
                      {/* Name & MRN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[200px]" title={fullName}>
                              {fullName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {p.mrn}
                              </span>
                              {p.bloodGroup && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/60">
                                  {p.bloodGroup}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">
                          {p.gender}, {age} yrs
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          DOB: {p.dob}
                        </div>
                      </td>

                      {/* Payer Class */}
                      <td className="py-3.5 px-4">
                        <div>
                          {getPayerBadge(p.payerClass)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1 truncate max-w-[140px]" title={p.insuranceNumber || 'Cash (Self-Pay)'}>
                          {p.insuranceNumber || 'Self-Pay Direct'}
                        </div>
                      </td>

                      {/* Phone & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 font-medium flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {p.nationalId}
                        </div>
                      </td>

                      {/* Queue Status */}
                      <td className="py-3.5 px-4">
                        {queueEntry ? (
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                              queueEntry.status === 'In Consultation'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : queueEntry.status === 'Results Ready'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                : queueEntry.status === 'Awaiting Lab/Radiology'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-sky-100 text-sky-900 border border-sky-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                              <span>{queueEntry.tokenNumber} (Room {queueEntry.assignedRoom})</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                              {queueEntry.status}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px] font-medium">
                            Not Queued
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectPatient(p.mrn)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>View File</span>
                          </button>

                          {!queueEntry ? (
                            <button
                              type="button"
                              onClick={() => onOpenDispatchModal(p)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all cursor-pointer text-xs shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Route</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenDispatchModal(p)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer text-xs"
                              title="Reassign Consultation Room"
                            >
                              <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                              <span>Transfer</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenPrintCard(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Print Patient ID Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
