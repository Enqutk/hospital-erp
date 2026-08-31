import React, { useState, useEffect } from 'react';
import { Bed, X } from 'lucide-react';
import { Patient, Bed as BedType, WardCode } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface DirectAdmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  beds: BedType[];
  initialMrn?: string;
  initialWard?: WardCode;
  initialBed?: string;
  onAdmit: (mrn: string, wardCode: WardCode, bedNumber: string, diagnosis: string, admittingClinician: string) => void;
}

export const DirectAdmitModal: React.FC<DirectAdmitModalProps> = ({
  isOpen,
  onClose,
  patients,
  beds,
  initialMrn,
  initialWard,
  initialBed,
  onAdmit
}) => {
  const [admitMrn, setAdmitMrn] = useState(initialMrn || (patients[0]?.mrn || ''));
  const [admitWard, setAdmitWard] = useState<WardCode>(initialWard || 'PEDIATRICS');
  const [admitBed, setAdmitBed] = useState(initialBed || '');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('Acute Bronchiolitis with Wheezing & Moderate Dehydration');
  const [admittingDoc, setAdmittingDoc] = useState('Dr. Hana Tadesse, MD (Consultant Pediatrician)');

  useEffect(() => {
    if (initialMrn) setAdmitMrn(initialMrn);
    if (initialWard) setAdmitWard(initialWard);
    if (initialBed) setAdmitBed(initialBed);
  }, [initialMrn, initialWard, initialBed]);

  useEffect(() => {
    // If current bed doesn't match ward, auto-select first available bed in that ward
    const avail = beds.filter((b) => b.wardCode === admitWard && b.status === 'Available');
    if (!avail.some((b) => b.bedNumber === admitBed)) {
      setAdmitBed(avail.length > 0 ? avail[0].bedNumber : '');
    }
  }, [admitWard, beds, admitBed]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitBed || !admitMrn) return;
    onAdmit(admitMrn, admitWard, admitBed, admitDiagnosis, admittingDoc);
    onClose();
  };

  const availableBedsInWard = beds.filter((b) => b.wardCode === admitWard && b.status === 'Available');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-4 h-4 text-slate-700" />
            Direct Inpatient Admission
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Select Patient</label>
            <select
              value={admitMrn}
              onChange={(e) => {
                const chosen = e.target.value;
                setAdmitMrn(chosen);
                const pt = patients.find((p) => p.mrn === chosen);
                if (pt) {
                  const age = parseInt(getPatientAge(pt.dob), 10);
                  if (!isNaN(age) && age < 15) {
                    setAdmitWard('PEDIATRICS');
                    setAdmittingDoc('Dr. Hana Tadesse, MD (Consultant Pediatrician)');
                  }
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            >
              {patients.map((p) => (
                <option key={p.mrn} value={p.mrn}>
                  {p.firstName} {p.lastName} ({p.mrn}) — {getPatientAge(p.dob)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Target Ward</label>
              <select
                value={admitWard}
                onChange={(e) => setAdmitWard(e.target.value as WardCode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                {WARDS_LIST.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Available Bed Number</label>
              <select
                value={admitBed}
                onChange={(e) => setAdmitBed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                required
              >
                {availableBedsInWard.length === 0 ? (
                  <option value="">No beds available in {admitWard}</option>
                ) : (
                  availableBedsInWard.map((b) => (
                    <option key={b.bedId} value={b.bedNumber}>
                      {b.bedNumber} {b.oxygenPortAvailable ? '(O2 Port)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Admitting Clinician</label>
            <input
              type="text"
              value={admittingDoc}
              onChange={(e) => setAdmittingDoc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Diagnosis & Admission Directive</label>
            <textarea
              value={admitDiagnosis}
              onChange={(e) => setAdmitDiagnosis(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!admitBed}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              Confirm Admission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
