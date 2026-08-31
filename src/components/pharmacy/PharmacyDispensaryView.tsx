import React, { useState } from 'react';
import {
  Pill,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Filter,
  User,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Prescription, DrugItem } from '../../types';

interface PharmacyDispensaryViewProps {
  prescriptions: Prescription[];
  drugInventory: DrugItem[];
  onOpenDispenseModal: (prescription: Prescription) => void;
  onOpenRxPrint: (rxId: string) => void;
}

export const PharmacyDispensaryView: React.FC<PharmacyDispensaryViewProps> = ({
  prescriptions,
  drugInventory,
  onOpenDispenseModal,
  onOpenRxPrint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESCRIBED' | 'DISPENSED'>('ALL');

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.mrn.toLowerCase().includes(q) ||
      rx.rxId.toLowerCase().includes(q) ||
      rx.prescriberName.toLowerCase().includes(q) ||
      rx.items.some((it) => it.genericName.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PRESCRIBED' && rx.status === 'Prescribed') ||
      (statusFilter === 'DISPENSED' && rx.status === 'Dispensed');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prescriptions by patient, MRN, Rx ID, medication, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
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

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Prescriptions ({prescriptions.length})</option>
            <option value="PRESCRIBED">Pending Dispensing</option>
            <option value="DISPENSED">Completed Dispenses</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Pill className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching prescriptions found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try changing your search term or filter</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Rx Number & Time</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Prescribed Formulations</th>
                  <th className="py-2.5 px-4">Ordering Clinician</th>
                  <th className="py-2.5 px-4">Stock Availability</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrescriptions.map((rx) => {
                  const isDispensed = rx.status === 'Dispensed';

                  // Check stock status for all items
                  const allItemsInStock = rx.items.every((it) => {
                    const stock = drugInventory.find((d) => d.drugCode === it.drugCode);
                    return stock && stock.stockOnHand >= it.quantity;
                  });

                  return (
                    <tr
                      key={rx.rxId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenDispenseModal(rx)}
                    >
                      {/* Rx ID & Timestamp */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {rx.rxId}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {rx.createdAt}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {rx.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {rx.mrn}
                        </div>
                      </td>

                      {/* Prescribed Items Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-1">
                          {rx.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-slate-800 text-[11px]">
                              <span className="font-semibold text-slate-900">{it.genericName}</span>
                              <span className="text-slate-400">({it.quantity} units)</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Prescriber */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">{rx.prescriberName}</div>
                        <div className="text-[10px] text-slate-400">{rx.department}</div>
                      </td>

                      {/* Live Stock Evaluation */}
                      <td className="py-3 px-4">
                        {isDispensed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            <span>Dispensed</span>
                          </span>
                        ) : allItemsInStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Available in Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Low Stock Alert</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDispenseModal(rx)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                              isDispensed
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                            }`}
                          >
                            <span>{isDispensed ? 'View Dispense' : 'Dispense'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenRxPrint(rx.rxId)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                            title="Print Prescription Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
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
