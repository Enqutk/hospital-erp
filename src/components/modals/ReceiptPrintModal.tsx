import React from 'react';
import { X, Printer, Receipt, CheckCircle2 } from 'lucide-react';
import { BillingInvoice } from '../../types';

interface ReceiptPrintModalProps {
  invoice: BillingInvoice | null;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 print:hidden">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            Official Cashier Revenue Receipt
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Style */}
        <div className="border-2 border-slate-300 rounded-xl p-5 bg-white space-y-4 printable-content font-mono">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <div className="font-black text-sm tracking-wider uppercase text-slate-900">
              FAYA PRIMARY HOSPITAL
            </div>
            <div className="text-[10px] text-slate-500">Ministry of Health • Public Health Facility</div>
            <div className="text-[10px] text-slate-600 mt-1">
              OFFICIAL CASH RECEIPT / VOUCHER
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              Invoice #{invoice.invoiceId}
            </div>
          </div>

          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between">
              <span>Patient:</span>
              <span className="font-bold">{invoice.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span>MRN:</span>
              <span>{invoice.mrn}</span>
            </div>
            <div className="flex justify-between">
              <span>Payer Class:</span>
              <span>{invoice.payerClass}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-teal-800">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Txn Ref:</span>
              <span>{invoice.transactionRef || 'CASH-REC-001'}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{invoice.createdAt}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-[11px]">
            <div className="font-bold flex justify-between uppercase text-[10px] text-slate-500">
              <span>Item / Department</span>
              <span>Total</span>
            </div>
            {invoice.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <div>{it.description}</div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {it.quantity} x ETB {it.unitPrice}.00 ({it.department})
                  </div>
                </div>
                <div className="font-bold">ETB {it.total.toLocaleString()}.00</div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="flex items-center justify-between font-black text-sm pt-1">
            <span>TOTAL PAID:</span>
            <span>ETB {invoice.totalAmount.toLocaleString()}.00</span>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
            <div>Shift Cashier: {invoice.cashierName}</div>
            <div className="font-bold text-emerald-800 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              TRANSACTION SETTLED & ARCHIVED
            </div>
            <div className="text-[9px]">Thank you for choosing Faya Primary Hospital</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
