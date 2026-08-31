import React, { useState } from 'react';
import {
  Search,
  Plus,
  Printer,
  Send,
  Users,
  FileText,
  Phone,
  Stethoscope,
  ChevronRight,
  UserCheck
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
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700">
          CBHI
        </span>
      );
    }
    if (lower.includes('cash')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
          Cash
        </span>
      );
    }
    if (lower.includes('corp') || lower.includes('company')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
          Corporate
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700">
        Private
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Clean & Simple Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, MRN, phone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
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

        {/* Right Filter & Register CTA */}
        <div className="flex items-center gap-2">
          {/* Payer Select Dropdown */}
          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Payers ({patients.length})</option>
            <option value="CBHI">CBHI Insurance</option>
            <option value="Cash">Cash (Self-Pay)</option>
            <option value="Corporate">Corporate Partner</option>
            <option value="Private">Private Insurance</option>
          </select>

          {/* New Patient Button */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* Clean Patient List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Users className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching patients found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try searching with a different term</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">Patient</th>
                  <th className="py-2.5 px-4 font-semibold">Age / Gender</th>
                  <th className="py-2.5 px-4 font-semibold">Contact</th>
                  <th className="py-2.5 px-4 font-semibold">Payer</th>
                  <th className="py-2.5 px-4 font-semibold">OPD Status</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => {
                  const age = calculateAge(p.dob);
                  const queueEntry = (opdQueue || []).find(
                    (q) => q.mrn === p.mrn && (q.status === 'Waiting' || q.status === 'In Consultation' || q.status === 'Results Ready' || q.status === 'Awaiting Lab/Radiology')
                  );
                  const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim();

                  return (
                    <tr
                      key={p.mrn}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(p.mrn)}
                    >
                      {/* Name & MRN */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[180px]">
                              {fullName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                              <span>{p.mrn}</span>
                              {p.bloodGroup && (
                                <span className="text-rose-600 font-bold">
                                  • {p.bloodGroup}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3 px-4 text-slate-700">
                        <span>{p.gender}, {age} yrs</span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {p.phone}
                      </td>

                      {/* Payer */}
                      <td className="py-3 px-4">
                        {getPayerBadge(p.payerClass)}
                      </td>

                      {/* OPD Status */}
                      <td className="py-3 px-4">
                        {queueEntry ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            queueEntry.status === 'In Consultation'
                              ? 'bg-emerald-100 text-emerald-800'
                              : queueEntry.status === 'Results Ready'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{queueEntry.tokenNumber} (Room {queueEntry.assignedRoom})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Not Queued
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenDispatchModal(p)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                              !queueEntry
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{!queueEntry ? 'Route' : 'Transfer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenPrintCard(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                            title="Print Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectPatient(p.mrn)}
                            className="p-1 text-slate-400 group-hover:text-slate-700 transition-colors"
                            title="Open Details"
                          >
                            <ChevronRight className="w-4 h-4" />
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
