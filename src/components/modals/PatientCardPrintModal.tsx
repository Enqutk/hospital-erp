import React from 'react';
import { X, Printer, Barcode, ShieldCheck, HeartPulse, Building } from 'lucide-react';
import { Patient } from '../../types';

interface PatientCardPrintModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientCardPrintModal: React.FC<PatientCardPrintModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 print:hidden">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-teal-600" />
            Print Patient Registration Card & Wristband
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card */}
        <div className="border-2 border-teal-700 rounded-xl p-5 bg-teal-50/20 space-y-4 printable-content">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-teal-200 pb-3">
            <div>
              <div className="font-extrabold text-teal-900 text-sm tracking-tight">FAYA PRIMARY HOSPITAL</div>
              <div className="text-[10px] text-teal-700">Official Patient Identification Card & Wristband</div>
            </div>
            <span className="font-mono font-bold text-xs bg-teal-800 text-white px-2 py-1 rounded">
              {patient.mrn}
            </span>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Full Patient Name</div>
              <div className="font-bold text-slate-900 text-sm">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Age / Gender</div>
              <div className="font-bold text-slate-900">
                {patient.age} Yrs • {patient.gender}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Primary Phone</div>
              <div className="font-mono font-bold text-slate-800">{patient.phone}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Blood Group & Rh</div>
              <div className="font-bold text-rose-700 font-mono">{patient.bloodGroup || 'Unspecified'}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Payer / Insurance Class</div>
              <div className="font-bold text-teal-800">{patient.payerClass}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Registration Date</div>
              <div className="font-mono text-slate-700">{patient.registeredAt}</div>
            </div>
          </div>

          {/* Allergies Highlight */}
          {patient.allergies.length > 0 && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-bold">
              ⚠️ ALLERGY ALERT: {patient.allergies.join(', ')}
            </div>
          )}

          {/* Simulated Barcode */}
          <div className="pt-3 border-t border-teal-200 text-center space-y-1">
            <div className="font-mono text-xl tracking-[0.3em] font-black text-slate-900">
              ||| | |||| | ||| |||| | |||||
            </div>
            <div className="font-mono text-[10px] text-slate-500">*{patient.mrn}*</div>
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Patient Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
