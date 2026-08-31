import React from 'react';
import { Stethoscope, Activity, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { OPD_STATIONS } from '../../data/mockData';
import { OPDQueueItem } from '../../types';

interface LiveQueueBoardViewProps {
  opdQueue: OPDQueueItem[];
  onSelectPatient: (mrn: string) => void;
}

export const LiveQueueBoardView: React.FC<LiveQueueBoardViewProps> = ({
  opdQueue,
  onSelectPatient
}) => {
  const waitingTotal = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const inConsultTotal = (opdQueue || []).filter((q) => q.status === 'In Consultation').length;
  const diagnosticsTotal = (opdQueue || []).filter((q) => q.status === 'Awaiting Lab/Radiology').length;
  const readyTotal = (opdQueue || []).filter((q) => q.status === 'Results Ready').length;

  return (
    <div className="space-y-4">
      {/* Overview Stats Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">Live OPD Queue Board</h2>
            <div className="text-[11px] text-slate-500">Real-time room occupancy & patient tokens</div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            <span className="text-slate-600 font-medium">Waiting:</span>
            <span className="font-bold text-slate-900 font-mono">{waitingTotal}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-emerald-800 font-medium">In Consult:</span>
            <span className="font-bold text-emerald-950 font-mono">{inConsultTotal}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-indigo-800 font-medium">Results Ready:</span>
            <span className="font-bold text-indigo-950 font-mono">{readyTotal}</span>
          </div>
        </div>
      </div>

      {/* 6 Consultation Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {OPD_STATIONS.map((station) => {
          const roomQueue = (opdQueue || []).filter(
            (q) => q.assignedRoom === station.stationNumber && q.status !== 'Completed'
          );
          const inConsult = roomQueue.find((q) => q.status === 'In Consultation');
          const waiting = roomQueue.filter((q) => q.status === 'Waiting');
          const resultsReady = roomQueue.filter((q) => q.status === 'Results Ready');

          return (
            <div
              key={station.stationNumber}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
            >
              <div>
                {/* Room Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">Room {station.stationNumber}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                        {station.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5" title={station.doctorName}>
                      {station.doctorName}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    waiting.length > 0
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {waiting.length} waiting
                  </span>
                </div>

                {/* Currently In Consultation Card */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Active Consultation
                  </div>

                  {inConsult ? (
                    <div
                      onClick={() => onSelectPatient(inConsult.mrn)}
                      className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-950 text-xs">
                          Token: {inConsult.tokenNumber}
                        </span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                          In Consult
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 truncate">
                        {inConsult.patientName}
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                        {inConsult.mrn} • {inConsult.priority}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-center text-xs">
                      Station Ready / Idle
                    </div>
                  )}
                </div>

                {/* Diagnostics Ready */}
                {resultsReady.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                      Results Ready ({resultsReady.length})
                    </div>
                    <div className="space-y-1">
                      {resultsReady.map((item) => (
                        <div
                          key={item.queueId}
                          onClick={() => onSelectPatient(item.mrn)}
                          className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-indigo-950 truncate">{item.patientName}</span>
                          <span className="font-mono text-indigo-800 text-[11px] font-bold shrink-0">{item.tokenNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waiting Patients List */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Waiting Queue ({waiting.length})
                  </div>

                  {waiting.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-1 italic">
                      No patients waiting in queue.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {waiting.map((item) => (
                        <div
                          key={item.queueId}
                          onClick={() => onSelectPatient(item.mrn)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">{item.patientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.mrn}</div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                            {item.tokenNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Specialty Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-600 truncate">{station.specialty}</span>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{station.room}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
