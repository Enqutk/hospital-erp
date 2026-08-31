import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Printer,
  Calendar,
  CheckCircle2,
  Wallet,
  Smartphone,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface CashierLedgerViewProps {
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const CashierLedgerView: React.FC<CashierLedgerViewProps> = ({ onOpenReceiptPrint }) => {
  const { transactions = [], billingInvoices = [] } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const paidInvoices = billingInvoices.filter((i) => i.status === 'Paid');

  const filteredInvoices = paidInvoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.mrn.toLowerCase().includes(q) ||
      inv.invoiceId.toLowerCase().includes(q) ||
      (inv.paymentReference && inv.paymentReference.toLowerCase().includes(q));

    const matchesMethod = methodFilter === 'ALL' || inv.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-4 text-xs">
      
      {/* Search and Channel Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed transactions by patient, reference ID, invoice..."
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

        {/* Method filter chips */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'Cash', 'Telebirr', 'CBE Birr', 'CBHI Insurance'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethodFilter(m)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                methodFilter === m
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <DollarSign className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No settled transactions match the criteria</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Receipt / Invoice</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Payment Method</th>
                  <th className="py-2.5 px-4">Reference Code</th>
                  <th className="py-2.5 px-4">Shift Cashier</th>
                  <th className="py-2.5 px-4">Settled Amount</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{inv.invoiceId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{inv.paidAt || inv.issuedAt}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">MRN: {inv.mrn}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {inv.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {inv.paymentReference || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {inv.cashierName || 'Tigist Mengistu'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-xs">
                      ETB {inv.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenReceiptPrint(inv.invoiceId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
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
