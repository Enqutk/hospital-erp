import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Activity,
  HeartPulse,
  Bed,
  Syringe,
  FileText,
  Clock,
  User,
  ShieldAlert,
  Send,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { EmergencyRecord, TriageLevel, Vitals } from '../../types';
import { useHospital } from '../../context/HospitalContext';

interface EmergencyCaseDetailPageProps {
  emergencyId: string;
  onBack: () => void;
}

export const EmergencyCaseDetailPage: React.FC<EmergencyCaseDetailPageProps> = ({
  emergencyId,
  onBack
}) => {
  const {
    emergencyRecords,
    updateEmergencyRecord,
    patients,
    currentUser,
    beds,
    admitPatientToBed,
    createLabOrder,
    createRadiologyOrder,
    createPrescription,
    labOrders,
    radiologyOrders,
    prescriptions,
    addToast
  } = useHospital();

  const record = emergencyRecords.find((e) => e.emergencyId === emergencyId);
  const patient = patients.find((p) => p.mrn === record?.mrn);

  // Local state for updating vitals
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [tempVitals, setTempVitals] = useState<Vitals>(
    record?.criticalVitals || {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 80,
      respRate: 18,
      tempCelsius: 37.0,
      spO2: 98,
      gcsScore: 15
    }
  );

  // Stat Diagnostic Modal / Quick Order
  const [showStatOrder, setShowStatOrder] = useState(false);
  const [statOrderType, setStatOrderType] = useState<'LAB' | 'RAD' | 'MED'>('LAB');
  const [statItemName, setStatItemName] = useState('STAT Complete Blood Count (CBC) & Crossmatch');
  const [statUrgencyNotes, setStatUrgencyNotes] = useState('Immediate trauma resuscitation evaluation');

  // Change Bay or Status Modal/Dropdown
  const [newBay, setNewBay] = useState<EmergencyRecord['activeTraumaBay']>(
    record?.activeTraumaBay || 'Resus Bay 1'
  );

  if (!record) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
        <div className="text-slate-600 text-sm font-semibold">Emergency Record Not Found</div>
        <p className="text-xs text-slate-400">The requested emergency case #{emergencyId} does not exist or has been cleared.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white text-xs rounded-lg font-medium cursor-pointer"
        >
          Return to ER Board
        </button>
      </div>
    );
  }

  const patientLabs = labOrders.filter((l) => l.mrn === record.mrn);
  const patientRads = radiologyOrders.filter((r) => r.mrn === record.mrn);
  const patientMeds = prescriptions.filter((p) => p.mrn === record.mrn);

  const getTriageBadge = (level: TriageLevel) => {
    switch (level) {
      case 'RED':
        return 'bg-rose-900 text-white';
      case 'YELLOW':
        return 'bg-amber-700 text-white';
      case 'GREEN':
        return 'bg-emerald-800 text-white';
      case 'BLUE':
        return 'bg-blue-800 text-white';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const handleSaveVitals = () => {
    updateEmergencyRecord(record.emergencyId, {
      criticalVitals: tempVitals
    });
    setIsEditingVitals(false);
    addToast('success', 'Vitals Synchronized', 'Serial emergency vital signs updated.');
  };

  const handleBayChange = (bay: EmergencyRecord['activeTraumaBay']) => {
    setNewBay(bay);
    updateEmergencyRecord(record.emergencyId, {
      activeTraumaBay: bay
    });
    addToast('info', 'Trauma Bay Reassigned', `Patient moved to ${bay}`);
  };

  const handleEscalateOT = () => {
    updateEmergencyRecord(record.emergencyId, {
      status: 'Transferred to OT'
    });
    addToast('warning', 'Transferred to Operating Theatre', `Case ${record.emergencyId} escalated for emergency surgical intervention.`);
  };

  const handleAdmitICU = () => {
    updateEmergencyRecord(record.emergencyId, {
      status: 'Admitted to ICU'
    });

    const availableIcuBed = beds.find((b) => b.wardCode === 'ICU' && b.status === 'Available');
    if (availableIcuBed) {
      admitPatientToBed(
        record.mrn,
        'ICU',
        availableIcuBed.bedNumber,
        `Emergency Trauma Admission: ${record.presentingComplaint}`,
        currentUser.name
      );
      addToast('success', 'ICU Bed Allocated', `Patient admitted to ${availableIcuBed.bedNumber} in Intensive Care Unit.`);
    } else {
      addToast('info', 'Admitted to ICU', `Case ${record.emergencyId} queued for Intensive Care Unit bed allocation.`);
    }
  };

  const handleDischargeER = (status: EmergencyRecord['status']) => {
    updateEmergencyRecord(record.emergencyId, {
      status
    });
    addToast('success', 'Case Status Updated', `Case marked as ${status}.`);
  };

  const handleSendStatOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (statOrderType === 'LAB') {
      createLabOrder({
        mrn: record.mrn,
        patientName: record.patientName,
        testCode: 'STAT_EMERGENCY_LAB',
        testName: statItemName,
        orderedBy: currentUser.name,
        collectionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        verificationStatus: 'Analyzing',
        verifyingTechId: 'STAT-TECH',
        results: [
          {
            parameter: 'Emergency Stat Evaluation',
            value: 'In Progress (Stat Run)',
            unit: 'Urgent',
            referenceRange: 'Norm',
            isAbnormal: false,
            isCritical: false
          }
        ]
      });
    } else if (statOrderType === 'RAD') {
      createRadiologyOrder({
        mrn: record.mrn,
        patientName: record.patientName,
        modality: statItemName.includes('CT') ? 'CT' : statItemName.includes('US') ? 'Ultrasound' : 'X-Ray',
        bodyPart: 'Trauma Protocol',
        clinicalIndication: `${statUrgencyNotes} (Presenting: ${record.presentingComplaint})`,
        priority: 'STAT',
        status: 'Scheduled',
        radiologistReport: ''
      });
    } else if (statOrderType === 'MED') {
      createPrescription({
        mrn: record.mrn,
        patientName: record.patientName,
        doctorName: currentUser.name,
        status: 'Pending Dispensation',
        medications: [
          {
            medicationId: 'MED-STAT',
            name: statItemName,
            dosage: 'STAT Dose',
            route: 'IV Bolus / Infusion',
            frequency: 'STAT Once',
            durationDays: 1,
            instructions: statUrgencyNotes
          }
        ]
      });
    }

    setShowStatOrder(false);
    setStatItemName('');
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{record.patientName}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getTriageBadge(record.triageLevel)}`}>
                CODE {record.triageLevel}
              </span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {record.emergencyId}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              MRN: <strong className="text-slate-800">{record.mrn}</strong> • Bay:{' '}
              <strong className="text-slate-800">{record.activeTraumaBay}</strong> • Arrived:{' '}
              {record.arrivedAt} • Clinician: {record.attendingStaff}
            </div>
          </div>
        </div>

        {/* Quick Bay & Status Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={record.activeTraumaBay}
            onChange={(e) => handleBayChange(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-xs"
          >
            <option value="Resus Bay 1">Resus Bay 1 (Red)</option>
            <option value="Resus Bay 2">Resus Bay 2 (Red)</option>
            <option value="Trauma Bay 1">Trauma Bay 1 (Yellow)</option>
            <option value="Trauma Bay 2">Trauma Bay 2 (Yellow)</option>
            <option value="Observation A">Observation A (Green)</option>
            <option value="Observation B">Observation B (Green)</option>
          </select>

          <button
            type="button"
            onClick={() => setShowStatOrder(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Stat Order
          </button>
        </div>
      </div>

      {/* Main Grid: Clinical Assessment & Escalation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        
        {/* Left Column: Triage, Vitals, Mechanism */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Presenting Complaint & Triage Rationale */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900">Presenting Trauma & Mechanism of Injury</span>
              <span className="text-[11px] text-slate-500 font-mono">ID: {record.emergencyId}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
              {record.presentingComplaint}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
                <span>Automated Triage Evaluation Rationale</span>
              </div>
              <p className="text-slate-600">{record.triageScoreReason}</p>
            </div>
          </div>

          {/* Critical Vital Signs */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-900">Critical Emergency Vital Signs</span>
              </div>

              {!isEditingVitals ? (
                <button
                  type="button"
                  onClick={() => setIsEditingVitals(true)}
                  className="text-xs text-slate-700 font-semibold hover:underline cursor-pointer"
                >
                  Update Vitals
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingVitals(false)}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVitals}
                    className="bg-slate-900 text-white px-2 py-0.5 rounded font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!isEditingVitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">Blood Pressure</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.criticalVitals.bpSystolic} / {record.criticalVitals.bpDiastolic} mmHg
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">Heart Rate</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.criticalVitals.heartRate} bpm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">SpO2 Saturation</span>
                  <span className={`text-sm font-bold ${record.criticalVitals.spO2 < 92 ? 'text-rose-700' : 'text-slate-900'}`}>
                    {record.criticalVitals.spO2}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">Glasgow Coma Scale</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.criticalVitals.gcsScore || 15} / 15
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">Respiratory Rate</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.criticalVitals.respRate || 18} /min
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500">Temperature</span>
                  <span className="text-sm font-bold text-slate-900">
                    {record.criticalVitals.tempCelsius || 37.0} °C
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">BP Sys</label>
                  <input
                    type="number"
                    value={tempVitals.bpSystolic}
                    onChange={(e) => setTempVitals({ ...tempVitals, bpSystolic: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">BP Dia</label>
                  <input
                    type="number"
                    value={tempVitals.bpDiastolic}
                    onChange={(e) => setTempVitals({ ...tempVitals, bpDiastolic: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Heart Rate</label>
                  <input
                    type="number"
                    value={tempVitals.heartRate}
                    onChange={(e) => setTempVitals({ ...tempVitals, heartRate: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">SpO2 (%)</label>
                  <input
                    type="number"
                    value={tempVitals.spO2}
                    onChange={(e) => setTempVitals({ ...tempVitals, spO2: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">GCS (3-15)</label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={tempVitals.gcsScore || 15}
                    onChange={(e) => setTempVitals({ ...tempVitals, gcsScore: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempVitals.tempCelsius || 37.0}
                    onChange={(e) => setTempVitals({ ...tempVitals, tempCelsius: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Related Diagnostic & Orders History */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <span className="font-bold text-slate-900 block pb-2 border-b border-slate-100">
              Active Stat Orders for this Patient
            </span>

            {patientLabs.length === 0 && patientRads.length === 0 && patientMeds.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-slate-400 text-center">
                No orders registered yet. Use "+ Stat Order" to request immediate diagnostics or meds.
              </div>
            ) : (
              <div className="space-y-2">
                {patientLabs.map((lab) => (
                  <div key={lab.labOrderId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{lab.testName}</div>
                      <div className="text-[11px] text-slate-500">Lab Barcode: {lab.sampleIdBarcode} • Status: {lab.verificationStatus}</div>
                    </div>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {lab.verificationStatus}
                    </span>
                  </div>
                ))}

                {patientRads.map((rad) => (
                  <div key={rad.radiologyOrderId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{rad.modality} - {rad.bodyPart}</div>
                      <div className="text-[11px] text-slate-500">{rad.clinicalIndication}</div>
                    </div>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {rad.status}
                    </span>
                  </div>
                ))}

                {patientMeds.map((med) => (
                  <div key={med.prescriptionId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {med.medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500">Prescribed by {med.doctorName}</div>
                    </div>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {med.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Escalation Actions & Clinical Routing */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Patient Demographics Card */}
          {patient && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="font-bold text-slate-900 block pb-1 border-b border-slate-100">
                Master Patient Summary
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender / Age</span>
                  <span className="font-medium text-slate-800">{patient.gender}, DOB {patient.dob}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-bold text-slate-900">{patient.bloodGroup || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payer Class</span>
                  <span className="font-medium text-slate-800">{patient.payerClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Allergies</span>
                  <span className="font-semibold text-rose-700">
                    {patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Department Escalation Actions */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <span className="font-bold text-slate-900 block pb-2 border-b border-slate-100">
              Department Escalation & Disposition
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleEscalateOT}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Transfer to Operating Theatre (OT)</div>
                  <div className="text-[11px] text-slate-300">Direct booking for emergency trauma surgery</div>
                </div>
                <Send className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleAdmitICU}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between border border-slate-200"
              >
                <div>
                  <div className="font-bold">Direct Inpatient ICU Admission</div>
                  <div className="text-[11px] text-slate-600">Queue for ICU Bed Allocation & critical care nursing</div>
                </div>
                <Bed className="w-4 h-4 text-slate-700" />
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[11px] text-slate-500 font-semibold block">Discharge & Resolution</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDischargeER('Discharged')}
                    className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-center font-medium cursor-pointer"
                  >
                    Discharge Home
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDischargeER('In Trauma Bay')}
                    className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-center font-medium cursor-pointer"
                  >
                    Active in Bay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Order Modal */}
      {showStatOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-100 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Create Emergency Stat Order</span>
              <button
                type="button"
                onClick={() => setShowStatOrder(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendStatOrder} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Order Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatOrderType('LAB');
                      setStatItemName('STAT Complete Blood Count (CBC) & Crossmatch');
                    }}
                    className={`py-1.5 rounded border text-center font-medium ${
                      statOrderType === 'LAB'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    Stat Lab
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatOrderType('RAD');
                      setStatItemName('Emergency FAST Ultrasound (Abdomen & Pelvis)');
                    }}
                    className={`py-1.5 rounded border text-center font-medium ${
                      statOrderType === 'RAD'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    Stat Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatOrderType('MED');
                      setStatItemName('IV Tranexamic Acid 1g + Ringers Lactate 1000ml');
                    }}
                    className={`py-1.5 rounded border text-center font-medium ${
                      statOrderType === 'MED'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    Stat Med
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Test or Item Name</label>
                <input
                  type="text"
                  required
                  value={statItemName}
                  onChange={(e) => setStatItemName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical Indication / Urgency</label>
                <textarea
                  rows={2}
                  value={statUrgencyNotes}
                  onChange={(e) => setStatUrgencyNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStatOrder(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
