import React from 'react';
import { Inbox, Building, UserCheck, Baby, CheckCircle2 } from 'lucide-react';
import { IPDSubTab } from './types';

interface IPDKpiStatsProps {
  activeSubTab: IPDSubTab;
  onSelectTab: (tab: IPDSubTab) => void;
  pendingOrdersCount: number;
  totalOrdersCount: number;
  totalBedsCount: number;
  occupiedBedsCount: number;
  occupancyRate: number;
  pediatricOccupied: number;
  pediatricTotal: number;
  pediatricAvailable: number;
  availableBedsCount: number;
  cleaningBedsCount: number;
}

export const IPDKpiStats: React.FC<IPDKpiStatsProps> = ({
  activeSubTab,
  onSelectTab,
  pendingOrdersCount,
  totalOrdersCount,
  totalBedsCount,
  occupiedBedsCount,
  occupancyRate,
  pediatricOccupied,
  pediatricTotal,
  pediatricAvailable,
  availableBedsCount,
  cleaningBedsCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* KPI 1: Doctor Orders Queue */}
      <button
        type="button"
        onClick={() => onSelectTab('DOCTOR_ORDERS')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSubTab === 'DOCTOR_ORDERS'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-slate-300' : 'text-slate-600'}`}>
            Doctor Orders
          </span>
          <Inbox className={`w-4 h-4 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-amber-400' : 'text-slate-400'}`} />
        </div>
        <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-white' : 'text-slate-900'}`}>
          {pendingOrdersCount} Pending
        </div>
        <div className={`text-[11px] mt-0.5 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-slate-400' : 'text-slate-500'}`}>
          {totalOrdersCount} Total Intake Orders
        </div>
      </button>

      {/* KPI 2: Total Bed Capacity */}
      <button
        type="button"
        onClick={() => onSelectTab('BED_MATRIX')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSubTab === 'BED_MATRIX'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${activeSubTab === 'BED_MATRIX' ? 'text-slate-300' : 'text-slate-600'}`}>
            Live Bed Matrix
          </span>
          <Building className={`w-4 h-4 ${activeSubTab === 'BED_MATRIX' ? 'text-blue-400' : 'text-slate-400'}`} />
        </div>
        <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'BED_MATRIX' ? 'text-white' : 'text-slate-900'}`}>
          {totalBedsCount} Beds
        </div>
        <div className={`text-[11px] mt-0.5 ${activeSubTab === 'BED_MATRIX' ? 'text-slate-400' : 'text-slate-500'}`}>
          6 Clinical Wards
        </div>
      </button>

      {/* KPI 3: Occupied Inpatients */}
      <button
        type="button"
        onClick={() => onSelectTab('ACTIVE_INPATIENTS')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSubTab === 'ACTIVE_INPATIENTS'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-slate-300' : 'text-slate-600'}`}>
            Active Inpatients
          </span>
          <UserCheck className={`w-4 h-4 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-emerald-400' : 'text-slate-400'}`} />
        </div>
        <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-white' : 'text-slate-900'}`}>
          {occupiedBedsCount} Admitted
        </div>
        <div className={`text-[11px] mt-0.5 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-slate-400' : 'text-slate-500'}`}>
          {occupancyRate}% Hospital Occupancy
        </div>
      </button>

      {/* KPI 4: Pediatric Ward */}
      <button
        type="button"
        onClick={() => onSelectTab('PEDIATRICS')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSubTab === 'PEDIATRICS'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${activeSubTab === 'PEDIATRICS' ? 'text-slate-300' : 'text-slate-600'}`}>
            Pediatrics (Ward 03)
          </span>
          <Baby className={`w-4 h-4 ${activeSubTab === 'PEDIATRICS' ? 'text-indigo-400' : 'text-slate-400'}`} />
        </div>
        <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'PEDIATRICS' ? 'text-white' : 'text-slate-900'}`}>
          {pediatricOccupied} / {pediatricTotal}
        </div>
        <div className={`text-[11px] mt-0.5 ${activeSubTab === 'PEDIATRICS' ? 'text-slate-400' : 'text-slate-500'}`}>
          {pediatricAvailable} Beds Free
        </div>
      </button>

      {/* KPI 5: Intake Ready */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold">Intake Ready</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1.5">
          {availableBedsCount} Available
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {cleaningBedsCount > 0 ? `${cleaningBedsCount} in sanitization` : 'Direct Intake Ready'}
        </div>
      </div>
    </div>
  );
};
