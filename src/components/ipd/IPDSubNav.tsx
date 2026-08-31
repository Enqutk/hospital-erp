import React from 'react';
import { Inbox, Building, Baby, UserCheck, CheckCircle } from 'lucide-react';
import { IPDSubTab } from './types';

interface IPDSubNavProps {
  activeSubTab: IPDSubTab;
  onSelectTab: (tab: IPDSubTab) => void;
  pendingOrdersCount: number;
  totalBedsCount: number;
  activeInpatientsCount: number;
}

export const IPDSubNav: React.FC<IPDSubNavProps> = ({
  activeSubTab,
  onSelectTab,
  pendingOrdersCount,
  totalBedsCount,
  activeInpatientsCount
}) => {
  return (
    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
      <button
        type="button"
        onClick={() => onSelectTab('DOCTOR_ORDERS')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
          activeSubTab === 'DOCTOR_ORDERS'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Inbox className="w-3.5 h-3.5" />
        <span>Doctor Bed Orders</span>
        {pendingOrdersCount > 0 && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'DOCTOR_ORDERS' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {pendingOrdersCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('BED_MATRIX')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
          activeSubTab === 'BED_MATRIX'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Building className="w-3.5 h-3.5" />
        <span>Live Bed Matrix</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            activeSubTab === 'BED_MATRIX' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {totalBedsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('PEDIATRICS')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
          activeSubTab === 'PEDIATRICS'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Baby className="w-3.5 h-3.5" />
        <span>Pediatric Inpatient Unit</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            activeSubTab === 'PEDIATRICS' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Ward 03
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('ACTIVE_INPATIENTS')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
          activeSubTab === 'ACTIVE_INPATIENTS'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Active Inpatients</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            activeSubTab === 'ACTIVE_INPATIENTS' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {activeInpatientsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('DISCHARGE_CLEARANCE')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
          activeSubTab === 'DISCHARGE_CLEARANCE'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Discharge Clearances</span>
      </button>
    </div>
  );
};
