import React, { useState } from 'react';
import {
  ShieldCheck,
  Droplet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Edit2,
  Printer
} from 'lucide-react';
import { BloodUnit, CrossmatchRecord, Patient } from '../../types';

interface CrossmatchSafetyViewProps {
  patients: Patient[];
  bloodUnits: BloodUnit[];
  crossmatchRecords: CrossmatchRecord[];
  selectedPatientMrn: string | null;
  onOpenCreateModal: () => void;
  onOpenEditModal: (record: CrossmatchRecord) => void;
  onOpenCertificateModal: (record: CrossmatchRecord) => void;
}

export const CrossmatchSafetyView: React.FC<CrossmatchSafetyViewProps> = ({
  patients,
  bloodUnits,
  crossmatchRecords,
  selectedPatientMrn,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenCertificateModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRecords = crossmatchRecords.filter((rec) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      rec.patientName.toLowerCase().includes(q) ||
      rec.mrn.toLowerCase().includes(q) ||
      rec.matchId.toLowerCase().includes(q) ||
      rec.matchedUnitId.toLowerCase().includes(q) ||
      rec.patientBloodGroup.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CLEARED' && rec.status === 'Cleared for Transfusion') ||
      (statusFilter === 'REJECTED' && rec.status === 'Rejected');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, MRN, match ID, or matched blood bag ID..."
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

        {/* Filter & Action Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Clearances ({crossmatchRecords.length})</option>
            <option value="CLEARED">Cleared for Transfusion</option>
            <option value="REJECTED">Rejected (Incompatible)</option>
          </select>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Crossmatch Test</span>
          </button>
        </div>
      </div>

      {/* Crossmatch Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ShieldCheck className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching crossmatch records found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try changing your search or filter</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Match ID & Time</th>
                  <th className="py-2.5 px-4">Recipient Patient</th>
                  <th className="py-2.5 px-4">Matched Bank Bag</th>
                  <th className="py-2.5 px-4">Serology Finding</th>
                  <th className="py-2.5 px-4">Clearance Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isCleared = rec.status === 'Cleared for Transfusion';

                  return (
                    <tr
                      key={rec.matchId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenCertificateModal(rec)}
                    >
                      {/* Match ID */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {rec.matchId}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {rec.timestamp}
                        </div>
                      </td>

                      {/* Recipient Patient */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {rec.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {rec.mrn} • ABO: <span className="font-bold text-rose-700">{rec.patientBloodGroup}</span>
                        </div>
                      </td>

                      {/* Matched Blood Bag */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          <Droplet className="w-3 h-3 text-rose-600 fill-rose-500" />
                          <span>{rec.matchedUnitId}</span>
                        </div>
                      </td>

                      {/* Serology Finding */}
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold ${
                          isCleared ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {rec.crossmatchingResult}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isCleared
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {isCleared ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenCertificateModal(rec)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                          >
                            Certificate
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditModal(rec)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
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
