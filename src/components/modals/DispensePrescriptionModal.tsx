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
  Sparkles,
  MessageSquareQuote
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
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
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
                <span className="font-mono text-[11px] bg-white text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {prescription.rxId}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-800">{prescription.patientName}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-600">{prescription.mrn}</span>
                <span className="text-slate-300">•</span>
                <span>Dr. {prescription.prescriberName} ({prescription.department})</span>
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
          
          {/* Prescribed Medications Card List */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Prescribed Formulations & Live Stock Check ({stockEvaluation.length} Items)
            </div>

            <div className="space-y-2">
              {stockEvaluation.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Drug Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.genericName}
                      </h4>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-medium text-slate-700">{item.dosage}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.frequency}</span>
                      <span className="text-slate-300">•</span>
                      <span>Duration: {item.durationDays} days</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Batch: {item.stockItem?.batchNumber || 'BT-2025-089A'} • Exp: {item.stockItem?.expiryDate || '2026-11-30'}
                    </div>
                  </div>

                  {/* Qty & Stock Availability */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-4">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Required</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">{item.quantity} units</div>
                    </div>

                    <div>
                      {item.isSufficient ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Stock ({item.available})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Low ({item.available})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Medication Counseling Input */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <MessageSquareQuote className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Medication Counseling & Dispensing Instructions:</span>
            </div>
            <input
              type="text"
              value={counselingNotes}
              onChange={(e) => setCounselingNotes(e.target.value)}
              placeholder="Enter patient administration advice, food intake notes, or precautions..."
              className="w-full px-3 py-2 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-lg text-xs bg-white text-slate-900 outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Clinical Safety Verification Checkbox */}
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
            <input
              type="checkbox"
              id="safetyCheck"
              checked={doubleChecked}
              onChange={(e) => setDoubleChecked(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer shrink-0"
            />
            <label htmlFor="safetyCheck" className="text-xs text-emerald-950 font-medium cursor-pointer select-none leading-relaxed">
              <strong>Verified Clinical Dispense:</strong> Drug-drug interactions reviewed, dosage checked against age/renal function, and allergies verified with patient.
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Dispensing Pharmacist: <strong className="text-slate-900">{pharmacistName}</strong></span>
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
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
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
