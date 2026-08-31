import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
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
  Edit2,
  Stethoscope,
  ShieldCheck,
  User,
  HeartPulse
} from 'lucide-react';
import { Patient, OPDQueueItem } from '../../types';
import { useHospital } from '../../context/HospitalContext';
import { calculateAge, getRecommendedOPDRoom } from '../../utils/opdRouting';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onOpenDispatchModal?: (patient: Patient) => void;
  onOpenPrintCard?: (patient: Patient) => void;
}

type DetailTab = 'OVERVIEW' | 'OPD_VISITS' | 'LABS' | 'RADIOLOGY' | 'PRESCRIPTIONS' | 'ADMISSIONS' | 'BILLING';

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
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

  const patientEncounters = (opdEncounters || []).filter((e) => e.mrn === patient.mrn);
  const patientLabOrders = (labOrders || []).filter((l) => l.mrn === patient.mrn);
  const patientRadiology = (radiologyOrders || []).filter((r) => r.mrn === patient.mrn);
  const patientPrescriptions = (prescriptions || []).filter((p) => p.mrn === patient.mrn);
  const patientAdmissions = (ipdAdmissions || []).filter((a) => a.mrn === patient.mrn);
  const patientInvoices = (billingInvoices || []).filter((i) => i.mrn === patient.mrn);

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
    { key: 'OVERVIEW' as const, label: 'Overview', count: null },
    { key: 'OPD_VISITS' as const, label: 'OPD Encounters', count: patientEncounters.length },
    { key: 'LABS' as const, label: 'Lab Orders', count: patientLabOrders.length },
    { key: 'RADIOLOGY' as const, label: 'Radiology', count: patientRadiology.length },
    { key: 'PRESCRIPTIONS' as const, label: 'Prescriptions', count: patientPrescriptions.length },
    { key: 'ADMISSIONS' as const, label: 'IPD Admissions', count: patientAdmissions.length },
    { key: 'BILLING' as const, label: 'Billing Invoices', count: patientInvoices.length }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={patient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt={patient.firstName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {patient.mrn}
                </span>
                {patient.bloodGroup && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-1.5 py-0.2 rounded">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span>{patient.gender}, {age} yrs (DOB: {patient.dob})</span>
                <span>•</span>
                <span className="font-medium text-emerald-700">{patient.payerClass}</span>
                {activeQueueItem && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[11px]">
                      {activeQueueItem.tokenNumber} (Room {activeQueueItem.assignedRoom})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenDispatchModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDispatchModal(patient);
                }}
                className="hidden sm:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{!activeQueueItem ? 'Route to OPD' : 'Transfer'}</span>
              </button>
            )}

            {onOpenPrintCard && (
              <button
                type="button"
                onClick={() => onOpenPrintCard(patient)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                title="Print ID Card"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-200 bg-white overflow-x-auto text-xs shrink-0 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === t.key ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Primary Contact</div>
                  <div className="font-mono font-bold text-slate-900 mt-1">{patient.phone}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">National ID: {patient.nationalId}</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Emergency Contact</div>
                  <div className="font-bold text-slate-900 mt-1">{patient.emergencyContactName || 'None listed'}</div>
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">{patient.emergencyContactPhone || '—'}</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Payer Policy</div>
                  <div className="font-bold text-slate-900 mt-1">{patient.payerClass}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{patient.insuranceNumber || 'Self-Pay Standard'}</div>
                </div>
              </div>

              {/* Allergies & Clinical Alerts */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Allergies & Clinical Risk Flags</span>
                </div>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {patient.allergies.map((all, i) => (
                      <span key={i} className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-xs border border-rose-200">
                        {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">No known drug allergies reported at registration.</p>
                )}
              </div>

              {/* Recommended OPD Room Routing Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      Recommended OPD: Room {rec.roomNumber} ({rec.station.specialty})
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {rec.station.doctorName} • {rec.station.departmentWing}
                    </div>
                  </div>
                </div>

                {onOpenDispatchModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDispatchModal(patient);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Dispatch Now
                  </button>
                )}
              </div>

              {/* Edit Contact Form Toggle */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">Contact Details</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(!isEditingContact)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingContact ? 'Cancel' : 'Edit Contact Info'}</span>
                  </button>
                </div>

                {isEditingContact ? (
                  <form onSubmit={handleSaveContact} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editEmergencyName}
                        onChange={(e) => setEditEmergencyName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Emergency Contact Phone</label>
                      <input
                        type="text"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-slate-600 text-xs">
                    Phone: <strong className="font-mono text-slate-900">{patient.phone}</strong> | Emergency: <strong className="text-slate-900">{patient.emergencyContactName || 'N/A'}</strong> ({patient.emergencyContactPhone || 'N/A'})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OPD ENCOUNTERS */}
          {activeTab === 'OPD_VISITS' && (
            <div className="space-y-3">
              {patientEncounters.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No recorded OPD clinical visits for this patient yet.
                </div>
              ) : (
                patientEncounters.map((enc) => (
                  <div key={enc.encounterId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">
                        {enc.doctorName} (Room {enc.stationNumber})
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{enc.createdAt}</span>
                    </div>
                    <div className="text-slate-700">
                      <strong>Chief Complaint:</strong> {enc.chiefComplaints}
                    </div>
                    {enc.icd10Codes && enc.icd10Codes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enc.icd10Codes.map((icd, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 font-mono text-[11px] px-2 py-0.5 rounded">
                            {icd.code} - {icd.description}
                          </span>
                        ))}
                      </div>
                    )}
                    {enc.carePlan && (
                      <div className="text-slate-600 text-[11px] bg-white p-2 rounded border border-slate-200 mt-1">
                        <strong>Care Plan:</strong> {enc.carePlan}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LAB ORDERS */}
          {activeTab === 'LABS' && (
            <div className="space-y-3">
              {patientLabOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No laboratory orders on file.
                </div>
              ) : (
                patientLabOrders.map((lab) => (
                  <div key={lab.labOrderId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{lab.testName} ({lab.testCode})</span>
                      <span className="bg-slate-200 text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded">
                        {lab.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Ordered By: {lab.orderedBy} • Sample Barcode: <strong className="font-mono">{lab.sampleIdBarcode}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: RADIOLOGY */}
          {activeTab === 'RADIOLOGY' && (
            <div className="space-y-3">
              {patientRadiology.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No radiology imaging requests found.
                </div>
              ) : (
                patientRadiology.map((rad) => (
                  <div key={rad.radiologyOrderId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rad.modality} - {rad.targetRegion}</span>
                      <span className="bg-slate-200 text-slate-800 text-[11px] px-2 py-0.5 rounded">
                        {rad.status}
                      </span>
                    </div>
                    {rad.diagnosticFindings && (
                      <p className="text-slate-600 text-[11px] bg-white p-2 rounded border border-slate-200">
                        {rad.diagnosticFindings}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: PRESCRIPTIONS */}
          {activeTab === 'PRESCRIPTIONS' && (
            <div className="space-y-3">
              {patientPrescriptions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No prescriptions issued for this patient.
                </div>
              ) : (
                patientPrescriptions.map((rx) => (
                  <div key={rx.rxId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">{rx.rxId}</span>
                      <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[11px]">
                        {rx.status}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-200/60">
                      {rx.items.map((item, i) => (
                        <div key={i} className="py-1.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{item.genericName}</span>
                            <span className="text-slate-500 text-[11px] ml-1.5">{item.dosage} • {item.frequency}</span>
                          </div>
                          <span className="font-mono text-slate-700">{item.quantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: IPD ADMISSIONS */}
          {activeTab === 'ADMISSIONS' && (
            <div className="space-y-3">
              {patientAdmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No inpatient admissions recorded for this patient.
                </div>
              ) : (
                patientAdmissions.map((adm) => (
                  <div key={adm.admissionId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{adm.wardName} - Bed {adm.bedNumber}</span>
                      <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {adm.status}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Admitted: {adm.admissionDateTime} | Clinician: {adm.admittingClinician}
                    </div>
                    <div className="text-slate-800 font-medium">
                      Diagnosis: {adm.diagnosis}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: BILLING INVOICES */}
          {activeTab === 'BILLING' && (
            <div className="space-y-3">
              {patientInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No billing invoices issued yet.
                </div>
              ) : (
                patientInvoices.map((inv) => (
                  <div key={inv.billId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">{inv.billId}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{inv.createdAt} • {inv.payerClass}</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">ETB {inv.amountPayable?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            Registered on: <strong className="font-mono text-slate-700">{patient.registeredAt || '2025-05-10'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
