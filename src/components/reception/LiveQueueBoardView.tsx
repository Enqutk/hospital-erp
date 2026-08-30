import React from 'react';
import { Clock, Stethoscope, ArrowRight, UserCheck } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      {/* Overview stats bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">Hospital OPD Queue Board</span>
          <span className="text-slate-500">• Real-time consultation station queue status</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="text-slate-600">Waiting: {opdQueue.filter((q) => q.status === 'Waiting').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-600">In Consult: {opdQueue.filter((q) => q.status === 'In Consultation').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Diagnostics: {opdQueue.filter((q) => q.status === 'Awaiting Lab/Radiology').length}</span>
          </div>
        </div>
      </div>

      {/* 6 Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPD_STATIONS.map((station) => {
          const roomQueue = (opdQueue || []).filter(
            (q) => q.assignedRoom === station.stationNumber && q.status !== 'Completed'
          );
          const inConsult = roomQueue.find((q) => q.status === 'In Consultation');
          const waiting = roomQueue.filter((q) => q.status === 'Waiting');
          const resultsReady = roomQueue.filter((q) => q.status === 'Results Ready');
          const inDiagnostics = roomQueue.filter((q) => q.status === 'Awaiting Lab/Radiology');

          return (
            <div
              key={station.stationNumber}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Station Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{station.name}</span>
                    <div className="text-[11px] text-slate-500">{station.doctorName}</div>
                  </div>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {waiting.length} waiting
                  </span>
                </div>

                {/* In Consultation Active Card */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Currently Inside
                  </span>
                  {inConsult ? (
                    <div
                      onClick={() => onSelectPatient(inConsult.mrn)}
                      className="p-2.5 rounded border border-emerald-300 bg-emerald-50 text-xs cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-emerald-950">
                        <span>{inConsult.tokenNumber}</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                          In Consult
                        </span>
                      </div>
                      <div className="font-semibold text-emerald-950 mt-1">{inConsult.patientName}</div>
                      <div className="text-emerald-800 text-[11px]">MRN: {inConsult.mrn}</div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                      Station Idle / Ready for Next Patient
                    </div>
                  )}
                </div>

                {/* Results Ready Notification */}
                {resultsReady.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                      Results Ready for Review ({resultsReady.length})
                    </span>
                    <div className="space-y-1">
                      {resultsReady.map((item) => (
                        <div
                          key={item.queueId}
                          onClick={() => onSelectPatient(item.mrn)}
                          className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs cursor-pointer hover:bg-emerald-100 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-emerald-950">{item.patientName}</span>
                          <span className="font-mono text-emerald-800 text-[11px]">{item.tokenNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waiting Patients List */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Waiting in Line ({waiting.length})
                  </span>
                  {waiting.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">No patients waiting in queue.</div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {waiting.map((item) => (
                        <div
                          key={item.queueId}
                          onClick={() => onSelectPatient(item.mrn)}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-slate-800">{item.patientName}</span>
                            <span className="text-[10px] text-slate-500 block">MRN: {item.mrn}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{item.tokenNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                <span>{station.clinicalScope}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
