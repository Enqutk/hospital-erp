import React, { useState, useEffect } from 'react';
import {
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

interface LabResultEntryViewProps {
  labOrders: LabOrder[];
  selectedLabOrderId: string;
  onSelectOrder: (order: LabOrder) => void;
  onVerifyResults: (labOrderId: string, results: LabOrder['results'], isCritical: boolean) => void;
  onOpenLabPrint: (labOrderId: string) => void;
  verifyingTechName: string;
}

export const LabResultEntryView: React.FC<LabResultEntryViewProps> = ({
  labOrders,
  selectedLabOrderId,
  onSelectOrder,
  onVerifyResults,
  onOpenLabPrint,
  verifyingTechName
}) => {
  const activeOrder = labOrders.find((o) => o.labOrderId === selectedLabOrderId) || labOrders[0];
  const [resultsState, setResultsState] = useState<LabOrder['results']>(activeOrder ? activeOrder.results : []);

  useEffect(() => {
    if (activeOrder) {
      setResultsState(activeOrder.results);
    }
  }, [activeOrder?.labOrderId]);

  if (!activeOrder) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
        <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <div className="font-semibold text-slate-600">No laboratory orders available for result entry.</div>
      </div>
    );
  }

  const handleVerify = (isCritical: boolean) => {
    onVerifyResults(activeOrder.labOrderId, resultsState, isCritical);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Left: Quick Order Selection Strip */}
      <div className="lg:col-span-4 space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs">Active Worklist</span>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {labOrders.length} orders
            </span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {labOrders.map((order) => {
              const isSelected = order.labOrderId === activeOrder.labOrderId;
              const isCritical = order.verificationStatus === 'Critical Alert';
              const isVerified = order.verificationStatus === 'Verified';

              return (
                <div
                  key={order.labOrderId}
                  onClick={() => onSelectOrder(order)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">
                      {order.patientName}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isVerified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.verificationStatus}
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px] font-medium truncate">
                    {order.testName}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                    <span>{order.sampleIdBarcode}</span>
                    <span>{order.mrn}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Parametric Result Entry & Validation Sheet */}
      <div className="lg:col-span-8 space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{activeOrder.testName}</h3>
                <span className="font-mono text-[11px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                  {activeOrder.sampleIdBarcode}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Patient: <strong className="text-slate-800">{activeOrder.patientName}</strong> ({activeOrder.mrn}) • Ordered by: {activeOrder.orderedBy}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenLabPrint(activeOrder.labOrderId)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>

          {/* Parametric Result Entry Form Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-600 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-4">Analyte / Parameter</span>
              <span className="col-span-4">Measured Result Value</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-2 text-right">Reference Range</span>
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

          {/* Validation & Sign-off Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Verifying Scientist: <strong className="text-slate-800">{verifyingTechName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVerify(true)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag Panic / Critical</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerify(false)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Sign Results</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
