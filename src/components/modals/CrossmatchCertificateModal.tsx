import React from 'react';
import { X, Printer, ShieldCheck, Droplet, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { CrossmatchRecord } from '../../types';

interface CrossmatchCertificateModalProps {
  crossmatch: CrossmatchRecord | null;
  onClose: () => void;
}

export const CrossmatchCertificateModal: React.FC<CrossmatchCertificateModalProps> = ({
  crossmatch,
  onClose
}) => {
  if (!crossmatch) return null;

  const isCompatible = crossmatch.crossmatchingResult.includes('Compatible');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Transfusion Compatibility Certificate
              </h3>
              <div className="text-[11px] text-slate-500 font-mono">
                {crossmatch.matchId} • {crossmatch.timestamp}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="p-6 space-y-5 bg-white">
          {/* Institutional Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div>
              <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
                FAYA PRIMARY HOSPITAL
              </h2>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Immunohematology & Transfusion Medicine Unit
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Pre-Transfusion Crossmatching Certificate
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200 block">
                {crossmatch.matchId}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {crossmatch.timestamp}
              </span>
            </div>
          </div>

          {/* Recipient & Blood Unit Profile */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Patient</span>
              <div className="font-bold text-slate-900 text-sm">{crossmatch.patientName}</div>
              <div className="text-slate-600 font-mono text-[11px]">MRN: {crossmatch.mrn}</div>
              <div className="text-slate-700 font-semibold mt-1">
                ABO / Rh(D): <span className="text-rose-700 font-bold">{crossmatch.patientBloodGroup}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Matched Donor Unit</span>
              <div className="font-mono font-bold text-slate-900 text-sm">{crossmatch.matchedUnitId}</div>
              <div className="text-slate-600 text-[11px]">Volume: 450 mL (Whole Blood/PRBC)</div>
              <div className="text-slate-700 font-semibold mt-1">
                4-Pathogen Screened: <span className="text-emerald-700 font-bold">Negative (Cleared)</span>
              </div>
            </div>
          </div>

          {/* Serological Crossmatch Results */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Major & Minor Crossmatch Testing</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                isCompatible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {crossmatch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg">
              <div>• Immediate Spin (IS): <strong>No Agglutination</strong></div>
              <div>• 37°C Incubation (Albumin): <strong>Negative</strong></div>
              <div>• Antihuman Globulin (AHG): <strong>Negative</strong></div>
              <div>• Auto-Control: <strong>Negative</strong></div>
            </div>

            <div className={`p-3 rounded-lg border text-xs font-semibold ${
              isCompatible ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              Serological Result: {crossmatch.crossmatchingResult}
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Verified MLS Technologist</div>
              <div className="font-semibold text-slate-900 mt-0.5">Amanuel Kebede, MLS (Blood Bank Lead)</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Status</div>
              <div className="font-bold text-emerald-700 mt-0.5">✓ Certified for Clinical Release</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
