import React from 'react';
import { X, Printer, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import { Prescription } from '../../types';

interface PrescriptionPrintModalProps {
  prescription: Prescription | null;
  onClose: () => void;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({ prescription, onClose }) => {
  if (!prescription) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 print:hidden">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            Official Hospital E-Prescription Form
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Rx Document */}
        <div className="border-2 border-slate-300 rounded-xl p-6 bg-white space-y-4 printable-content">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-3">
            <div className="text-lg font-black tracking-tight text-slate-900 uppercase">
              FAYA PRIMARY HOSPITAL
            </div>
            <div className="text-[11px] text-slate-600">
              Department of Outpatient & Inpatient Clinical Medicine
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Official Medical Prescription • Rx No: {prescription.rxId}
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Patient Name:</span>
              <div className="font-bold text-slate-900">{prescription.patientName}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Medical Record No:</span>
              <div className="font-mono font-bold text-slate-900">{prescription.mrn}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Prescriber:</span>
              <div className="font-semibold text-slate-800">{prescription.prescriberName}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Date & Department:</span>
              <div className="font-mono text-slate-700">{prescription.createdAt} ({prescription.department})</div>
            </div>
          </div>

          {/* Rx Symbol & Items */}
          <div className="space-y-3">
            <div className="font-serif italic font-black text-2xl text-emerald-800">℞</div>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {prescription.items.map((item, idx) => (
                <div key={idx} className="p-3 space-y-1 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {item.genericName}
                    </span>
                    <span className="font-mono font-bold text-slate-800">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-slate-700 text-[11px]">
                    <strong>Sig / Dosage:</strong> {item.dosage} — {item.frequency} for {item.durationDays} days.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriber Signature */}
          <div className="pt-6 flex items-end justify-between text-xs">
            <div className="text-[10px] text-slate-400">
              Generated via FPH Integrated Hospital ERP
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif italic text-teal-800 text-sm font-bold border-b border-slate-400 pb-1 px-4">
                {prescription.prescriberName}
              </div>
              <div className="text-[10px] text-slate-600 font-bold uppercase">
                Licensed Clinician Signature & Stamp
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>
    </div>
  );
};
