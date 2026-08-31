import React, { useState } from 'react';
import { X, Printer, Shield, CreditCard, Droplet, Phone, Calendar, HeartPulse } from 'lucide-react';
import { Patient } from '../../types';
import { calculateAge } from '../../utils/opdRouting';

interface PatientCardPrintModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientCardPrintModal: React.FC<PatientCardPrintModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  const [cardTheme, setCardTheme] = useState<'DARK' | 'LIGHT'>('DARK');
  const age = calculateAge(patient.dob);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Patient Identification Card</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setCardTheme('DARK')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  cardTheme === 'DARK' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Executive
              </button>
              <button
                type="button"
                onClick={() => setCardTheme('LIGHT')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  cardTheme === 'LIGHT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paper / Print
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/60 print:p-0 print:bg-transparent">
          
          {/* CR-80 Standard ID Card Container */}
          <div
            id="printable-patient-id-card"
            className={`w-full max-w-md rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all print:shadow-none print:border-2 ${
              cardTheme === 'DARK'
                ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white border border-slate-700'
                : 'bg-white text-slate-900 border-2 border-emerald-700'
            }`}
            style={{ minHeight: '260px' }}
          >
            {/* Background Security Watermark */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

            {/* Card Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
              cardTheme === 'DARK' ? 'border-slate-800' : 'border-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-xs shadow-xs">
                  FP
                </div>
                <div>
                  <div className={`font-black text-xs tracking-tight ${
                    cardTheme === 'DARK' ? 'text-white' : 'text-emerald-950'
                  }`}>
                    FAYA PRIMARY HOSPITAL
                  </div>
                  <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                    Official Medical Health Card
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-500 opacity-80" />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  cardTheme === 'DARK' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  CR80
                </span>
              </div>
            </div>

            {/* Card Body: Photo & Demographics */}
            <div className="flex gap-3.5 items-start">
              {/* Framed Photo with Chip Indicator */}
              <div className="relative shrink-0">
                <img
                  src={patient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}
                  alt={patient.firstName}
                  className={`w-20 h-22 rounded-xl object-cover shadow-sm ${
                    cardTheme === 'DARK' ? 'border-2 border-emerald-500/60' : 'border-2 border-emerald-700'
                  }`}
                />
                {patient.bloodGroup && (
                  <span className="absolute -bottom-2 -right-1 bg-rose-600 text-white font-black font-mono text-[10px] px-1.5 py-0.2 rounded-md shadow-xs border border-white">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>

              {/* Patient Demographics */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className={`font-extrabold text-sm leading-snug truncate ${
                  cardTheme === 'DARK' ? 'text-white' : 'text-slate-900'
                }`}>
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </div>

                <div className="inline-block font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-2 py-0.5 rounded-md">
                  MRN: {patient.mrn}
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Age / Gender</span>
                    <span className={`font-semibold ${cardTheme === 'DARK' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {age} yrs • {patient.gender}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Payer Class</span>
                    <span className="font-semibold text-emerald-400 truncate block">
                      {patient.payerClass.split(' ')[0]}
                    </span>
                  </div>

                  <div className="col-span-2 pt-0.5">
                    <span className="text-[10px] text-slate-400 block font-medium">Phone</span>
                    <span className={`font-mono font-medium ${cardTheme === 'DARK' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {patient.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer: SVG Code-128 Barcode */}
            <div className={`mt-3.5 pt-2.5 border-t flex items-end justify-between ${
              cardTheme === 'DARK' ? 'border-slate-800' : 'border-emerald-200'
            }`}>
              <div className="space-y-0.5">
                {/* SVG Crisp Realistic Barcode */}
                <svg className="h-6 w-36" viewBox="0 0 140 30" fill="currentColor">
                  {/* Realistic Code 128 pattern */}
                  <rect x="0" y="0" width="3" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="5" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="8" y="0" width="4" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="14" y="0" width="2" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="18" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="22" y="0" width="3.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="28" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="31" y="0" width="5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="38" y="0" width="2" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="42" y="0" width="3" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="47" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="51" y="0" width="4" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="57" y="0" width="2" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="61" y="0" width="3.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="67" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="71" y="0" width="4.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="78" y="0" width="2" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="82" y="0" width="3" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="87" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="91" y="0" width="4" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="97" y="0" width="2.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="102" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="106" y="0" width="4" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="112" y="0" width="2" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="116" y="0" width="3.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="122" y="0" width="1.5" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                  <rect x="126" y="0" width="3" height="24" className={cardTheme === 'DARK' ? 'fill-slate-100' : 'fill-slate-900'} />
                </svg>
                <div className={`font-mono text-[9px] ${cardTheme === 'DARK' ? 'text-slate-400' : 'text-slate-500'}`}>
                  *{patient.mrn}*
                </div>
              </div>

              <div className="text-right">
                <div className={`text-[9px] font-mono ${cardTheme === 'DARK' ? 'text-slate-400' : 'text-slate-500'}`}>
                  VALID AT ALL CLINICS
                </div>
                <div className="text-[9px] text-emerald-500 font-medium">
                  ISO/IEC 7810 ID-1 Standard
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between print:hidden">
          <div className="text-[11px] text-slate-500">
            Supports Standard PVC Card & Laser Printers
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-all cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ID Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
