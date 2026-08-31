import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Droplet,
  User,
  CheckCircle2,
  AlertTriangle,
  Save,
  Plus
} from 'lucide-react';
import { Patient, BloodUnit, CrossmatchRecord } from '../../types';

interface CrossmatchModalProps {
  crossmatch: CrossmatchRecord | null; // null means new crossmatch
  patients: Patient[];
  bloodUnits: BloodUnit[];
  selectedPatientMrn: string | null;
  onClose: () => void;
  onSave: (data: {
    mrn: string;
    matchedUnitId: string;
    crossmatchingResult: 'Compatible (No Agglutination)' | 'Incompatible';
    status: 'Cleared for Transfusion' | 'Testing' | 'Rejected';
  }) => void;
}

export const CrossmatchModal: React.FC<CrossmatchModalProps> = ({
  crossmatch,
  patients,
  bloodUnits,
  selectedPatientMrn,
  onClose,
  onSave
}) => {
  const isEditing = !!crossmatch;

  const [mrn, setMrn] = useState(
    crossmatch?.mrn || selectedPatientMrn || patients[0]?.mrn || ''
  );
  const [matchedUnitId, setMatchedUnitId] = useState(
    crossmatch?.matchedUnitId || bloodUnits[0]?.unitId || ''
  );
  const [crossmatchingResult, setCrossmatchingResult] = useState<
    'Compatible (No Agglutination)' | 'Incompatible'
  >(
    (crossmatch?.crossmatchingResult as any) === 'Incompatible'
      ? 'Incompatible'
      : 'Compatible (No Agglutination)'
  );

  useEffect(() => {
    if (crossmatch) {
      setMrn(crossmatch.mrn);
      setMatchedUnitId(crossmatch.matchedUnitId);
      setCrossmatchingResult(
        crossmatch.crossmatchingResult === 'Incompatible'
          ? 'Incompatible'
          : 'Compatible (No Agglutination)'
      );
    }
  }, [crossmatch]);

  const selectedPatient = patients.find((p) => p.mrn === mrn) || patients[0];
  const selectedUnit = bloodUnits.find((u) => u.unitId === matchedUnitId) || bloodUnits[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrn || !matchedUnitId) return;

    const computedStatus =
      crossmatchingResult === 'Compatible (No Agglutination)'
        ? 'Cleared for Transfusion'
        : 'Rejected';

    onSave({
      mrn,
      matchedUnitId,
      crossmatchingResult,
      status: computedStatus
    });

    onClose();
  };

  const isCompatible = crossmatchingResult === 'Compatible (No Agglutination)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEditing ? `Edit Crossmatch: ${crossmatch.matchId}` : 'New Transfusion Crossmatch Request'}
              </h3>
              <div className="text-[11px] text-slate-500">
                Major & minor agglutination compatibility serology
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Recipient Patient *</label>
            <select
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.mrn} value={p.mrn}>
                  {p.firstName} {p.lastName} ({p.mrn}) — ABO/Rh: {p.bloodGroup || 'Unspecified'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Matched Blood Bag *</label>
              <select
                value={matchedUnitId}
                onChange={(e) => setMatchedUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-bold text-slate-800"
              >
                {bloodUnits.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.unitId} ({u.bloodGroup})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serology Finding *</label>
              <select
                value={crossmatchingResult}
                onChange={(e) => setCrossmatchingResult(e.target.value as any)}
                className={`w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-semibold bg-slate-50 focus:bg-white outline-hidden cursor-pointer ${
                  isCompatible ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                <option value="Compatible (No Agglutination)">Compatible (No Agglutination)</option>
                <option value="Incompatible">Incompatible (Agglutination Flagged)</option>
              </select>
            </div>
          </div>

          {/* Compatibility Clearance Banner */}
          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              isCompatible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs">
              {isCompatible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cleared for Safe Transfusion</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Transfusion Prohibited (Serological Incompatibility)</span>
                </>
              )}
            </div>
            <div className="text-[11px] opacity-90">
              Recipient: <strong>{selectedPatient?.firstName} {selectedPatient?.lastName}</strong> ({selectedPatient?.bloodGroup || 'Unspecified'}) ↔ Bag: <strong>{selectedUnit?.unitId}</strong> ({selectedUnit?.bloodGroup})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isEditing ? 'Save Changes' : 'Issue Clearance Certificate'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
