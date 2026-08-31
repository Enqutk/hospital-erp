import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Barcode,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { LabOrder } from '../../types';

interface LabResultEntryModalProps {
  labOrder: LabOrder | null;
  onClose: () => void;
  onVerifyResults: (labOrderId: string, results: LabOrder['results'], isCritical: boolean) => void;
  onOpenLabPrint?: (labOrderId: string) => void;
  verifyingTechName: string;
}

export const LabResultEntryModal: React.FC<LabResultEntryModalProps> = ({
  labOrder,
  onClose,
  onVerifyResults,
  onOpenLabPrint,
  verifyingTechName
}) => {
  if (!labOrder) return null;

  const [resultsState, setResultsState] = useState<LabOrder['results']>(labOrder.results || []);

  useEffect(() => {
    if (labOrder) {
      setResultsState(labOrder.results || []);
    }
  }, [labOrder.labOrderId]);

  const handleVerify = (isCritical: boolean) => {
    onVerifyResults(labOrder.labOrderId, resultsState, isCritical);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {labOrder.testName}
                </h3>
                <span className="font-mono text-[11px] bg-white text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                  {labOrder.sampleIdBarcode}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-800">{labOrder.patientName}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{labOrder.mrn}</span>
                <span>•</span>
                <span>Ordered by: {labOrder.orderedBy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenLabPrint && (
              <button
                type="button"
                onClick={() => onOpenLabPrint(labOrder.labOrderId)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Print Report"
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

        {/* Modal Scrollable Body: Parametric Table */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-600 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-4">Analyte / Parameter</span>
              <span className="col-span-4">Measured Result Value</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-2 text-right">Reference</span>
            </div>

            <div className="divide-y divide-slate-100">
              {resultsState.map((res, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2.5 grid grid-cols-12 gap-2 items-center ${
                    res.isCritical ? 'bg-rose-50/70' : res.isAbnormal ? 'bg-amber-50/50' : 'bg-white'
                  }`}
                >
                  <div className="col-span-4 font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>{res.parameter}</span>
                    {res.isCritical && (
                      <span className="text-[9px] bg-rose-600 text-white font-bold px-1 rounded">
                        PANIC
                      </span>
                    )}
                  </div>

                  <div className="col-span-4">
                    <input
                      type="text"
                      value={res.value}
                      onChange={(e) => {
                        const updated = [...resultsState];
                        updated[idx].value = e.target.value;
                        setResultsState(updated);
                      }}
                      className="w-full px-2.5 py-1 border border-slate-200 focus:border-emerald-600 rounded-md font-mono font-bold text-xs bg-white outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 font-mono text-slate-500 text-[11px]">{res.unit}</div>
                  <div className="col-span-2 font-mono text-slate-600 text-[11px] text-right">{res.referenceRange}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            Verifying Scientist: <strong className="text-slate-800">{verifyingTechName}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleVerify(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag Panic Alert</span>
            </button>

            <button
              type="button"
              onClick={() => handleVerify(false)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify & Sign Results</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
