import React from 'react';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Stethoscope,
  Building,
  UserCheck,
  Shield,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { OPD_STATIONS } from '../../data/mockData';

export const ReceptionShiftSummaryView: React.FC = () => {
  const { patients, opdQueue, currentUser, emergencyRecords, beds, staffList } = useHospital();

  const totalPatients = patients.length;
  const waitingInQueue = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const inConsultation = (opdQueue || []).filter((q) => q.status === 'In Consultation').length;
  const inDiagnostics = (opdQueue || []).filter((q) => q.status === 'Awaiting Lab/Radiology').length;
  const emergencyActive = (emergencyRecords || []).filter((e) => e.status !== 'Discharged').length;
  const occupiedBeds = (beds || []).filter((b) => b.status === 'Occupied').length;

  const cbhiPatients = patients.filter((p) => p.payerClass.toLowerCase().includes('cbhi')).length;
  const cashPatients = patients.filter((p) => p.payerClass.toLowerCase().includes('cash')).length;
  const corporatePatients = patients.filter((p) => p.payerClass.toLowerCase().includes('corp')).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Front Desk Shift & Operational Telemetry</h2>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">
                Live Overview
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Shift handover indicators, doctor station assignments, and daily intake statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200/80">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Shift: Morning (08:00 - 16:00)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Registered Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPatients}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Master Index Total</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">OPD In-Queue</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{waitingInQueue}</div>
          <div className="text-[11px] text-slate-500 mt-1">{inConsultation} inside doctor rooms</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Emergency Intake</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{emergencyActive}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active triage cases</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Ward Bed Occupancy</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{occupiedBeds} / {beds.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{beds.length - occupiedBeds} beds available</div>
        </div>
      </div>

      {/* Grid: On-Duty Doctor Stations & Insurance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* On-Duty Doctor Rooms */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active OPD Clinical Stations & Clinicians</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">6 Rooms Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OPD_STATIONS.map((station) => {
              const queueForRoom = (opdQueue || []).filter((q) => q.assignedRoom === station.stationNumber);
              const isBusy = queueForRoom.some((q) => q.status === 'In Consultation');

              return (
                <div key={station.stationNumber} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900">{station.name}</div>
                    <div className="text-[11px] text-emerald-800 font-medium">{station.doctorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Specialty: General Medicine</div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBusy ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isBusy ? 'Consulting' : 'Ready'}
                    </span>
                    <div className="text-[10px] text-slate-500">{queueForRoom.length} in queue</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payer Distribution & Handover Checklist */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Insurance Intake Mix</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-teal-50/70 border border-teal-200/60 rounded-xl">
              <span className="font-bold text-teal-950">CBHI Community Insured</span>
              <span className="font-mono font-bold text-teal-800">{cbhiPatients} ({Math.round((cbhiPatients / totalPatients) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
              <span className="font-bold text-emerald-950">Cash Direct Self-Pay</span>
              <span className="font-mono font-bold text-emerald-800">{cashPatients} ({Math.round((cashPatients / totalPatients) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl">
              <span className="font-bold text-blue-950">Corporate Partner / Private</span>
              <span className="font-mono font-bold text-blue-800">{corporatePatients} ({Math.round((corporatePatients / totalPatients) * 100)}%)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Shift Handover Status</div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All physical charts filed in Archive</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Printer stationery & cards restocked</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Queue tokens synchronized with triage</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
