import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { CashierInvoicesView } from '../cashier/CashierInvoicesView';
import { CashierLedgerView } from '../cashier/CashierLedgerView';
import { CashierCBHIClaimsView } from '../cashier/CashierCBHIClaimsView';
import { CashierAnalyticsView } from '../cashier/CashierAnalyticsView';
import { ProcessPaymentModal } from '../modals/ProcessPaymentModal';
import { BillingInvoice } from '../../types';

interface CashierBillingModuleProps {
  onOpenReceiptPrint: (invoiceId: string) => void;
}

export const CashierBillingModule: React.FC<CashierBillingModuleProps> = ({ onOpenReceiptPrint }) => {
  const {
    billingInvoices,
    processInvoicePayment,
    cashierSubView,
    setCashierSubView
  } = useHospital();

  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  return (
    <div className="space-y-4">
      {/* SUBVIEW 1: ACTIVE INVOICES & BILLING */}
      {cashierSubView === 'INVOICES' && (
        <CashierInvoicesView
          invoices={billingInvoices}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
          onOpenReceiptPrint={onOpenReceiptPrint}
        />
      )}

      {/* SUBVIEW 2: TRANSACTION LEDGER */}
      {cashierSubView === 'LEDGER' && (
        <CashierLedgerView
          onOpenReceiptPrint={onOpenReceiptPrint}
        />
      )}

      {/* SUBVIEW 3: CBHI & INSURANCE CLAIMS */}
      {cashierSubView === 'CBHI_CLAIMS' && (
        <CashierCBHIClaimsView
          onOpenReceiptPrint={onOpenReceiptPrint}
        />
      )}

      {/* SUBVIEW 4: SHIFT REVENUE & ANALYTICS */}
      {cashierSubView === 'ANALYTICS' && (
        <CashierAnalyticsView />
      )}

      {/* POS PAYMENT SETTLEMENT MODAL */}
      {selectedInvoice && (
        <ProcessPaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onProcessPayment={processInvoicePayment}
          onOpenReceiptPrint={onOpenReceiptPrint}
        />
      )}
    </div>
  );
};
