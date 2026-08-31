import React, { useState } from 'react';
import {
  X,
  Pill,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Printer,
  User,
  Package,
  Clock,
  Sparkles
} from 'lucide-react';
import { Prescription, DrugItem } from '../../types';

interface DispensePrescriptionModalProps {
  prescription: Prescription | null;
  drugInventory: DrugItem[];
  pharmacistName: string;
  onClose: () => void;
  onConfirmDispense: (rxId: string, batchNotes?: string) => void;
  onOpenRxPrint?: (rxId: string) => void;
}

export const DispensePrescriptionModal: React.FC<DispensePrescriptionModalProps> = ({
  prescription,
  drugInventory,
  pharmacistName,
  onClose,
  onConfirmDispense,
  onOpenRxPrint
}) => {
  if (!prescription) return null;

  const [counselingNotes, setCounselingNotes] = useState('Take with meals as prescribed. Complete full course.');
  const [doubleChecked, setDoubleChecked] = useState(true);

  const isAlreadyDispensed = prescription.status === 'Dispensed';

  // Check if any drug in the prescription has insufficient stock
  const stockEvaluation = prescription.items.map((item) => {
    const stockItem = drugInventory.find((d) => d.drugCode === item.drugCode);
    const available = stockItem ? stockItem.stockOnHand : 0;
    const isSufficient = available >= item.quantity;
    return {
      ...item,
      stockItem,
      available,
      isSufficient
    };
  });

  const allInStock = stockEvaluation.every((it) => it.isSufficient);

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allInStock && !isAlreadyDispensed) return;
    onConfirmDispense(prescription.rxId, counselingNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Prescription Dispensing & Stock Verification
                </h3>
                <span className="font-mono text-[11px] bg-white text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                  {prescription.rxId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-800">{prescription.patientName}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{prescription.mrn}</span>
                <span>•</span>
                <span>Prescribed by: {prescription.prescriberName} ({prescription.department})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenRxPrint && (
              <button
                type="button"
                onClick={() => onOpenRxPrint(prescription.rxId)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Print Prescription Slip"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Items Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Prescribed Medications Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-600 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-5">Medication & Strength</span>
              <span className="col-span-3">Dosage & Frequency</span>
              <span className="col-span-2">Required Qty</span>
              <span className="col-span-2 text-right">Stock Status</span>
            </div>

            <div className="divide-y divide-slate-100">
              {stockEvaluation.map((item, idx) => (
                <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white hover:bg-slate-50/50">
                  <div className="col-span-5">
                    <div className="font-bold text-slate-900">{item.genericName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Batch: {item.stockItem?.batchNumber || 'N/A'} • Exp: {item.stockItem?.expiryDate || 'N/A'}
                    </div>
                  </div>

                  <div className="col-span-3 text-slate-700 text-[11px]">
                    <div>{item.dosage}</div>
                    <div className="text-slate-500">{item.frequency} ({item.durationDays} days)</div>
                  </div>

                  <div className="col-span-2 font-mono font-bold text-slate-900 text-sm">
                    {item.quantity} units
                  </div>

                  <div className="col-span-2 text-right">
                    {item.isSufficient ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>In Stock ({item.available})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Low ({item.available})</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Counseling Notes & Verification */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800 text-[11px]">
              Patient Medication Counseling & Dispensing Instructions:
            </label>
            <input
              type="text"
              value={counselingNotes}
              onChange={(e) => setCounselingNotes(e.target.value)}
              placeholder="e.g. Take 1 tablet twice daily after meals..."
              className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs bg-white outline-hidden"
            />
          </div>

          {/* Clinical Safety Double-Check Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="safetyCheck"
              checked={doubleChecked}
              onChange={(e) => setDoubleChecked(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="safetyCheck" className="text-xs text-emerald-950 font-medium cursor-pointer select-none">
              ✓ Verified: Drug-drug interactions reviewed, dosage checked against age/renal function, and allergies verified.
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            Dispensing Pharmacist: <strong className="text-slate-800">{pharmacistName}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            {!isAlreadyDispensed ? (
              <button
                type="button"
                disabled={!allInStock || !doubleChecked}
                onClick={handleDispense}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  allInStock && doubleChecked
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Dispense & Deduct Stock</span>
              </button>
            ) : (
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                Already Dispensed
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
