import React, { useState, useEffect } from 'react';
import { Bed, X } from 'lucide-react';
import { DoctorAdmissionOrder, Bed as BedType, WardCode } from '../../../types';
import { WARDS_LIST } from '../types';

interface AllocateBedModalProps {
  order: DoctorAdmissionOrder | null;
  beds: BedType[];
  onClose: () => void;
  onConfirm: (orderId: string, wardCode: WardCode, bedNumber: string) => void;
}

export const AllocateBedModal: React.FC<AllocateBedModalProps> = ({
  order,
  beds,
  onClose,
  onConfirm
}) => {
  const [allocWard, setAllocWard] = useState<WardCode>('GW-MALE');
  const [allocBed, setAllocBed] = useState('');

  useEffect(() => {
    if (order) {
      setAllocWard(order.recommendedWard);
      const firstAvail = beds.find((b) => b.wardCode === order.recommendedWard && b.status === 'Available');
      setAllocBed(firstAvail ? firstAvail.bedNumber : '');
    }
  }, [order, beds]);

  if (!order) return null;

  const availableBedsInWard = beds.filter((b) => b.wardCode === allocWard && b.status === 'Available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocBed) return;
    onConfirm(order.orderId, allocWard, allocBed);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-4 h-4 text-slate-700" />
            Allocate Inpatient Bed
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
          <div className="font-bold text-slate-900 text-sm">{order.patientName}</div>
          <div className="text-slate-500 font-mono text-[11px]">MRN: {order.mrn} • Priority: {order.clinicalPriority}</div>
          <div className="text-slate-700 text-xs pt-1"><span className="font-medium text-slate-500">Diagnosis:</span> {order.diagnosis}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Target Ward</label>
            <select
              value={allocWard}
              onChange={(e) => {
                const newWard = e.target.value as WardCode;
                setAllocWard(newWard);
                const av = beds.filter((b) => b.wardCode === newWard && b.status === 'Available');
                setAllocBed(av.length > 0 ? av[0].bedNumber : '');
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
            <label className="block font-semibold text-slate-700 mb-1.5">Available Bed Number</label>
            <select
              value={allocBed}
              onChange={(e) => setAllocBed(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            >
              {availableBedsInWard.length === 0 ? (
                <option value="">No beds currently available in this ward</option>
              ) : (
                availableBedsInWard.map((b) => (
                  <option key={b.bedId} value={b.bedNumber}>
                    {b.bedNumber} {b.oxygenPortAvailable ? '(Oxygen Port Active)' : ''}
                  </option>
                ))
              )}
            </select>
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
              disabled={!allocBed}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              Confirm Bed Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
