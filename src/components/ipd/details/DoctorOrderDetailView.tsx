import React from 'react';
import {
  ArrowLeft,
  Bed,
  Stethoscope,
  FileText,
  Phone,
  Building,
  Activity,
  AlertTriangle,
  User,
  Shield,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { DoctorAdmissionOrder, Patient } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface DoctorOrderDetailViewProps {
  order: DoctorAdmissionOrder;
  patient?: Patient;
  onBack: () => void;
  onAllocateBed: (order: DoctorAdmissionOrder) => void;
  onCancelOrder: (orderId: string) => void;
  onOpenChart?: (bedNumber: string) => void;
}

export const DoctorOrderDetailView: React.FC<DoctorOrderDetailViewProps> = ({
  order,
  patient,
  onBack,
  onAllocateBed,
  onCancelOrder,
  onOpenChart
}) => {
  const isPending = order.status === 'Pending Bed Allocation';
  const isAllocated = order.status === 'Bed Allocated';
  const wardObj = WARDS_LIST.find((w) => w.code === order.recommendedWard);
  const ageStr = patient ? getPatientAge(patient.dob) : order.ageGender || 'Adult';
  const isChild = order.recommendedWard === 'PEDIATRICS' || (patient && parseInt(getPatientAge(patient.dob), 10) < 15);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Breadcrumb / Return Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-xs py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bed Orders Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Order ID:</span>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {order.orderId}
          </span>
        </div>
      </div>

      {/* Main Order Card Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{order.patientName}</h2>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {order.mrn}
                </span>
                {isChild && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Pediatric Patient
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    order.clinicalPriority === 'Emergency / Stat'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : order.clinicalPriority === 'Urgent'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Priority: {order.clinicalPriority}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ordered by <strong className="text-slate-800">{order.orderingDoctor}</strong> from {order.sourceLocation} • {order.orderTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                isPending
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : isAllocated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isPending ? '⏳ Pending Bed Allocation' : isAllocated ? `✓ Bed Assigned (${order.assignedBedNumber})` : order.status}
            </span>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Clinical Diagnosis & Directives */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-slate-600" />
                <span>Primary Admission Diagnosis</span>
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 leading-relaxed">
                {order.diagnosis}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Doctor Directives & Notes</span>
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {order.notes || 'Routine admission instructions: monitor vitals Q4H, maintain IV fluid line, administer charted medications.'}
              </div>
            </div>

            {/* Oxygen Port Requirement Alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                order.requiresOxygen
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Activity className={`w-5 h-5 shrink-0 ${order.requiresOxygen ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold">
                  {order.requiresOxygen ? 'Active Oxygen Line Required' : 'Standard Bed (Ambient Air)'}
                </div>
                <div className="text-[11px] opacity-80">
                  {order.requiresOxygen
                    ? 'This patient requires an inpatient bed equipped with a dedicated O2 wall outlet or concentrator.'
                    : 'No high-flow wall oxygen required for standard bed intake.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ward Placement & Demographics */}
          <div className="space-y-4">
            {/* Target Ward Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-600" />
                <span>Recommended Ward Placement</span>
              </h3>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                <div className="text-sm font-bold text-slate-900">{wardObj?.name || order.recommendedWard}</div>
                <div className="text-xs text-slate-500">{wardObj?.category || 'Inpatient Care Unit'}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Source Department</span>
                  <span className="font-semibold text-slate-800">{order.sourceDepartment}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Origin Location</span>
                  <span className="font-semibold text-slate-800">{order.sourceLocation}</span>
                </div>
              </div>
            </div>

            {/* Patient & Guardian Demographics */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-600" />
                <span>Patient & Emergency Contact Info</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Age & Gender</span>
                  <span className="font-semibold text-slate-800">{ageStr} • {patient?.gender || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Blood Group</span>
                  <span className="font-semibold text-slate-800">{patient?.bloodGroup || 'O+'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Payer Scheme</span>
                  <span className="font-semibold text-slate-800">{patient?.payerClass || 'Standard Private'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{patient?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">
                  {isChild ? 'Bedside Guardian (Rooming-in)' : 'Emergency Contact'}
                </div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{order.guardianPresent || patient?.emergencyContactName || 'Family Present'}</span>
                </div>
                {(patient?.emergencyContactPhone || patient?.phone) && (
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{patient?.emergencyContactPhone || patient?.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {isPending && (
              <button
                type="button"
                onClick={() => onCancelOrder(order.orderId)}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Admission Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Back
            </button>

            {isPending ? (
              <button
                type="button"
                onClick={() => onAllocateBed(order)}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Bed className="w-4 h-4" />
                <span>Allocate Inpatient Bed Now</span>
              </button>
            ) : isAllocated && order.assignedBedNumber && onOpenChart ? (
              <button
                type="button"
                onClick={() => onOpenChart(order.assignedBedNumber!)}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Patient Clinical Chart</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
