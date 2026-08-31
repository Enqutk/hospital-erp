import React, { useState } from 'react';
import {
  Scissors,
  Search,
  Plus,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Printer
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { SurgicalProcedure } from '../../types';

interface OTRegistryViewProps {
  onSelectCase: (surgery: SurgicalProcedure) => void;
  onOpenScheduleModal: () => void;
}

export const OTRegistryView: React.FC<OTRegistryViewProps> = ({
  onSelectCase,
  onOpenScheduleModal
}) => {
  const { surgeries = [], updateSurgeryStatus } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [suiteFilter, setSuiteFilter] = useState<string>('ALL');

  const filtered = surgeries.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const proc = (s.procedureName || s.surgicalProcedureName || '').toLowerCase();
    const pat = (s.patientName || '').toLowerCase();
    const mrn = (s.mrn || '').toLowerCase();
    const surgeon = (s.leadSurgeon || '').toLowerCase();

    const matchesSearch =
      q === '' ||
      proc.includes(q) ||
      pat.includes(q) ||
      mrn.includes(q) ||
      surgeon.includes(q) ||
      s.surgeryId.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSuite = suiteFilter === 'ALL' || (s.operatingTheatre && s.operatingTheatre.includes(suiteFilter));

    return matchesSearch && matchesStatus && matchesSuite;
  });

  return (
    <div className="space-y-4 text-xs">
      
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search surgical cases by procedure, patient, surgeon, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {['ALL', 'Scheduled', 'In Progress', 'PACU Recovery', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Surgery</span>
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Scissors className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No surgical cases match the filter</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Case ID & Schedule</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Surgical Procedure</th>
                  <th className="py-2.5 px-4">Surgical Team</th>
                  <th className="py-2.5 px-4">Suite & ASA Grade</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const isInProgress = s.status === 'In Progress';
                  const isPACU = s.status === 'PACU Recovery' || s.status === 'Recovery / PACU';

                  return (
                    <tr
                      key={s.surgeryId}
                      onClick={() => onSelectCase(s)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Case ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{s.surgeryId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.scheduledDateTime}</div>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {s.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">MRN: {s.mrn}</div>
                      </td>

                      {/* Procedure */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">
                          {s.procedureName || s.surgicalProcedureName}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Pre-op: {s.preOpDiagnosis}
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{s.leadSurgeon}</div>
                        <div className="text-[10px] text-slate-500">
                          Anes: {s.anaesthetist || s.anesthesiologistName}
                        </div>
                      </td>

                      {/* Suite & ASA */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{s.operatingTheatre || s.targetOperatingRoom}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-bold font-mono">
                          {s.asaGrade || 'ASA II'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isInProgress
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : isPACU
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : s.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectCase(s)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          Operative Case
                        </button>
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
