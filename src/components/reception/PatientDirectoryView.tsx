import React, { useState } from 'react';
import { Search, Plus, Printer, Send, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
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

    const matchesPayer = payerFilter === 'ALL' || p.payerClass.includes(payerFilter);
    return matchesSearch && matchesPayer;
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Master Patient Index</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              {filteredPatients.length} of {patients.length} records
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

        {/* Search input & Payer Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, phone number, or national ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-slate-600 focus:outline-hidden bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['ALL', 'CBHI', 'Cash', 'Corporate', 'Private'].map((payer) => (
              <button
                key={payer}
                type="button"
                onClick={() => setPayerFilter(payer)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  payerFilter === payer
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {payer}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table / List View */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No patient records match the search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Patient Name & MRN</th>
                  <th className="py-2.5 px-3">Age / Gender</th>
                  <th className="py-2.5 px-3">Payer & Policy</th>
                  <th className="py-2.5 px-3">Phone & ID</th>
                  <th className="py-2.5 px-3">Queue Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.map((p) => {
                  const age = calculateAge(p.dob);
                  const queueEntry = (opdQueue || []).find(
                    (q) => q.mrn === p.mrn && (q.status === 'Waiting' || q.status === 'In Consultation' || q.status === 'Results Ready' || q.status === 'Awaiting Lab/Radiology')
                  );

                  return (
                    <tr
                      key={p.mrn}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(p.mrn)}
                    >
                      {/* Name & MRN */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 hover:text-slate-700">
                              {p.firstName} {p.middleName} {p.lastName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              MRN: {p.mrn} • Blood: {p.bloodGroup || 'O+'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">
                          {p.gender}, {age} yrs
                        </div>
                        <div className="text-[11px] text-slate-500">DOB: {p.dob}</div>
                      </td>

                      {/* Payer Class */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-[11px]">
                          {p.payerClass.split(' ')[0]}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {p.insuranceNumber || 'Cash (Self-Pay)'}
                        </div>
                      </td>

                      {/* Phone & ID */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800">{p.phone}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.nationalId}</div>
                      </td>

                      {/* Queue Status */}
                      <td className="py-3 px-3">
                        {queueEntry ? (
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              queueEntry.status === 'Results Ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : queueEntry.status === 'In Consultation'
                                ? 'bg-blue-100 text-blue-800'
                                : queueEntry.status === 'Awaiting Lab/Radiology'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {queueEntry.tokenNumber} (Room {queueEntry.assignedRoom})
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {queueEntry.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Queued</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectPatient(p.mrn)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded transition-colors cursor-pointer text-xs"
                          >
                            View File
                          </button>

                          {!queueEntry && (
                            <button
                              type="button"
                              onClick={() => onOpenDispatchModal(p)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors cursor-pointer text-xs"
                            >
                              Route
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenPrintCard(p)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                            title="Print Patient Card"
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
