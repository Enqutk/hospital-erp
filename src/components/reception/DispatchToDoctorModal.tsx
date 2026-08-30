import React, { useState, useEffect } from 'react';
import { X, Send, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { Patient, Vitals } from '../../types';
import { OPD_STATIONS } from '../../data/mockData';
import { getRecommendedOPDRoom } from '../../utils/opdRouting';

interface DispatchToDoctorModalProps {
  patient: Patient;
  onClose: () => void;
  onDispatch: (
    mrn: string,
    assignedRoom: number,
    priority: 'Routine' | 'Urgent' | 'Elderly/Child',
    vitals: Vitals
  ) => void;
}

export const DispatchToDoctorModal: React.FC<DispatchToDoctorModalProps> = ({
  patient,
  onClose,
  onDispatch
}) => {
  const rec = getRecommendedOPDRoom(patient.dob, patient.gender);

  const [selectedRoom, setSelectedRoom] = useState<number>(rec.roomNumber);
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Elderly/Child'>(
    rec.suggestedPriority
  );
  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 76,
    respRate: 18,
    tempCelsius: 37.0,
    spO2: 98
  });

  const selectedStation = OPD_STATIONS.find((s) => s.stationNumber === selectedRoom) || OPD_STATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch(patient.mrn, selectedRoom, priority, vitals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Route Patient to OPD Doctor</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient.firstName} {patient.lastName} • MRN: {patient.mrn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Smart Recommendation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-semibold text-slate-900">
              Recommended: Room {rec.roomNumber} ({rec.station.name})
            </div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Doctor: {rec.station.doctorName} • Specialty: {rec.station.specialty} ({rec.reason})
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Select Consultation Room
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OPD_STATIONS.map((stn) => {
                const isSelected = selectedRoom === stn.stationNumber;
                return (
                  <button
                    key={stn.stationNumber}
                    type="button"
                    onClick={() => setSelectedRoom(stn.stationNumber)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Room {stn.stationNumber}</div>
                    <div className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stn.name}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stn.doctorName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Triage Priority */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Triage Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Routine', 'Urgent', 'Elderly/Child'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-2 text-center rounded-lg border font-medium cursor-pointer transition-colors ${
                    priority === p
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Intake Vitals */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="font-semibold text-slate-800">
              Intake Vitals (Recorded at Reception / Triage)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500">BP Sys</span>
                <input
                  type="number"
                  value={vitals.bpSystolic}
                  onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">BP Dia</span>
                <input
                  type="number"
                  value={vitals.bpDiastolic}
                  onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">HR (bpm)</span>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">RR (/min)</span>
                <input
                  type="number"
                  value={vitals.respRate}
                  onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.tempCelsius}
                  onChange={(e) => setVitals({ ...vitals, tempCelsius: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">SpO2 (%)</span>
                <input
                  type="number"
                  value={vitals.spO2}
                  onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded p-1 text-center font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Electronic Token & Route</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
