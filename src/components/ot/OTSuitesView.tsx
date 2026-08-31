import React from 'react';
import {
  Scissors,
  ShieldCheck,
  Activity,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  BedDouble,
  HeartPulse
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { SurgicalProcedure } from '../../types';

interface OTSuitesViewProps {
  onSelectCase: (surgery: SurgicalProcedure) => void;
  onOpenScheduleModal: () => void;
}

export const OTSuitesView: React.FC<OTSuitesViewProps> = ({
  onSelectCase,
  onOpenScheduleModal
}) => {
  const { surgeries = [], updateSurgeryStatus } = useHospital();

  const THEATRES = [
    {
      id: 'OR-1',
      name: 'OR-1: Main General & Orthopedic Suite',
      type: 'Major Surgical',
      currentSurgery: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-1') || s.targetOperatingRoom?.includes('OR 1'))),
      airPressure: 'Positive Pressure (+15 Pa)',
      temp: '20.5 °C',
      humidity: '48%'
    },
    {
      id: 'OR-2',
      name: 'OR-2: Laparoscopic & Endoscopy Suite',
      type: 'Minimally Invasive',
      currentSurgery: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-2') || s.targetOperatingRoom?.includes('OR 2'))),
      airPressure: 'Positive Pressure (+18 Pa)',
      temp: '19.8 °C',
      humidity: '52%'
    },
    {
      id: 'OR-3',
      name: 'OR-3: Maternity & Emergency Suite',
      type: 'Obstetric & Emergency',
      currentSurgery: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-3') || s.targetOperatingRoom?.includes('OR 3'))),
      airPressure: 'Positive Pressure (+14 Pa)',
      temp: '21.0 °C',
      humidity: '50%'
    }
  ];

  return (
    <div className="space-y-4 text-xs">
      
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-xs">Certified Positive-Pressure Surgical Suites</span>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            3 Operating Suites Online
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleModal}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Surgery</span>
        </button>
      </div>

      {/* 3 Theatres Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {THEATRES.map((th) => {
          const isOccupied = !!th.currentSurgery;
          const s = th.currentSurgery;

          return (
            <div
              key={th.id}
              className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                isOccupied ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              {/* Suite Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {th.type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{th.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOccupied
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isOccupied ? 'Occupied - In Surgery' : 'Sterile & Ready'}
                </span>
              </div>

              {/* Environmental Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-center">
                <div>
                  <span className="text-slate-400 block">Pressure</span>
                  <span className="font-mono font-bold text-slate-800">{th.airPressure}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Temp</span>
                  <span className="font-mono font-bold text-slate-800">{th.temp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Humidity</span>
                  <span className="font-mono font-bold text-slate-800">{th.humidity}</span>
                </div>
              </div>

              {/* Active Case Details or Idle Status */}
              {isOccupied && s ? (
                <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2 text-xs">
                  <div>
                    <div className="font-bold text-rose-950 text-xs">
                      {s.procedureName || s.surgicalProcedureName}
                    </div>
                    <div className="text-[11px] text-rose-800 mt-0.5">
                      Patient: <strong>{s.patientName}</strong> ({s.mrn})
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>Surgeon: <strong>{s.leadSurgeon}</strong></div>
                    <div>Anesthetist: {s.anaesthetist || s.anesthesiologistName} ({s.anesthesiaType})</div>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectCase(s)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Operative Report
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSurgeryStatus(s.surgeryId, 'PACU Recovery')}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>Transfer PACU</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 opacity-80" />
                  <div className="font-semibold text-slate-700 text-xs">Suite Cleaned & Disinfected</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ready for incoming surgical case</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
