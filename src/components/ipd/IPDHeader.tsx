import React from 'react';
import { Bed, Plus, ShieldCheck } from 'lucide-react';

interface IPDHeaderProps {
  onOpenNewOrder: () => void;
  onOpenDirectAdmit: () => void;
}

export const IPDHeader: React.FC<IPDHeaderProps> = ({
  onOpenNewOrder,
  onOpenDirectAdmit
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inpatient Department
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Bed Control & Care Roster
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IPD Wards & Bed Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Simplified admission queue, real-time ward bed allocation, child care oversight, and discharge clearance management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>+ New Bed Order</span>
          </button>
          <button
            type="button"
            onClick={onOpenDirectAdmit}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Bed className="w-4 h-4" />
            <span>Direct Bed Admit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
