import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  FileText
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface CashierCBHIClaimsViewProps {
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const CashierCBHIClaimsView: React.FC<CashierCBHIClaimsViewProps> = ({ onOpenReceiptPrint }) => {
  const { billingInvoices = [] } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');

  const cbhiInvoices = billingInvoices.filter(
    (i) => i.payerClass === 'CBHI' || i.paymentMethod === 'CBHI Insurance'
  );

  const filtered = cbhiInvoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.mrn.toLowerCase().includes(q) ||
      inv.invoiceId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CBHI claims by patient, MRN, or claim ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
          />
        </div>

        <div className="text-slate-500 font-semibold text-xs">
          Total CBHI Claims: <strong className="text-slate-900">{cbhiInvoices.length}</strong>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ShieldCheck className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No CBHI insurance claims found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Claim ID & Date</th>
                  <th className="py-2.5 px-4">Beneficiary & MRN</th>
                  <th className="py-2.5 px-4">Scheme Agency</th>
                  <th className="py-2.5 px-4">Covered Clinical Services</th>
                  <th className="py-2.5 px-4">Claim Value</th>
                  <th className="py-2.5 px-4">Claim Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{inv.invoiceId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{inv.issuedAt}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">MRN: {inv.mrn}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px]">
                        CBHI Woreda Scheme
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-800">
                      {inv.items.map((i) => i.description).join(', ')}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-xs">
                      ETB {inv.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{inv.status === 'Paid' ? 'Reimbursed' : 'Awaiting Audit'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenReceiptPrint(inv.invoiceId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Claim</span>
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
