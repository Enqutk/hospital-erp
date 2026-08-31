import React, { useState } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  CreditCard,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { BillingInvoice } from '../../types';

interface CashierInvoicesViewProps {
  invoices: BillingInvoice[];
  onSelectInvoice: (invoice: BillingInvoice) => void;
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const CashierInvoicesView: React.FC<CashierInvoicesViewProps> = ({
  invoices,
  onSelectInvoice,
  onOpenReceiptPrint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payerFilter, setPayerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.mrn.toLowerCase().includes(q) ||
      inv.invoiceId.toLowerCase().includes(q);

    const matchesPayer = payerFilter === 'ALL' || inv.payerClass === payerFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesPayer && matchesStatus;
  });

  return (
    <div className="space-y-4 text-xs">
      
      {/* Search & Payer Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoices by patient name, MRN, or Invoice ID..."
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

        {/* Payer Class Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'Paying', 'CBHI', 'Free/Exempt'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setPayerFilter(cat)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                payerFilter === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Receipt className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No invoices match the filter criteria</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try searching another patient or changing payer category</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Invoice ID & Date</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Payer Class</th>
                  <th className="py-2.5 px-4">Itemized Services</th>
                  <th className="py-2.5 px-4">Payable Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'Paid';

                  return (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Invoice ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{inv.invoiceId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{inv.issuedAt}</div>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inv.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">MRN: {inv.mrn}</div>
                      </td>

                      {/* Payer Class */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          inv.payerClass === 'CBHI'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : inv.payerClass === 'Free/Exempt'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.payerClass}
                        </span>
                      </td>

                      {/* Services summary */}
                      <td className="py-3 px-4 max-w-xs truncate">
                        <div className="text-slate-800 font-medium">
                          {inv.items.map((i) => i.description).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inv.items.length} line item(s)
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        ETB {inv.totalAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : inv.status === 'Insurance Pending'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{inv.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => onOpenReceiptPrint(inv.invoiceId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectInvoice(inv)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Settle POS</span>
                          </button>
                        )}
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
