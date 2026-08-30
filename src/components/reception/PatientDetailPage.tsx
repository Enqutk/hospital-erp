import React, { useState } from 'react';
import {
  ArrowLeft,
  Printer,
  Send,
  User,
  Phone,
  CreditCard,
  AlertTriangle,
  FileText,
  FlaskConical,
  Radio,
  Pill,
  Bed,
  Receipt,
  Calendar,
  Clock,
  CheckCircle2,
  Activity,
  Edit2
} from 'lucide-react';
import { Patient, OPDQueueItem } from '../../types';
import { useHospital } from '../../context/HospitalContext';
import { calculateAge, getRecommendedOPDRoom } from '../../utils/opdRouting';

interface PatientDetailPageProps {
  patient: Patient;
  onBack: () => void;
  onOpenDispatchModal: (patient: Patient) => void;
  onOpenPrintCard: (patient: Patient) => void;
}

type DetailTab = 'OVERVIEW' | 'OPD_VISITS' | 'LABS' | 'RADIOLOGY' | 'PRESCRIPTIONS' | 'ADMISSIONS' | 'BILLING';

export const PatientDetailPage: React.FC<PatientDetailPageProps> = ({
  patient,
  onBack,
  onOpenDispatchModal,
  onOpenPrintCard
}) => {
  const {
    opdEncounters,
    opdQueue,
    labOrders,
    radiologyOrders,
    prescriptions,
    ipdAdmissions,
    billingInvoices,
    updatePatient
  } = useHospital();

  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState(patient.phone);
  const [editEmergencyName, setEditEmergencyName] = useState(patient.emergencyContactName);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(patient.emergencyContactPhone);

  const age = calculateAge(patient.dob);
  const rec = getRecommendedOPDRoom(patient.dob, patient.gender);

  const activeQueueItem = (opdQueue || []).find(
    (q) => q.mrn === patient.mrn && (q.status === 'Waiting' || q.status === 'In Consultation' || q.status === 'Results Ready' || q.status === 'Awaiting Lab/Radiology')
  );

  const patientEncounters = opdEncounters.filter((e) => e.mrn === patient.mrn);
  const patientLabOrders = labOrders.filter((l) => l.mrn === patient.mrn);
  const patientRadiology = radiologyOrders.filter((r) => r.mrn === patient.mrn);
  const patientPrescriptions = prescriptions.filter((p) => p.mrn === patient.mrn);
  const patientAdmissions = ipdAdmissions.filter((a) => a.mrn === patient.mrn);
  const patientInvoices = billingInvoices.filter((i) => i.mrn === patient.mrn);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient(patient.mrn, {
      phone: editPhone,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone
    });
    setIsEditingContact(false);
  };

  const tabs = [
    { key: 'OVERVIEW', label: 'Overview', count: null },
    { key: 'OPD_VISITS', label: 'OPD Visits', count: patientEncounters.length },
    { key: 'LABS', label: 'Lab Orders', count: patientLabOrders.length },
    { key: 'RADIOLOGY', label: 'Radiology', count: patientRadiology.length },
    { key: 'PRESCRIPTIONS', label: 'Prescriptions', count: patientPrescriptions.length },
    { key: 'ADMISSIONS', label: 'IPD Admissions', count: patientAdmissions.length },
    { key: 'BILLING', label: 'Invoices', count: patientInvoices.length }
  ];

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Patients</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">
              {patient.firstName} {patient.lastName} ({patient.mrn})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activeQueueItem && (
            <button
              type="button"
              onClick={() => onOpenDispatchModal(patient)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Route to Doctor</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenPrintCard(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Patient Card</span>
          </button>
        </div>
      </div>

      {/* Main Patient Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          {/* Patient Photo & Primary Demographics */}
          <div className="md:col-span-8 flex flex-col sm:flex-row gap-4 items-start">
            <img
              src={patient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-base">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </span>
                <span className="font-mono bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                  MRN: {patient.mrn}
                </span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                  Blood: {patient.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>{patient.gender}</span>
                <span>•</span>
                <span>{age} years old (DOB: {patient.dob})</span>
                <span>•</span>
                <span>ID: {patient.nationalId}</span>
              </div>

              <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>Phone: <strong className="font-mono text-slate-800">{patient.phone}</strong></span>
                <span>•</span>
                <span>Payer: <strong className="text-slate-800">{patient.payerClass}</strong></span>
                {patient.insuranceNumber && (
                  <>
                    <span>•</span>
                    <span>Policy: <strong className="font-mono text-slate-800">{patient.insuranceNumber}</strong></span>
                  </>
                )}
              </div>

              {patient.allergies && patient.allergies.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">Allergies:</span>
                  <span>{patient.allergies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Routing Status Box */}
          <div className="md:col-span-4 border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>OPD Queue Status</span>
              {activeQueueItem && (
                <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {activeQueueItem.tokenNumber}
                </span>
              )}
            </div>

            {activeQueueItem ? (
              <div className="space-y-1">
                <div className="font-medium text-slate-900">
                  Room {activeQueueItem.assignedRoom} • {activeQueueItem.status}
                </div>
                <div className="text-[11px] text-slate-500">
                  Priority: {activeQueueItem.priority} • Token #{activeQueueItem.tokenNumber}
                </div>
                {activeQueueItem.awaitingDiagnosticsNotes && (
                  <div className="text-[11px] bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200 mt-1">
                    {activeQueueItem.awaitingDiagnosticsNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-slate-600">Patient not currently queued in OPD.</div>
                <div className="text-[11px] text-slate-500">
                  Recommended: Room {rec.roomNumber} ({rec.station.name}) for {rec.reason}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDispatchModal(patient)}
                  className="w-full mt-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                >
                  Route to Room {rec.roomNumber}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-lg p-1.5">
        <div className="flex gap-1 overflow-x-auto text-xs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as DetailTab)}
              className={`py-2 px-3 rounded font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === t.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== null && t.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === t.key ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Demographic & Identity Details */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  Identification & Registration
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="block text-[11px] text-slate-400">Full Name</span>
                    <span className="font-semibold text-slate-900">
                      {patient.firstName} {patient.middleName} {patient.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">MRN (Medical Record No.)</span>
                    <span className="font-mono font-semibold text-slate-900">{patient.mrn}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Date of Birth</span>
                    <span className="font-semibold text-slate-900">{patient.dob} ({age} yrs)</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Gender</span>
                    <span className="font-semibold text-slate-900">{patient.gender}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">National ID / Kebele</span>
                    <span className="font-semibold text-slate-900">{patient.nationalId}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Registration Date</span>
                    <span className="font-semibold text-slate-900">{patient.registeredAt}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Emergency Info */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-900">Contact & Emergency Details</span>
                  {!isEditingContact ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(true)}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  ) : null}
                </div>

                {!isEditingContact ? (
                  <div className="space-y-2 text-slate-600">
                    <div>
                      <span className="block text-[11px] text-slate-400">Primary Phone</span>
                      <span className="font-mono font-semibold text-slate-900">{patient.phone}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400">Emergency Contact Person</span>
                      <span className="font-semibold text-slate-900">{patient.emergencyContactName || 'Family Member'}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400">Emergency Phone</span>
                      <span className="font-mono font-semibold text-slate-900">{patient.emergencyContactPhone || patient.phone}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveContact} className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-500">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editEmergencyName}
                        onChange={(e) => setEditEmergencyName(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Emergency Contact Phone</label>
                      <input
                        type="text"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingContact(false)}
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Summary Grid of Records */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center">
                <span className="block text-[11px] text-slate-500">OPD Encounters</span>
                <span className="font-bold text-slate-900 text-base">{patientEncounters.length}</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center">
                <span className="block text-[11px] text-slate-500">Lab Orders</span>
                <span className="font-bold text-slate-900 text-base">{patientLabOrders.length}</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center">
                <span className="block text-[11px] text-slate-500">Radiology Orders</span>
                <span className="font-bold text-slate-900 text-base">{patientRadiology.length}</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center">
                <span className="block text-[11px] text-slate-500">Prescriptions</span>
                <span className="font-bold text-slate-900 text-base">{patientPrescriptions.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* OPD VISITS TAB */}
        {activeTab === 'OPD_VISITS' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Outpatient Clinical Encounters ({patientEncounters.length})
            </div>
            {patientEncounters.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No OPD consultation encounters recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {patientEncounters.map((enc) => (
                  <div key={enc.encounterId} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                      <span className="font-semibold text-slate-900">
                        Room {enc.stationNumber} • Dr. {enc.doctorName}
                      </span>
                      <span className="text-slate-500">{enc.createdAt}</span>
                    </div>

                    <div className="space-y-1">
                      <div>
                        <span className="font-medium text-slate-700">Chief Complaints: </span>
                        <span className="text-slate-600">{enc.chiefComplaints}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">HPI / Subjective: </span>
                        <span className="text-slate-600">{enc.subjectiveSymptoms}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Objective Findings: </span>
                        <span className="text-slate-600">{enc.objectiveObservations}</span>
                      </div>
                      {enc.icd10Codes && enc.icd10Codes.length > 0 && (
                        <div className="pt-1">
                          <span className="font-medium text-slate-700">ICD-10 Diagnosis: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {enc.icd10Codes.map((c) => (
                              <span key={c.code} className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                                {c.code} - {c.description}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-1">
                        <span className="font-medium text-slate-700">Care Plan / Treatment: </span>
                        <span className="text-slate-600">{enc.carePlan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LAB ORDERS TAB */}
        {activeTab === 'LABS' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Laboratory Investigations ({patientLabOrders.length})
            </div>
            {patientLabOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No laboratory orders recorded.</div>
            ) : (
              <div className="space-y-3">
                {patientLabOrders.map((lab) => (
                  <div key={lab.labOrderId} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div>
                        <span className="font-semibold text-slate-900">{lab.testName}</span>
                        <span className="font-mono text-slate-500 text-[11px] ml-2">({lab.testCode})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        lab.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lab.verificationStatus}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px]">
                      Ordered By: {lab.orderedBy} • Date: {lab.collectionDateTime}
                    </div>

                    {lab.results && lab.results.length > 0 && (
                      <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="p-1.5">Parameter</th>
                              <th className="p-1.5">Value</th>
                              <th className="p-1.5">Unit</th>
                              <th className="p-1.5">Reference Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {lab.results.map((r, idx) => (
                              <tr key={idx} className={r.isAbnormal ? 'bg-amber-50/50' : ''}>
                                <td className="p-1.5 font-medium">{r.parameter}</td>
                                <td className="p-1.5 font-bold">{r.value}</td>
                                <td className="p-1.5 text-slate-500">{r.unit}</td>
                                <td className="p-1.5 text-slate-500">{r.referenceRange}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RADIOLOGY TAB */}
        {activeTab === 'RADIOLOGY' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Radiology & Imaging Scans ({patientRadiology.length})
            </div>
            {patientRadiology.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No imaging scans ordered.</div>
            ) : (
              <div className="space-y-3">
                {patientRadiology.map((rad) => (
                  <div key={rad.radiologyOrderId} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div>
                        <span className="font-semibold text-slate-900">{rad.modality}: {rad.targetRegion}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        rad.status === 'Report Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {rad.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px]">
                      Ordered By: {rad.orderedBy} • Scheduled: {rad.scheduledDateTime}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded p-2 text-slate-700">
                      <span className="font-medium block text-slate-900">Diagnostic Findings:</span>
                      <span>{rad.diagnosticFindings}</span>
                      <div className="text-[11px] text-slate-500 mt-1">Verified By: {rad.radiologistSignature}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === 'PRESCRIPTIONS' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Pharmacy Prescriptions ({patientPrescriptions.length})
            </div>
            {patientPrescriptions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No prescriptions recorded for this patient.</div>
            ) : (
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div key={rx.rxId} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div>
                        <span className="font-semibold text-slate-900 font-mono">{rx.rxId}</span>
                        <span className="text-slate-500 ml-2">Prescribed By: {rx.prescriberName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {rx.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {rx.items.map((item, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{item.genericName}</span>
                            <span className="text-slate-600 ml-2">({item.dosage} • {item.frequency} for {item.durationDays} days)</span>
                          </div>
                          <span className="font-semibold text-slate-700">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IPD ADMISSIONS TAB */}
        {activeTab === 'ADMISSIONS' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Inpatient (IPD) Admissions ({patientAdmissions.length})
            </div>
            {patientAdmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No inpatient admissions on record.</div>
            ) : (
              <div className="space-y-3">
                {patientAdmissions.map((adm) => (
                  <div key={adm.admissionId} className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-semibold text-slate-900">
                        Ward: {adm.wardCode} • Bed: {adm.bedNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {adm.admissionStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">Admitting Doctor: {adm.admittingDoctor}</div>
                    <div className="text-slate-500">Admitted: {adm.admissionDateTime}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'BILLING' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Patient Invoices & Billing Summary ({patientInvoices.length})
            </div>
            {patientInvoices.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No invoices generated for this patient yet.</div>
            ) : (
              <div className="space-y-3">
                {patientInvoices.map((inv) => (
                  <div key={inv.invoiceId} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div>
                        <span className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>
                        <span className="text-slate-500 ml-2">{inv.issuedAt}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Amount:</span>
                      <span className="font-bold font-mono text-slate-900">{inv.totalAmount.toFixed(2)} ETB</span>
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
