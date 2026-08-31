import React, { useState } from 'react';
import { Search, Plus, AlertCircle, ArrowRight, Eye, Bed, Zap, Flame, AlertOctagon } from 'lucide-react';
import { EmergencyRecord, TriageLevel } from '../../types';

interface EmergencyCasesViewProps {
  records: EmergencyRecord[];
  onSelectCase: (emergencyId: string) => void;
  onOpenIntakeModal: () => void;
  onUpdateStatus: (emergencyId: string, status: EmergencyRecord['status']) => void;
}

export const EmergencyCasesView: React.FC<EmergencyCasesViewProps> = ({
  records,
  onSelectCase,
  onOpenIntakeModal,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState<TriageLevel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      r.patientName.toLowerCase().includes(q) ||
      r.mrn.toLowerCase().includes(q) ||
      r.emergencyId.toLowerCase().includes(q) ||
      r.presentingComplaint.toLowerCase().includes(q) ||
      r.activeTraumaBay.toLowerCase().includes(q);

    const matchesTriage = triageFilter === 'ALL' || r.triageLevel === triageFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesTriage && matchesStatus;
  });

  const getTriagePill = (level: TriageLevel) => {
    switch (level) {
      case 'RED':
        return 'bg-rose-600 text-white font-bold';
      case 'YELLOW':
        return 'bg-amber-600 text-white font-bold';
      case 'GREEN':
        return 'bg-emerald-700 text-white font-bold';
      case 'BLUE':
        return 'bg-sky-700 text-white font-bold';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const activeCount = records.filter((r) => r.status === 'In Trauma Bay' || r.status === 'Triaged').length;
  const redCount = records.filter((r) => r.triageLevel === 'RED' && r.status !== 'Discharged').length;

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trauma cases by patient, MRN, ER ID, bay, or complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-rose-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
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

        {/* Triage Filter & Intake Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['ALL', 'RED', 'YELLOW', 'GREEN', 'BLUE'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setTriageFilter(lvl)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  triageFilter === lvl
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenIntakeModal}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Rapid ER Intake</span>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <AlertOctagon className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No emergency cases match the current filter</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try selecting another triage code or clearing search</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Triage / ER ID</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Assigned Bay</th>
                  <th className="py-2.5 px-4">Presenting Complaint</th>
                  <th className="py-2.5 px-4">Critical Vitals</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((er) => {
                  const isRed = er.triageLevel === 'RED';

                  return (
                    <tr
                      key={er.emergencyId}
                      onClick={() => onSelectCase(er.emergencyId)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Triage code & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getTriagePill(er.triageLevel)}`}>
                            {er.triageLevel}
                          </span>
                          <span className="font-mono text-slate-900 font-bold text-xs">{er.emergencyId}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{er.arrivedAt}</div>
                      </td>

                      {/* Patient & MRN */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {er.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {er.mrn} • {er.ageGender}
                        </div>
                      </td>

                      {/* Trauma Bay */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {er.activeTraumaBay}
                        </span>
                      </td>

                      {/* Complaint */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 truncate font-medium">{er.presentingComplaint}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Mobility: {er.triageEvaluation?.mobility || 'Stretcher'}
                        </div>
                      </td>

                      {/* Vitals */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {er.vitals ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {er.vitals.bpSystolic ?? 120}/{er.vitals.bpDiastolic ?? 80}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={(er.vitals.heartRate ?? 75) > 100 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                              {er.vitals.heartRate ?? '--'} bpm
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={(er.vitals.spO2 ?? 98) < 92 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                              {er.vitals.spO2 ?? '--'}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending vitals</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          er.status === 'In Trauma Bay'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : er.status === 'Triaged'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {er.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectCase(er.emergencyId)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          Manage
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
