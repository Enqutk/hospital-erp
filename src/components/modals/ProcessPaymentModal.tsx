import React, { useState } from 'react';
import {
  X,
  Receipt,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Printer,
  CheckCircle2,
  DollarSign,
  User,
  Wallet,
  Building,
  QrCode
} from 'lucide-react';
import { BillingInvoice, PaymentMethod } from '../../types';

interface ProcessPaymentModalProps {
  invoice: BillingInvoice | null;
  onClose: () => void;
  onProcessPayment: (invoiceId: string, method: PaymentMethod, reference: string) => void;
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
  invoice,
  onClose,
  onProcessPayment,
  onOpenReceiptPrint
}) => {
  if (!invoice) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    invoice.payerClass === 'CBHI' ? 'CBHI Insurance' : 'Cash'
  );
  const [transactionRef, setTransactionRef] = useState('');
  const [cashTendered, setCashTendered] = useState<number>(invoice.totalAmount);

  const changeDue = Math.max(0, cashTendered - invoice.totalAmount);

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = transactionRef || (paymentMethod === 'Cash' ? 'CASH-REC-' + Date.now().toString().slice(-4) : 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    onProcessPayment(invoice.invoiceId, paymentMethod, ref);
    onOpenReceiptPrint(invoice.invoiceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Point-of-Sale Payment Settlement
                </h3>
                <span className="font-mono text-[11px] bg-white text-teal-900 font-bold px-2 py-0.5 rounded-md border border-teal-200 shadow-2xs">
                  {invoice.invoiceId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-slate-800">{invoice.patientName}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-600">{invoice.mrn}</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 text-[10px]">
                  {invoice.payerClass}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSettle} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Itemized Services Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
              Itemized Clinical Services & Medicines
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
              {invoice.items.map((it) => (
                <div key={it.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <div className="font-semibold text-slate-900">{it.description}</div>
                    <div className="text-[10px] text-slate-400">{it.department} • Qty: {it.quantity}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    ETB {it.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between font-bold text-sm">
              <span>Total Payable Amount</span>
              <span className="font-mono text-emerald-400">ETB {invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 text-[11px]">Select Settlement Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Cash', 'Telebirr', 'CBE Birr', 'CBHI Insurance'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    paymentMethod === m
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Change Calculator */}
          {paymentMethod === 'Cash' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div>
                <label className="block font-bold text-emerald-950 text-[10px] uppercase">Cash Tendered (ETB)</label>
                <input
                  type="number"
                  min={invoice.totalAmount}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono font-bold bg-white text-slate-900 mt-1"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-950 text-[10px] uppercase">Change Due (ETB)</label>
                <div className="font-mono font-black text-emerald-700 text-base mt-2">
                  ETB {changeDue.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Digital Gateway Reference / CBHI Claim code */}
          {paymentMethod !== 'Cash' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block font-bold text-slate-800 text-[11px]">
                {paymentMethod.includes('Insurance') ? 'Beneficiary Card / Claim Ref ID' : 'Mobile Gateway Transaction Ref (TXN ID)'}
              </label>
              <input
                type="text"
                placeholder={paymentMethod === 'Telebirr' ? 'e.g. TLB-99482103' : 'e.g. CBE-84729104'}
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-hidden font-mono uppercase font-semibold"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Print Receipt</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
