import React from 'react';
import { X, Printer, FlaskConical, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LabOrder } from '../../types';

interface LabReportPrintModalProps {
  labOrder: LabOrder | null;
  onClose: () => void;
}

export const LabReportPrintModal: React.FC<LabReportPrintModalProps> = ({ labOrder, onClose }) => {
  if (!labOrder) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 print:hidden">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-slate-800" />
            Official Diagnostic Laboratory Certificate & Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Lab Report */}
        <div className="border-2 border-slate-300 rounded-xl p-6 bg-white space-y-4 printable-content">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 uppercase">
                FAYA PRIMARY HOSPITAL
              </div>
              <div className="text-[11px] text-slate-700 font-bold uppercase tracking-wider">
                Department of Laboratory Medicine & Pathology
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ISO 15189 Accredited Clinical Diagnostic Facility
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-1 rounded block">
                {labOrder.sampleIdBarcode}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Order: {labOrder.labOrderId}
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Patient Name:</span>
              <div className="font-bold text-slate-900 text-sm">{labOrder.patientName}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Medical Record No:</span>
              <div className="font-mono font-bold text-slate-900">{labOrder.mrn}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Requesting Clinician:</span>
              <div className="font-semibold text-slate-800">{labOrder.orderedBy}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Collection Time:</span>
              <div className="font-mono text-slate-700">{labOrder.collectionDateTime}</div>
            </div>
          </div>

          {/* Test Name & Results Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-sm bg-slate-100 p-2 rounded border border-slate-200 flex items-center justify-between">
              <span>Test: {labOrder.testName} ({labOrder.testCode})</span>
              <span className="text-xs font-mono font-bold text-slate-900">{labOrder.verificationStatus}</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase">
                <span className="col-span-5">Investigation Assay</span>
                <span className="col-span-3">Observed Value</span>
                <span className="col-span-2">Unit</span>
                <span className="col-span-2">Biological Ref</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {labOrder.results.map((res, idx) => (
                  <div key={idx} className="px-3 py-2 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 font-bold text-slate-900">{res.parameter}</div>
                    <div className={`col-span-3 font-mono font-bold ${res.isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                      {res.value} {res.isCritical && '(!)'}
                    </div>
                    <div className="col-span-2 font-mono text-slate-500 text-[11px]">{res.unit}</div>
                    <div className="col-span-2 font-mono text-slate-600 text-[11px]">{res.referenceRange}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 flex items-end justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-500">
                Verified Tech ID: <strong>{labOrder.verifyingTechId}</strong>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Electronic Signature Verified
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif italic text-slate-900 text-sm font-bold border-b border-slate-400 pb-1 px-4">
                Sr. MLS Lab Technologist
              </div>
              <div className="text-[10px] text-slate-600 font-bold uppercase">
                Chief of Laboratory Services Stamp
              </div>
            </div>
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
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Lab Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
