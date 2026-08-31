import React, { useState } from 'react';
import { Inbox, X } from 'lucide-react';
import { Patient, WardCode, UserAccount } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface CreateBedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  currentUser: UserAccount;
  initialMrn?: string;
  onCreateOrder: (orderData: {
    mrn: string;
    patientName: string;
    ageGender?: string;
    orderingDoctor: string;
    sourceDepartment: 'OPD Clinic' | 'Emergency & Trauma' | 'Surgical OT' | 'Specialist Clinic';
    sourceLocation: string;
    recommendedWard: WardCode;
    clinicalPriority: 'Routine' | 'Urgent' | 'Emergency / Stat';
    diagnosis: string;
    requiresOxygen: boolean;
    guardianPresent?: string;
    notes?: string;
  }) => void;
}

export const CreateBedOrderModal: React.FC<CreateBedOrderModalProps> = ({
  isOpen,
  onClose,
  patients,
  currentUser,
  initialMrn,
  onCreateOrder
}) => {
  const [orderMrn, setOrderMrn] = useState(initialMrn || (patients[0]?.mrn || ''));
  const [orderWard, setOrderWard] = useState<WardCode>('GW-MALE');
  const [orderPriority, setOrderPriority] = useState<'Routine' | 'Urgent' | 'Emergency / Stat'>('Urgent');
  const [orderOxygen, setOrderOxygen] = useState(false);
  const [orderDiag, setOrderDiag] = useState('Acute Exacerbation of Peptic Ulcer Disease');
  const [orderDoctor, setOrderDoctor] = useState(currentUser.name || 'Dr. Sarah Jenkins, MD');
  const [orderSource, setOrderSource] = useState<'OPD Clinic' | 'Emergency & Trauma' | 'Surgical OT' | 'Specialist Clinic'>('OPD Clinic');
  const [orderSourceLoc, setOrderSourceLoc] = useState('Station 1 - General Medicine');
  const [orderNotes, setOrderNotes] = useState('Immediate bed admission for continuous IV infusion and close monitoring.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = patients.find((p) => p.mrn === orderMrn);
    const patientName = pt ? `${pt.firstName} ${pt.lastName}` : 'Patient';
    const ageGender = pt ? `${getPatientAge(pt.dob)}, ${pt.gender}` : undefined;
    const isChild = orderWard === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt.dob), 10) < 15);
    const guardian = isChild ? pt?.emergencyContactName || 'Parent Present' : undefined;

    onCreateOrder({
      mrn: orderMrn,
      patientName,
      ageGender,
      orderingDoctor: orderDoctor,
      sourceDepartment: orderSource,
      sourceLocation: orderSourceLoc,
      recommendedWard: orderWard,
      clinicalPriority: orderPriority,
      diagnosis: orderDiag,
      requiresOxygen: orderOxygen,
      guardianPresent: guardian,
      notes: orderNotes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-700" />
            New Doctor Bed Admission Order
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
              value={orderMrn}
              onChange={(e) => {
                const chosen = e.target.value;
                setOrderMrn(chosen);
                const pt = patients.find((p) => p.mrn === chosen);
                if (pt) {
                  const age = parseInt(getPatientAge(pt.dob), 10);
                  if (!isNaN(age) && age < 15) {
                    setOrderWard('PEDIATRICS');
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
              <label className="block font-semibold text-slate-700 mb-1.5">Source Department</label>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                <option value="OPD Clinic">OPD Clinic</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Surgical OT">Surgical OT</option>
                <option value="Specialist Clinic">Specialist Clinic</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Origin Location</label>
              <input
                type="text"
                value={orderSourceLoc}
                onChange={(e) => setOrderSourceLoc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Recommended Ward</label>
              <select
                value={orderWard}
                onChange={(e) => setOrderWard(e.target.value as WardCode)}
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
              <label className="block font-semibold text-slate-700 mb-1.5">Clinical Priority</label>
              <select
                value={orderPriority}
                onChange={(e) => setOrderPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency / Stat">Emergency / Stat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Ordering Doctor</label>
            <input
              type="text"
              value={orderDoctor}
              onChange={(e) => setOrderDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Admission Diagnosis</label>
            <textarea
              value={orderDiag}
              onChange={(e) => setOrderDiag(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Doctor Notes & Treatment Directives</label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="orderO2"
              checked={orderOxygen}
              onChange={(e) => setOrderOxygen(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-500 w-4 h-4"
            />
            <label htmlFor="orderO2" className="text-slate-800 font-semibold text-xs cursor-pointer">
              Requires Inpatient Bed with Active Oxygen Port
            </label>
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              Submit Bed Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
