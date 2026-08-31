import React, { useState } from 'react';
import {
  Droplet,
  Heart,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { BloodUnit } from '../../types';

interface BloodBankInventoryViewProps {
  bloodUnits: BloodUnit[];
  onOpenDonorIntake: () => void;
}

export const BloodBankInventoryView: React.FC<BloodBankInventoryViewProps> = ({
  bloodUnits,
  onOpenDonorIntake
}) => {
  const [filterGroup, setFilterGroup] = useState('ALL');

  const bloodGroupCounts: Record<string, number> = {
    'A+': bloodUnits.filter((u) => u.bloodGroup === 'A+' && u.status === 'Available').length,
    'A-': bloodUnits.filter((u) => u.bloodGroup === 'A-' && u.status === 'Available').length,
    'B+': bloodUnits.filter((u) => u.bloodGroup === 'B+' && u.status === 'Available').length,
    'B-': bloodUnits.filter((u) => u.bloodGroup === 'B-' && u.status === 'Available').length,
    'AB+': bloodUnits.filter((u) => u.bloodGroup === 'AB+' && u.status === 'Available').length,
    'AB-': bloodUnits.filter((u) => u.bloodGroup === 'AB-' && u.status === 'Available').length,
    'O+': bloodUnits.filter((u) => u.bloodGroup === 'O+' && u.status === 'Available').length,
    'O-': bloodUnits.filter((u) => u.bloodGroup === 'O-' && u.status === 'Available').length
  };

  const filteredUnits = bloodUnits.filter((u) => {
    return filterGroup === 'ALL' || u.bloodGroup === filterGroup;
  });

  return (
    <div className="space-y-4">
      {/* 8-Group Perpetual Blood Stock Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Droplet className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Blood Bank & Cold-Chain Inventory</h3>
              <div className="text-[11px] text-slate-500">Perpetual ABO & Rh(D) unit reserves</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {bloodUnits.filter((u) => u.status === 'Available').length} Available Bags
            </span>
            <button
              type="button"
              onClick={onOpenDonorIntake}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Donor & Bag</span>
            </button>
          </div>
        </div>

        {/* 8-Grid Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {Object.entries(bloodGroupCounts).map(([grp, count]) => {
            const isSelected = filterGroup === grp;
            const isZero = count === 0;

            return (
              <button
                key={grp}
                type="button"
                onClick={() => setFilterGroup(isSelected ? 'ALL' : grp)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : isZero
                    ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/60'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className={`text-base font-black ${
                  isSelected ? 'text-white' : 'text-rose-600'
                }`}>
                  {grp}
                </div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${
                  isSelected ? 'text-emerald-300' : isZero ? 'text-rose-700' : 'text-slate-900'
                }`}>
                  {count} {count === 1 ? 'unit' : 'units'}
                </div>
                <div className={`text-[9px] mt-0.5 font-medium ${
                  isSelected ? 'text-slate-300' : isZero ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}>
                  {isZero ? 'LOW STOCK' : 'Available'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blood Units Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">Stored Blood Bags</span>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {filteredUnits.length} units
            </span>
          </div>

          {filterGroup !== 'ALL' && (
            <button
              onClick={() => setFilterGroup('ALL')}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Clear Filter ({filterGroup})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Unit Barcode ID</th>
                <th className="py-2.5 px-4">Blood Group</th>
                <th className="py-2.5 px-4">Volume</th>
                <th className="py-2.5 px-4">Collection Date</th>
                <th className="py-2.5 px-4">Expiry Date</th>
                <th className="py-2.5 px-4">4-Pathogen Clearance</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.map((u) => (
                <tr key={u.unitId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {u.unitId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                      {u.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono">
                    {u.volumeMl || 450} mL
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {u.collectionDate}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-mono text-[11px] font-semibold">
                    {u.expiryDate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>HIV • HBV • HCV • Syphilis (Cleared)</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
