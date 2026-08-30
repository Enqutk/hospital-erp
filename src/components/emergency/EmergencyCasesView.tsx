import React, { useState } from 'react';
import { Search, Plus, AlertCircle, ArrowRight, Eye, Bed, Zap } from 'lucide-react';
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
        return 'bg-rose-900 text-white font-bold';
      case 'YELLOW':
        return 'bg-amber-700 text-white font-bold';
      case 'GREEN':
        return 'bg-emerald-800 text-white font-bold';
      case 'BLUE':
        return 'bg-blue-800 text-white font-bold';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const activeCount = records.filter((r) => r.status === 'In Trauma Bay' || r.status === 'Triaged').length;
  const redCount = records.filter((r) => r.triageLevel === 'RED' && r.status !== 'Discharged').length;

  return (
    <div className="space-y-4">
      {/* Top Search and Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Emergency Triage & Active Cases</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              {activeCount} Active in ER • {redCount} Critical (Red)
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenIntakeModal}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Rapid Emergency Intake</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, ER ID, complaint, or bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-slate-600 focus:outline-hidden bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Triage Level Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['ALL', 'RED', 'YELLOW', 'GREEN', 'BLUE'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setTriageFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  triageFilter === lvl
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'All Triage' : `Code ${lvl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No emergency cases match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Triage / ER ID</th>
                  <th className="py-2.5 px-3">Patient & MRN</th>
                  <th className="py-2.5 px-3">Assigned Bay</th>
                  <th className="py-2.5 px-3">Presenting Complaint</th>
                  <th className="py-2.5 px-3">Critical Vitals</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((er) => (
                  <tr
                    key={er.emergencyId}
                    onClick={() => onSelectCase(er.emergencyId)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Triage code & ID */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${getTriagePill(er.triageLevel)}`}>
                          {er.triageLevel}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{er.emergencyId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{er.arrivedAt}</div>
                    </td>

                    {/* Patient & MRN */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-slate-700">
                        {er.patientName}
                      </div>
                      <div className="font-mono text-slate-500 text-[11px]">MRN: {er.mrn}</div>
                    </td>

                    {/* Assigned Bay */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {er.activeTraumaBay}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{er.attendingStaff}</div>
                    </td>

                    {/* Presenting Complaint */}
                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-slate-800 line-clamp-2 text-[11px]">
                        {er.presentingComplaint}
                      </p>
                    </td>

                    {/* Critical Vitals */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-slate-800 space-y-0.5">
                        <div>
                          BP: <strong>{er.criticalVitals.bpSystolic}/{er.criticalVitals.bpDiastolic}</strong> | HR: <strong>{er.criticalVitals.heartRate}</strong>
                        </div>
                        <div>
                          SpO2: <strong className={er.criticalVitals.spO2 < 92 ? 'text-rose-600' : 'text-slate-900'}>{er.criticalVitals.spO2}%</strong> | GCS: <strong>{er.criticalVitals.gcsScore || 15}/15</strong>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        er.status === 'In Trauma Bay'
                          ? 'bg-rose-100 text-rose-800'
                          : er.status === 'Transferred to OT'
                          ? 'bg-teal-100 text-teal-800'
                          : er.status === 'Admitted to ICU'
                          ? 'bg-blue-100 text-blue-800'
                          : er.status === 'Triaged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {er.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectCase(er.emergencyId)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
