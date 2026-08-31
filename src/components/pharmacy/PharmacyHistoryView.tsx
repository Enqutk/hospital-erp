import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Printer,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Pill
} from 'lucide-react';
import { Prescription } from '../../types';

interface PharmacyHistoryViewProps {
  prescriptions: Prescription[];
  onOpenRxPrint: (rxId: string) => void;
}

export const PharmacyHistoryView: React.FC<PharmacyHistoryViewProps> = ({
  prescriptions,
  onOpenRxPrint
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const dispensedPrescriptions = prescriptions.filter((p) => p.status === 'Dispensed');

  const filtered = dispensedPrescriptions.filter((rx) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.mrn.toLowerCase().includes(q) ||
      rx.rxId.toLowerCase().includes(q) ||
      rx.prescriberName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed dispenses by patient, MRN, Rx ID, or prescriber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
          />
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          {dispensedPrescriptions.length} Completed Dispenses
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <FileCheck className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No completed dispensing records found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Rx ID & Date</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Dispensed Formulations</th>
                  <th className="py-2.5 px-4">Prescribing Doctor</th>
                  <th className="py-2.5 px-4">Audit Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rx) => (
                  <tr key={rx.rxId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{rx.rxId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rx.createdAt}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rx.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rx.mrn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {rx.items.map((it, idx) => (
                          <div key={idx} className="text-slate-800 text-[11px]">
                            • {it.genericName} <span className="text-slate-400">({it.quantity} units)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-900">{rx.prescriberName}</div>
                      <div className="text-[10px] text-slate-400">{rx.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Dispensed & Signed</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenRxPrint(rx.rxId)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Print Dispense Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
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
