import React, { useState } from 'react';
import {
  ArrowLeft,
  Bed,
  Stethoscope,
  FileText,
  Phone,
  Building,
  Activity,
  User,
  Shield,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Heart,
  Droplets,
  Calendar,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { IPDAdmission, Patient, Bed as BedType } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface InpatientClinicalChartViewProps {
  admission: IPDAdmission;
  patient?: Patient;
  bed?: BedType;
  onBack: () => void;
  onTransfer: (admission: IPDAdmission) => void;
  onGoToDischargeTab: () => void;
}

export const InpatientClinicalChartView: React.FC<InpatientClinicalChartViewProps> = ({
  admission,
  patient,
  bed,
  onBack,
  onTransfer,
  onGoToDischargeTab
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'TRANSFERS'>('OVERVIEW');
  const wardObj = WARDS_LIST.find((w) => w.code === admission.wardCode);
  const ageStr = patient ? getPatientAge(patient.dob) : 'Adult';
  const isChild = admission.wardCode === 'PEDIATRICS' || (patient && parseInt(getPatientAge(patient.dob), 10) < 15);

  const isClearedAll =
    admission.dischargeChecklistStatus.clinicalClearance &&
    admission.dischargeChecklistStatus.pharmacyClearance &&
    admission.dischargeChecklistStatus.billingClearance &&
    admission.dischargeChecklistStatus.nursingClearance;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Return Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-xs py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inpatients Roster</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Bed Location:</span>
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {admission.bedNumber} ({admission.wardName})
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              admission.status === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            ● {admission.status}
          </span>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {admission.patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{admission.patientName}</h2>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {admission.mrn}
                </span>
                {isChild && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Child Inpatient
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {ageStr} • {patient?.gender || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Admitted: <strong>{admission.admissionDateTime}</strong></span>
                <span>•</span>
                <span>Admitting Clinician: <strong className="text-slate-800">{admission.admittingClinician}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => onTransfer(admission)}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Transfer Ward</span>
            </button>
            <button
              type="button"
              onClick={onGoToDischargeTab}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Discharge Clearance</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Care Overview & Diagnosis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ORDERS')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Physician Directives & Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSFERS')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TRANSFERS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Transfer History</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {admission.transferLogs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: CARE OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Primary Diagnosis Callout */}
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-slate-600" />
                <span>Primary Inpatient Diagnosis</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 leading-relaxed">
                {admission.diagnosis}
              </div>
            </div>

            {/* Vitals / Ward Bed Equipment Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Assigned Ward & Bed</span>
                <span className="text-base font-bold text-slate-900 font-mono">{admission.bedNumber}</span>
                <span className="text-xs text-slate-600 block">{admission.wardName}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Oxygen Port Status</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{bed?.oxygenPortAvailable ? 'Active Wall Port Connected' : 'Standard Bed Outlet'}</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Bed ID: {bed?.bedId || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Discharge Readiness</span>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {isClearedAll ? (
                    <span className="text-emerald-700">✓ Fully Cleared (4/4)</span>
                  ) : (
                    <span className="text-amber-700">Pending Clearances</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block">Click Discharge button to view sign-offs</span>
              </div>
            </div>

            {/* Demographics & Guardian Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Patient Demographics</span>
                </h4>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-semibold text-slate-900">{patient?.firstName} {patient?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer Scheme:</span>
                    <span className="font-semibold text-slate-900">{patient?.payerClass || 'Standard Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-semibold text-slate-900">{patient?.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-semibold text-slate-900">{patient?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isChild ? 'Bedside Guardian (Rooming-in)' : 'Emergency Contact'}</span>
                </h4>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-semibold text-slate-900">{patient?.emergencyContactName || 'Family Present'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-semibold text-slate-900">{patient?.emergencyContactPhone || patient?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="font-semibold text-slate-900">{isChild ? 'Parent / Guardian' : 'Next of Kin'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & NOTES */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Physician Directives & Treatment Plan</span>
              </h4>
              <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                {admission.notes || 'Routine inpatient care plan:\n- Monitor vitals Q4H (BP, Pulse, Resp, Temp, SpO2)\n- Maintain IV access with normal saline\n- Administer charted oral and IV medications\n- Daily morning ward round by attending consultant'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>Admission Timeline</span>
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="text-slate-700">
                  Patient admitted on <strong className="text-slate-900">{admission.admissionDateTime}</strong> by <strong className="text-slate-900">{admission.admittingClinician}</strong>.
                </div>
                <div className="text-slate-500 text-[11px]">
                  Ward assigned: {admission.wardName} (Bed #{admission.bedNumber})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSFER HISTORY */}
        {activeTab === 'TRANSFERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                <span>Bed & Ward Relocation Logs</span>
              </h4>
              <button
                type="button"
                onClick={() => onTransfer(admission)}
                className="text-xs bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                + New Transfer
              </button>
            </div>

            {admission.transferLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Patient has remained in bed {admission.bedNumber} since admission. No inter-ward transfers recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {admission.transferLogs.map((log) => (
                  <div
                    key={log.transferId}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>
                        Moved from <em>{log.fromWard} ({log.fromBed})</em> → <em>{log.toWard} ({log.toBed})</em>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <span className="font-medium text-slate-500">Reason:</span> {log.reason}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Authorized by: {log.authorizedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
