import React, { useState } from 'react';
import {
  Building,
  Search,
  CheckCircle2,
  RefreshCw,
  User,
  Activity,
  ArrowRightLeft,
  Eye,
  Plus
} from 'lucide-react';
import { Bed as BedType, IPDAdmission, WardCode } from '../../../types';
import { WARDS_LIST } from '../types';

interface BedMatrixTabProps {
  beds: BedType[];
  ipdAdmissions: IPDAdmission[];
  onOpenDirectAdmit: (wardCode: WardCode, bedNumber: string) => void;
  onOpenTransferModal: (admission: IPDAdmission) => void;
  onOpenChart: (admission: IPDAdmission) => void;
  onUpdateBedStatus: (bedId: string, status: BedType['status']) => void;
}

export const BedMatrixTab: React.FC<BedMatrixTabProps> = ({
  beds,
  ipdAdmissions,
  onOpenDirectAdmit,
  onOpenTransferModal,
  onOpenChart,
  onUpdateBedStatus
}) => {
  const [selectedWard, setSelectedWard] = useState<WardCode | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBeds = beds.filter((b) => {
    const matchesWard = selectedWard === 'ALL' || b.wardCode === selectedWard;
    const matchesSearch =
      searchTerm === '' ||
      b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.patientName && b.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.patientMrn && b.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesWard && matchesSearch;
  });

  const totalBeds = beds.length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const cleaningBeds = beds.filter((b) => b.status === 'Cleaning').length;

  return (
    <div className="space-y-4">
      {/* Ward Selector Bar & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Ward filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedWard('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedWard === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Wards ({beds.length})
            </button>
            {WARDS_LIST.map((w) => (
              <button
                key={w.code}
                type="button"
                onClick={() => setSelectedWard(w.code)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
                  {beds.filter((b) => b.wardCode === w.code).length}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bed No or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden bg-white"
            />
          </div>
        </div>
      </div>

      {/* Visual Bed Grid Container */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Ward Bed Status Matrix
            </h2>
            <span className="text-xs text-slate-500 font-normal">
              ({filteredBeds.length} beds shown)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available ({availableBeds})
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Occupied ({occupiedBeds})
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sanitizing ({cleaningBeds})
            </span>
          </div>
        </div>

        {/* Grid of Bed Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredBeds.map((bed) => {
            const isOccupied = bed.status === 'Occupied';
            const isCleaning = bed.status === 'Cleaning';
            const matchingAdmission = ipdAdmissions.find(
              (a) => a.bedNumber === bed.bedNumber && a.status === 'Active'
            );
            const isPediatric = bed.wardCode === 'PEDIATRICS';

            return (
              <div
                key={bed.bedId}
                className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isOccupied
                    ? 'border-slate-300 bg-slate-50/50 shadow-xs'
                    : isCleaning
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                        {isPediatric && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                            Child Cot
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{bed.wardName}</div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOccupied
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : isCleaning
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  {isOccupied && bed.patientName ? (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{bed.patientName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        MRN: {bed.patientMrn}
                      </div>
                      {matchingAdmission && (
                        <div className="text-[11px] text-slate-700 line-clamp-1 font-medium">
                          {matchingAdmission.diagnosis}
                        </div>
                      )}
                    </div>
                  ) : isCleaning ? (
                    <div className="mt-3 pt-2.5 border-t border-amber-200 space-y-1">
                      <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>Undergoing Disinfection</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Sanitization in progress post-discharge.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                      <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct Intake Ready</span>
                      </div>
                      {bed.oxygenPortAvailable && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          <Activity className="w-3 h-3 text-blue-600" />
                          O2 Port Active
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-1.5">
                  {isOccupied && matchingAdmission ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenChart(matchingAdmission)}
                        className="text-[11px] font-bold text-slate-900 hover:text-slate-700 underline cursor-pointer"
                      >
                        Clinical Chart →
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTransferModal(matchingAdmission)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 cursor-pointer transition-colors"
                        title="Transfer Bed"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : isCleaning ? (
                    <button
                      type="button"
                      onClick={() => onUpdateBedStatus(bed.bedId, 'Available')}
                      className="w-full text-center text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Mark Sanitized
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenDirectAdmit(bed.wardCode, bed.bedNumber)}
                      className="w-full text-center text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                      + Admit to {bed.bedNumber}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
