import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { IPDAdmission, Bed as BedType, WardCode } from '../../../types';
import { WARDS_LIST } from '../types';

interface TransferBedModalProps {
  admission: IPDAdmission | null;
  beds: BedType[];
  onClose: () => void;
  onTransfer: (admissionId: string, targetWard: WardCode, targetBed: string, reason: string) => void;
}

export const TransferBedModal: React.FC<TransferBedModalProps> = ({
  admission,
  beds,
  onClose,
  onTransfer
}) => {
  const [targetWard, setTargetWard] = useState<WardCode>('ICU');
  const [targetBed, setTargetBed] = useState('ICU-02');
  const [transferReason, setTransferReason] = useState('Clinical escalation requiring high-dependency respiratory monitoring');

  useEffect(() => {
    if (admission) {
      // Pick a ward different from current ward if possible
      const differentWard = WARDS_LIST.find((w) => w.code !== admission.wardCode)?.code || 'ICU';
      setTargetWard(differentWard);
      const avail = beds.filter((b) => b.wardCode === differentWard && b.status === 'Available');
      setTargetBed(avail.length > 0 ? avail[0].bedNumber : '');
    }
  }, [admission, beds]);

  if (!admission) return null;

  const availableBedsInTarget = beds.filter((b) => b.wardCode === targetWard && b.status === 'Available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBed) return;
    onTransfer(admission.admissionId, targetWard, targetBed, transferReason);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-slate-700" />
            Inter-Ward Bed Transfer
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 text-sm">{admission.patientName}</div>
          <div className="text-slate-500 font-mono text-[11px]">
            Current: <strong className="text-slate-800">{admission.wardName} (Bed #{admission.bedNumber})</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Destination Ward</label>
            <select
              value={targetWard}
              onChange={(e) => {
                const newWard = e.target.value as WardCode;
                setTargetWard(newWard);
                const avail = beds.filter((b) => b.wardCode === newWard && b.status === 'Available');
                setTargetBed(avail.length > 0 ? avail[0].bedNumber : '');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            >
              {WARDS_LIST.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name} ({beds.filter((b) => b.wardCode === w.code && b.status === 'Available').length} Available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Target Available Bed</label>
            <select
              value={targetBed}
              onChange={(e) => setTargetBed(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            >
              {availableBedsInTarget.length === 0 ? (
                <option value="">No beds available in {targetWard}</option>
              ) : (
                availableBedsInTarget.map((b) => (
                  <option key={b.bedId} value={b.bedNumber}>
                    {b.bedNumber} {b.oxygenPortAvailable ? '(Oxygen Port Active)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Transfer Clinical Rationale</label>
            <textarea
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
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
              disabled={!targetBed}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
