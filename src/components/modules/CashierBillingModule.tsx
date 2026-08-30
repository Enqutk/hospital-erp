import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Printer,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  User,
  Wallet
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { BillingInvoice, PaymentMethod } from '../../types';

interface CashierBillingModuleProps {
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const CashierBillingModule: React.FC<CashierBillingModuleProps> = ({ onOpenReceiptPrint }) => {
  const {
    billingInvoices,
    processInvoicePayment,
    patients,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser
  } = useHospital();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(billingInvoices[0]?.invoiceId || '');
  const activeInvoice = billingInvoices.find((i) => i.invoiceId === selectedInvoiceId) || billingInvoices[0];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [filterPayer, setFilterPayer] = useState<string>('ALL');

  const handleProcessPayment = () => {
    if (!activeInvoice) return;
    const ref = transactionRef || (paymentMethod === 'Cash' ? 'CASH-REC-' + Date.now().toString().slice(-4) : 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    processInvoicePayment(activeInvoice.invoiceId, paymentMethod, ref);
    setTransactionRef('');
  };

  // Shift reconciliations
  const totalRevenue = billingInvoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cashRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && i.paymentMethod === 'Cash')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const mobileRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && (i.paymentMethod === 'Telebirr' || i.paymentMethod === 'CBE Birr'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const insuranceRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && (i.paymentMethod === 'CBHI Insurance' || i.paymentMethod === 'Private Insurance'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingUnpaidTotal = billingInvoices
    .filter((i) => i.status === 'Pending' || i.status === 'Insurance Pending')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const filteredInvoices = billingInvoices.filter((inv) => {
    if (filterPayer === 'ALL') return true;
    return inv.payerClass === filterPayer;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded border border-teal-200">
              Station 1 of 1
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Hospital Cashier, Point-of-Sale (POS) & CBHI Insurance Claims
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Generates aggregated itemized invoices from clinical orders (OPD, IPD, Lab, Rad, Rx), supports multiple payment gateways (Telebirr, CBE Birr, Cash), processes Community Based Health Insurance (CBHI), and reconciles shift revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-teal-50 border border-teal-200 text-teal-900 px-3 py-2 rounded-xl">
          <Wallet className="w-4 h-4 text-teal-600" />
          <span>Shift Cashier: {currentUser.name}</span>
        </div>
      </div>

      {/* Shift Revenue Reconciliation KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Shift Revenue</div>
          <div className="text-xl font-black text-slate-900 mt-1">ETB {totalRevenue.toLocaleString()}.00</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">All Cleared Invoices</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Physical Cash Drawer</div>
          <div className="text-xl font-black text-emerald-700 mt-1">ETB {cashRevenue.toLocaleString()}.00</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Counted in Register</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Mobile (Telebirr/CBE)</div>
          <div className="text-xl font-black text-blue-700 mt-1">ETB {mobileRevenue.toLocaleString()}.00</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Digital POS Gateway</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">CBHI & Insurance</div>
          <div className="text-xl font-black text-teal-700 mt-1">ETB {insuranceRevenue.toLocaleString()}.00</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Government / Corporate</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Receivables</div>
          <div className="text-xl font-black text-amber-700 mt-1">ETB {pendingUnpaidTotal.toLocaleString()}.00</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Unpaid Service Orders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Invoice Worklist (Left) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Hospital Billing Invoices</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                {billingInvoices.length} Invoices
              </span>
            </div>

            {/* Payer Class Filter */}
            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {['ALL', 'Cash-Paying', 'CBHI Insurance', 'Private Insurance'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterPayer(cls)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    filterPayer === cls ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls === 'ALL' ? 'All Payers' : cls.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Invoice List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceId === inv.invoiceId;
                const isPaid = inv.status === 'Paid';

                return (
                  <div
                    key={inv.invoiceId}
                    onClick={() => setSelectedInvoiceId(inv.invoiceId)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{inv.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.invoiceId} | MRN: {inv.mrn}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {inv.payerClass}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ETB {inv.totalAmount.toLocaleString()}.00
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{inv.items.length} Chargeable Items</span>
                      <span>{inv.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Itemized Invoice Details & Point of Sale Settlement (Right) */}
        <div className="lg:col-span-7 space-y-4">
          {activeInvoice ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
              
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">
                      Invoice #{activeInvoice.invoiceId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        activeInvoice.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeInvoice.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Patient: <strong>{activeInvoice.patientName}</strong> (MRN: {activeInvoice.mrn}) • Payer: {activeInvoice.payerClass}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenReceiptPrint(activeInvoice.invoiceId)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Receipt</span>
                </button>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider">
                  <span className="col-span-6">Service / Order Item</span>
                  <span className="col-span-2">Department</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Total (ETB)</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {activeInvoice.items.map((item) => (
                    <div key={item.id} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-6 font-bold text-slate-900">{item.description}</div>
                      <div className="col-span-2">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {item.department}
                        </span>
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold text-slate-700">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                        ETB {item.total.toLocaleString()}.00
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal / Total Bar */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700">Net Payable Total:</div>
                  <div className="text-lg font-black text-teal-800 font-mono">
                    ETB {activeInvoice.totalAmount.toLocaleString()}.00
                  </div>
                </div>
              </div>

              {/* Payment Processing Form */}
              {activeInvoice.status !== 'Paid' ? (
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3.5 text-xs">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    Process Payment & Issue Official Receipt
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Cash', label: 'Physical Cash', icon: DollarSign },
                      { id: 'Telebirr', label: 'Telebirr QR/App', icon: Smartphone },
                      { id: 'CBE Birr', label: 'CBE Birr / Mobile', icon: Smartphone },
                      { id: 'CBHI Insurance', label: 'CBHI Claim (100%)', icon: ShieldCheck }
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Transaction Ref / Telebirr Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Transaction Reference / Auth Code
                      </label>
                      <input
                        type="text"
                        placeholder={paymentMethod === 'Cash' ? 'Auto-generated Cash Voucher' : 'e.g. TLB-99882233 / CBHI-CLAIM-2025'}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Payment & Clear Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Invoice Paid & Settled in Full
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      Method: <strong>{activeInvoice.paymentMethod}</strong> • Ref: <span className="font-mono">{activeInvoice.transactionRef}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Shift Cashier: {activeInvoice.cashierName}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400">
              Select an invoice from the worklist to process payment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
