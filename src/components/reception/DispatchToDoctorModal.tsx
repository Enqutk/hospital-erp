import React, { useState } from 'react';
import { X, Send, Stethoscope, Sparkles, Check, HeartPulse, User } from 'lucide-react';
import { Patient, Vitals } from '../../types';
import { OPD_STATIONS } from '../../data/mockData';
import { getRecommendedOPDRoom, calculateAge } from '../../utils/opdRouting';

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
  const patientAge = calculateAge(patient.dob);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch(patient.mrn, selectedRoom, priority, vitals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">Route Patient to OPD Doctor</h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-slate-800">{patient.firstName} {patient.lastName}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{patient.mrn}</span>
                <span>•</span>
                <span>{patient.gender}, {patientAge} yrs</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Recommendation Banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">
                  Recommended: Room {rec.roomNumber} ({rec.station.specialty})
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                  Best Match
                </span>
              </div>
              <p className="text-emerald-800/90 text-[11px] mt-0.5 leading-snug">
                {rec.station.doctorName} • {rec.reason}
              </p>
            </div>
          </div>

          {/* Consultation Room Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
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
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        Room {stn.stationNumber}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] font-medium truncate ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                      {stn.specialty}
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stn.doctorName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Triage Priority */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Triage Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'Routine' as const, label: 'Routine', color: 'hover:border-emerald-300' },
                { key: 'Urgent' as const, label: 'Urgent', color: 'hover:border-amber-300' },
                { key: 'Elderly/Child' as const, label: 'Elderly / Child', color: 'hover:border-indigo-300' }
              ].map((p) => {
                const isSelected = priority === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`py-2 px-2 text-center rounded-xl border font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : `bg-white text-slate-700 border-slate-200 hover:bg-slate-50 ${p.color}`
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intake Vitals */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Intake Vitals (Recorded at Reception)</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">BP Sys</span>
                <input
                  type="number"
                  value={vitals.bpSystolic}
                  onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">BP Dia</span>
                <input
                  type="number"
                  value={vitals.bpDiastolic}
                  onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">HR (bpm)</span>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">RR (/min)</span>
                <input
                  type="number"
                  value={vitals.respRate}
                  onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.tempCelsius}
                  onChange={(e) => setVitals({ ...vitals, tempCelsius: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-medium">SpO2 (%)</span>
                <input
                  type="number"
                  value={vitals.spO2}
                  onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                  className="w-full text-center font-bold text-slate-900 text-xs outline-hidden mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Token & Route</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
