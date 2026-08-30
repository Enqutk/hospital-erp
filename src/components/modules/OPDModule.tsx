import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  FileText,
  Search,
  Plus,
  Send,
  FlaskConical,
  Radio,
  Pill,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Bed,
  ArrowRight,
  ArrowLeft,
  Clock,
  UserCheck,
  PhoneCall,
  Users,
  Printer,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { ICD10_DATABASE, OPD_STATIONS, OPDStationInfo } from '../../data/mockData';
import { ICD10Code, OPDEncounter, OPDQueueItem, Vitals, LabOrder, RadiologyOrder, WardCode } from '../../types';
import { calculateAge } from '../../utils/opdRouting';

interface OPDModuleProps {
  onOpenRxPrint: (rxId: string) => void;
}

export type OPDStep = 1 | 2 | 3 | 4 | 5;

export const OPDModule: React.FC<OPDModuleProps> = ({ onOpenRxPrint }) => {
  const {
    currentUser,
    patients,
    selectedPatientMrn,
    setSelectedPatientMrn,
    getPatientByMrn,
    opdEncounters,
    opdQueue,
    updateOPDQueueStatus,
    sendPatientToDiagnostics,
    markDiagnosticsReadyAndReturnToOPD,
    createOPDEncounter,
    createLabOrder,
    updateLabResults,
    createRadiologyOrder,
    updateRadiologyReport,
    createPrescription,
    createBillForPatient,
    drugInventory,
    labOrders,
    radiologyOrders,
    prescriptions,
    ipdAdmissions,
    beds,
    admitPatientToBed,
    createAdmissionOrder
  } = useHospital();

  const [activeStation, setActiveStation] = useState<number>(currentUser.stationNumber || 1);
  const [queueTab, setQueueTab] = useState<'CURRENT_ROOM' | 'ALL_ROOMS' | 'RESULTS_READY'>('CURRENT_ROOM');
  const [currentStep, setCurrentStep] = useState<OPDStep>(1);

  const currentStationInfo: OPDStationInfo =
    OPD_STATIONS.find((s) => s.stationNumber === activeStation) || OPD_STATIONS[0];

  const patient = selectedPatientMrn ? getPatientByMrn(selectedPatientMrn) : patients[0];
  const patientAge = patient ? calculateAge(patient.dob) : 25;

  const currentRoomQueue = (opdQueue || []).filter((q) => q.assignedRoom === activeStation);
  const waitingInCurrentRoom = currentRoomQueue.filter((q) => q.status === 'Waiting');
  const resultsReadyInCurrentRoom = currentRoomQueue.filter((q) => q.status === 'Results Ready');
  const totalWaitingAllRooms = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const totalResultsReadyAllRooms = (opdQueue || []).filter((q) => q.status === 'Results Ready').length;

  const activeQueueItem = (opdQueue || []).find(
    (q) => q.mrn === selectedPatientMrn && (q.status === 'In Consultation' || q.status === 'Waiting' || q.status === 'Results Ready' || q.status === 'Awaiting Lab/Radiology')
  );

  // Step 2: Subjective State
  const [chiefComplaints, setChiefComplaints] = useState(
    'Acute epigastric burning and discomfort for 3 days, exacerbated following meals.'
  );
  const [subjectiveSymptoms, setSubjectiveSymptoms] = useState(
    'Patient notes intermittent nausea, bloating, and postprandial fullness. Denies melena, hematemesis, or fever.'
  );
  const [medicalHistoryNotes, setMedicalHistoryNotes] = useState(
    'Known history of mild dyspepsia. No prior surgical interventions. Non-smoker.'
  );

  // Step 3: Objective Vitals & Physical Exam State
  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 76,
    respRate: 18,
    tempCelsius: 37.0,
    spO2: 98
  });
  const [objectiveObservations, setObjectiveObservations] = useState(
    'Mild tenderness localized to epigastrium on palpation. No guarding, rebound, or organomegaly. Normal bowel sounds.'
  );

  // Room-Specific Specialized Fields
  const [childWeightKg, setChildWeightKg] = useState<number>(12);
  const [vaccinationUpToDate, setVaccinationUpToDate] = useState<boolean>(true);
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(24);
  const [gravidaPara, setGravidaPara] = useState<string>('G2 P1');
  const [fetalHeartRate, setFetalHeartRate] = useState<number>(144);
  const [fastingBloodSugar, setFastingBloodSugar] = useState<number>(115);
  const [bpTargetStatus, setBpTargetStatus] = useState<'Controlled (<130/80)' | 'Elevated' | 'Stage 2 HTN'>(
    'Controlled (<130/80)'
  );
  const [surgicalIndication, setSurgicalIndication] = useState<string>('Elective Consultation');
  const [woundClassification, setWoundClassification] = useState<string>('Clean (Class I)');

  // Step 4: Diagnostic Workup (Lab & Radiology Orders)
  const [orderLab, setOrderLab] = useState(true);
  const [labTestType, setLabTestType] = useState('H_PYLORI_STOOL');
  const [orderRadiology, setOrderRadiology] = useState(false);
  const [radiologyType, setRadiologyType] = useState<'Ultrasound' | 'X-Ray' | 'CT'>('Ultrasound');
  const [radiologyRegion, setRadiologyRegion] = useState('Abdominal Ultrasound');

  // Step 5: Assessment, Prescription & Care Plan
  const [icdSearch, setIcdSearch] = useState('');
  const [selectedIcdCodes, setSelectedIcdCodes] = useState<ICD10Code[]>([
    ICD10_DATABASE.find((i) => i.code === 'K29.7') || ICD10_DATABASE[9]
  ]);
  const [carePlan, setCarePlan] = useState(
    'Initiate PPI therapy (Omeprazole 20mg daily 30m before breakfast). Dietary counseling: avoid spicy and acidic foods. Follow up in 14 days.'
  );
  const [referralDestination, setReferralDestination] = useState<OPDEncounter['referralDestination']>('Pharmacy');
  const [targetWard, setTargetWard] = useState<WardCode>('GW-MALE');
  const [targetBed, setTargetBed] = useState<string>('GWM-01');

  const [orderRx, setOrderRx] = useState(true);
  const [rxDrugCode, setRxDrugCode] = useState('DRG-PARA-500');
  const [rxDosage, setRxDosage] = useState('1 tab (500mg)');
  const [rxFrequency, setRxFrequency] = useState('TID (Three times daily)');
  const [rxDuration, setRxDuration] = useState(5);

  const [submittedEncounter, setSubmittedEncounter] = useState<OPDEncounter | null>(null);

  useEffect(() => {
    if (activeQueueItem?.vitals) {
      setVitals(activeQueueItem.vitals);
    }
  }, [selectedPatientMrn, activeQueueItem?.queueId]);

  useEffect(() => {
    if (activeStation === 3) {
      setChiefComplaints('Fever and cough for 2 days. Mother reports decreased feeding and irritability.');
      setSubjectiveSymptoms('Mild rhinorrhea, no vomiting, wet diapers adequate.');
      setObjectiveObservations('Mild pharyngeal erythema, chest clear, capillary refill < 2s.');
      setLabTestType('CBC_DIFF');
    } else if (activeStation === 5) {
      setChiefComplaints('Routine 2nd Trimester Antenatal Care (ANC) visit. Reports good fetal movement.');
      setSubjectiveSymptoms('No vaginal bleeding, no headache, no vision changes or pedal edema.');
      setObjectiveObservations('Fundal height corresponds to 24 weeks. Fetal heart sounds regular (144 bpm). BP normal.');
      setOrderRadiology(true);
      setRadiologyRegion('Obstetric / Pelvic Ultrasound');
    } else if (activeStation === 2) {
      setChiefComplaints('Routine 3-month follow-up for Type 2 Diabetes Mellitus and Essential Hypertension.');
      setSubjectiveSymptoms('Good medication adherence. No polyuria, polydipsia, or chest discomfort.');
      setObjectiveObservations('No peripheral edema, normal S1/S2 heart sounds, peripheral pulses intact.');
      setLabTestType('LFT_RFT');
    } else if (activeStation === 4) {
      setChiefComplaints('Right lower quadrant dull discomfort and post-operative surgical wound review.');
      setSubjectiveSymptoms('No nausea, passing flatus normally, surgical dressing intact and dry.');
      setObjectiveObservations('Incision clean and healing by primary intention. No erythema, warmth or purulence.');
      setOrderRadiology(true);
      setRadiologyRegion('Abdominal Ultrasound');
    } else if (activeStation === 6) {
      setChiefComplaints('Refill for monthly chronic antihypertensive medications and blood pressure check.');
      setSubjectiveSymptoms('Asymptomatic. No side effects from current amlodipine regimen.');
      setObjectiveObservations('Vitals stable, BP within target range.');
    } else {
      setChiefComplaints('Acute epigastric burning and discomfort for 3 days, exacerbated following meals.');
      setSubjectiveSymptoms('Patient notes intermittent nausea, bloating, and postprandial fullness.');
      setObjectiveObservations('Mild tenderness localized to epigastrium on palpation. Normal bowel sounds.');
      setLabTestType('H_PYLORI_STOOL');
    }
  }, [activeStation]);

  const handleSelectQueueItem = (item: OPDQueueItem) => {
    updateOPDQueueStatus(item.queueId, 'In Consultation');
    setSelectedPatientMrn(item.mrn);
    if (item.vitals) {
      setVitals(item.vitals);
    }
    if (item.status === 'Results Ready') {
      setCurrentStep(4);
    } else {
      setCurrentStep(1);
    }
  };

  const handleCallNextPatient = () => {
    const nextInQueue = resultsReadyInCurrentRoom[0] || waitingInCurrentRoom[0];
    if (!nextInQueue) return;
    updateOPDQueueStatus(nextInQueue.queueId, 'In Consultation');
    setSelectedPatientMrn(nextInQueue.mrn);
    if (nextInQueue.vitals) {
      setVitals(nextInQueue.vitals);
    }
    if (nextInQueue.status === 'Results Ready') {
      setCurrentStep(4);
    } else {
      setCurrentStep(1);
    }
  };

  const handleSendToDiagnostics = () => {
    if (!patient) return;
    let orderedNotes: string[] = [];

    if (orderLab) {
      const newLab = createLabOrder({
        mrn: patient.mrn,
        patientName: `${patient.firstName} ${patient.lastName}`,
        testCode: labTestType,
        testName:
          labTestType === 'H_PYLORI_STOOL'
            ? 'H. Pylori Stool Antigen Test'
            : labTestType === 'CBC_DIFF'
            ? 'Complete Blood Count (CBC)'
            : labTestType === 'RPR_VDRL'
            ? 'RPR / VDRL Syphilis Screen'
            : 'Liver & Renal Function Panel',
        orderedBy: `${currentStationInfo.doctorName} (${currentStationInfo.name})`,
        collectionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        results: [
          {
            parameter: labTestType === 'CBC_DIFF' ? 'Hemoglobin (Hgb)' : 'Diagnostic Value',
            value: 'Pending Collection',
            unit: labTestType === 'CBC_DIFF' ? 'g/dL' : 'Qualitative',
            referenceRange: labTestType === 'CBC_DIFF' ? '12.0 - 16.0' : 'Negative / Normal',
            isAbnormal: false,
            isCritical: false
          }
        ],
        verificationStatus: 'Pending Collection',
        verifyingTechId: 'Unassigned'
      });

      createBillForPatient(patient.mrn, [
        {
          id: Math.random().toString(36).substring(2, 7),
          description: `Laboratory: ${newLab.testName}`,
          department: 'Laboratory',
          quantity: 1,
          unitPrice: 150,
          total: 150
        }
      ]);
      orderedNotes.push(newLab.testName);
    }

    if (orderRadiology) {
      const newRad = createRadiologyOrder({
        mrn: patient.mrn,
        patientName: `${patient.firstName} ${patient.lastName}`,
        modality: radiologyType,
        targetRegion: radiologyRegion,
        scanImageUrl:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
        diagnosticFindings: 'Awaiting radiologist verification and PACS upload...',
        radiologistSignature: 'Pending Verification',
        status: 'Scheduled',
        orderedBy: `${currentStationInfo.doctorName} (${currentStationInfo.name})`,
        scheduledDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
      orderedNotes.push(`${radiologyType} - ${radiologyRegion}`);
    }

    sendPatientToDiagnostics(
      patient.mrn,
      activeStation,
      `Ordered: ${orderedNotes.join(', ')}`
    );

    setCurrentStep(1);
  };

  const handleSimulateDiagnosticsCompletion = () => {
    if (!patient) return;
    const patientPendingLabs = labOrders.filter((l) => l.mrn === patient.mrn);
    if (patientPendingLabs.length > 0) {
      const targetLab = patientPendingLabs[0];
      const verifiedResults =
        targetLab.testCode === 'H_PYLORI_STOOL'
          ? [
              {
                parameter: 'H. Pylori Stool Antigen',
                value: 'POSITIVE (+)',
                unit: 'Qualitative',
                referenceRange: 'Negative',
                isAbnormal: true,
                isCritical: false
              }
            ]
          : targetLab.testCode === 'CBC_DIFF'
          ? [
              {
                parameter: 'Hemoglobin (Hgb)',
                value: '13.8',
                unit: 'g/dL',
                referenceRange: '12.0 - 16.0',
                isAbnormal: false,
                isCritical: false
              },
              {
                parameter: 'WBC',
                value: '11.4',
                unit: 'x10^3/uL',
                referenceRange: '4.5 - 11.0',
                isAbnormal: true,
                isCritical: false
              }
            ]
          : [
              {
                parameter: 'ALT / SGPT',
                value: '32',
                unit: 'U/L',
                referenceRange: '7 - 56',
                isAbnormal: false,
                isCritical: false
              }
            ];

      updateLabResults(targetLab.labOrderId, verifiedResults, 'Verified');
    }

    const patientPendingRad = radiologyOrders.filter((r) => r.mrn === patient.mrn);
    if (patientPendingRad.length > 0) {
      const targetRad = patientPendingRad[0];
      updateRadiologyReport(
        targetRad.radiologyOrderId,
        'Gastric antral mucosal thickening noted consistent with acute gastritis. Liver, gallbladder, pancreas, and kidneys are unremarkable.',
        'Dr. Bethel Bekele, MD (Radiologist)',
        'Report Verified'
      );
    }

    markDiagnosticsReadyAndReturnToOPD(patient.mrn);
  };

  const filteredIcd10 = ICD10_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(icdSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(icdSearch.toLowerCase())
  );

  const handleAddIcd = (code: ICD10Code) => {
    if (!selectedIcdCodes.some((c) => c.code === code.code)) {
      setSelectedIcdCodes([...selectedIcdCodes, code]);
    }
  };

  const handleRemoveIcd = (codeStr: string) => {
    setSelectedIcdCodes(selectedIcdCodes.filter((c) => c.code !== codeStr));
  };

  const handleFinalizeEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const encounter = createOPDEncounter({
      mrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.middleName} ${patient.lastName}`,
      stationNumber: activeStation,
      doctorName: currentStationInfo.doctorName,
      chiefComplaints,
      subjectiveSymptoms: `${subjectiveSymptoms} | Hx: ${medicalHistoryNotes}`,
      objectiveObservations: `${objectiveObservations} ${
        activeStation === 3
          ? `[Pediatric Wt: ${childWeightKg}kg, Vaccines: ${vaccinationUpToDate ? 'Up-to-Date' : 'Pending'}]`
          : activeStation === 5
          ? `[OB-GYN: ${gravidaPara}, GA: ${gestationalWeeks}w, FHR: ${fetalHeartRate}bpm]`
          : activeStation === 2
          ? `[Internal Med: FBS: ${fastingBloodSugar}mg/dL, BP Target: ${bpTargetStatus}]`
          : activeStation === 4
          ? `[Surgery: ${surgicalIndication}, Wound: ${woundClassification}]`
          : ''
      }`,
      icd10Codes: selectedIcdCodes,
      carePlan,
      referralDestination,
      status: referralDestination === 'IPD Admission' ? 'Referred' : 'Completed',
      vitals
    });

    if (referralDestination === 'IPD Admission') {
      const targetDiagnosis = selectedIcdCodes.map((c) => c.description).join('; ') || chiefComplaints || 'Inpatient Admission';
      const wardBeds = beds.filter((b) => b.wardCode === targetWard && b.status === 'Available');
      const selectedOrFirstBed = targetBed && beds.some((b) => b.wardCode === targetWard && b.bedNumber === targetBed && b.status === 'Available')
        ? targetBed
        : wardBeds[0]?.bedNumber || '';

      if (selectedOrFirstBed) {
        admitPatientToBed(
          patient.mrn,
          targetWard,
          selectedOrFirstBed,
          targetDiagnosis,
          currentStationInfo.doctorName
        );
      }

      createAdmissionOrder({
        mrn: patient.mrn,
        patientName: `${patient.firstName} ${patient.lastName}`,
        ageGender: `${patientAge} yrs • ${patient.gender}`,
        sourceDepartment: 'OPD Clinic',
        sourceLocation: `${currentStationInfo.name} (${currentStationInfo.doctorName})`,
        orderingDoctor: currentStationInfo.doctorName,
        recommendedWard: targetWard,
        diagnosis: targetDiagnosis,
        clinicalPriority: 'Urgent',
        requiresOxygen: (vitals?.spO2 && vitals.spO2 < 94) || false,
        guardianPresent: patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactRelationship || 'Guardian'})` : undefined,
        assignedBedNumber: selectedOrFirstBed || undefined,
        notes: carePlan || `Ordered admission from OPD Station ${activeStation}.`
      });
    }

    if (orderRx) {
      const matchedDrug = drugInventory.find((d) => d.drugCode === rxDrugCode) || drugInventory[1];
      createPrescription({
        mrn: patient.mrn,
        patientName: `${patient.firstName} ${patient.lastName}`,
        prescriberName: currentStationInfo.doctorName,
        department: `${currentStationInfo.name}`,
        items: [
          {
            drugCode: matchedDrug.drugCode,
            genericName: matchedDrug.genericName,
            dosage: rxDosage,
            frequency: rxFrequency,
            durationDays: rxDuration,
            quantity: 15,
            unitPrice: matchedDrug.unitSalePrice,
            dispensedStatus: 'Pending'
          }
        ],
        isSigned: true,
        status: 'Prescribed'
      });

      createBillForPatient(patient.mrn, [
        {
          id: Math.random().toString(36).substring(2, 7),
          description: `Rx: ${matchedDrug.genericName}`,
          department: 'Pharmacy',
          quantity: 1,
          unitPrice: matchedDrug.unitSalePrice * 15,
          total: matchedDrug.unitSalePrice * 15
        }
      ]);
    }

    setSubmittedEncounter(encounter);
  };

  const patientEncounters = opdEncounters.filter((e) => e.mrn === selectedPatientMrn);
  const patientLabOrders = labOrders.filter((l) => l.mrn === selectedPatientMrn);
  const patientRadiologyOrders = radiologyOrders.filter((r) => r.mrn === selectedPatientMrn);
  const patientPrescriptions = prescriptions.filter((p) => p.mrn === selectedPatientMrn);

  const stepsList = [
    { number: 1, title: 'Patient Card & History', label: '1. Patient Card' },
    { number: 2, title: 'Subjective Assessment', label: '2. Subjective' },
    { number: 3, title: 'Objective & Vitals', label: '3. Objective' },
    { number: 4, title: 'Diagnostic Workup', label: '4. Diagnostics' },
    { number: 5, title: 'Assessment & Plan', label: '5. Assessment & Rx' }
  ];

  return (
    <div className="space-y-4">
      {/* ROOM SELECTION BAR */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{currentStationInfo.name}</span>
              <span className="text-xs text-slate-500">({currentStationInfo.doctorName} • {currentStationInfo.specialty})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentStationInfo.clinicalScope}</p>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {OPD_STATIONS.map((stn) => {
              const count = (opdQueue || []).filter(
                (q) => q.assignedRoom === stn.stationNumber && q.status === 'Waiting'
              ).length;
              const readyCount = (opdQueue || []).filter(
                (q) => q.assignedRoom === stn.stationNumber && q.status === 'Results Ready'
              ).length;
              const isSelected = activeStation === stn.stationNumber;

              return (
                <button
                  key={stn.stationNumber}
                  type="button"
                  onClick={() => setActiveStation(stn.stationNumber)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Room {stn.stationNumber}</span>
                  {readyCount > 0 && (
                    <span className="ml-1 px-1 bg-emerald-600 text-white text-[10px] rounded font-bold">
                      +{readyCount}
                    </span>
                  )}
                  {count > 0 && readyCount === 0 && (
                    <span className={`ml-1 px-1 text-[10px] rounded ${isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: SIDE WAITING QUEUE */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="font-semibold text-slate-800">Room {activeStation} Queue</span>
              <span className="text-slate-500">{waitingInCurrentRoom.length + resultsReadyInCurrentRoom.length} patients</span>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={handleCallNextPatient}
                disabled={waitingInCurrentRoom.length === 0 && resultsReadyInCurrentRoom.length === 0}
                className={`w-full py-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                  resultsReadyInCurrentRoom.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                    : waitingInCurrentRoom.length > 0
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                {resultsReadyInCurrentRoom.length > 0
                  ? `Call Results Ready (${resultsReadyInCurrentRoom[0]?.tokenNumber})`
                  : waitingInCurrentRoom.length > 0
                  ? `Call Next Patient (${waitingInCurrentRoom[0]?.tokenNumber})`
                  : 'No Patients Waiting'}
              </button>
            </div>

            {/* Queue Filters */}
            <div className="mt-2 flex border border-slate-200 rounded text-xs bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setQueueTab('CURRENT_ROOM')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  queueTab === 'CURRENT_ROOM' ? 'bg-white font-semibold text-slate-900 border border-slate-200' : 'text-slate-600'
                }`}
              >
                Room {activeStation} ({currentRoomQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setQueueTab('RESULTS_READY')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  queueTab === 'RESULTS_READY' ? 'bg-white font-semibold text-slate-900 border border-slate-200' : 'text-slate-600'
                }`}
              >
                Results Ready ({totalResultsReadyAllRooms})
              </button>
              <button
                type="button"
                onClick={() => setQueueTab('ALL_ROOMS')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  queueTab === 'ALL_ROOMS' ? 'bg-white font-semibold text-slate-900 border border-slate-200' : 'text-slate-600'
                }`}
              >
                All ({totalWaitingAllRooms})
              </button>
            </div>

            {/* Queue List */}
            <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto">
              {queueTab === 'CURRENT_ROOM' ? (
                currentRoomQueue.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No patients in Room {activeStation} queue.
                  </div>
                ) : (
                  currentRoomQueue.map((item) => {
                    const isSelected = item.mrn === selectedPatientMrn;
                    const isResultsReady = item.status === 'Results Ready';
                    const isAwaitingDiag = item.status === 'Awaiting Lab/Radiology';

                    return (
                      <div
                        key={item.queueId}
                        onClick={() => handleSelectQueueItem(item)}
                        className={`p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-slate-100 border-slate-400 font-medium'
                            : isResultsReady
                            ? 'bg-emerald-50 border-emerald-300'
                            : isAwaitingDiag
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">
                            {item.tokenNumber}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            isResultsReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAwaitingDiag
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1">{item.patientName}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          MRN: {item.mrn} • {item.priority}
                        </div>
                        {item.awaitingDiagnosticsNotes && (
                          <div className="mt-1 text-[11px] text-slate-600 bg-white/70 p-1 rounded border border-slate-200">
                            {item.awaitingDiagnosticsNotes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              ) : queueTab === 'RESULTS_READY' ? (
                (opdQueue || []).filter((q) => q.status === 'Results Ready').length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No diagnostic returns pending.
                  </div>
                ) : (
                  (opdQueue || [])
                    .filter((q) => q.status === 'Results Ready')
                    .map((item) => (
                      <div
                        key={item.queueId}
                        onClick={() => handleSelectQueueItem(item)}
                        className="p-2.5 rounded border border-emerald-300 bg-emerald-50 text-xs cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-950">
                            {item.tokenNumber} (Room {item.assignedRoom})
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                            Results Finalized
                          </span>
                        </div>
                        <div className="font-semibold text-emerald-950 mt-1">{item.patientName}</div>
                        <div className="text-emerald-800 text-[11px]">MRN: {item.mrn}</div>
                      </div>
                    ))
                )
              ) : (
                <div className="space-y-1.5">
                  {OPD_STATIONS.map((stn) => {
                    const stnWaiting = (opdQueue || []).filter(
                      (q) => q.assignedRoom === stn.stationNumber && q.status === 'Waiting'
                    ).length;
                    return (
                      <div
                        key={stn.stationNumber}
                        onClick={() => setActiveStation(stn.stationNumber)}
                        className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                          activeStation === stn.stationNumber ? 'bg-slate-100 border-slate-400 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{stn.name}</span>
                        <span className="text-slate-500 font-mono">{stnWaiting} wait</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP-BY-STEP CONSULTATION FORM */}
        <div className="lg:col-span-8 space-y-3">
          {/* STEPPER HEADER */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5">
            <div className="grid grid-cols-5 gap-1 text-xs">
              {stepsList.map((st) => {
                const isCurrent = currentStep === st.number;
                const isPassed = currentStep > st.number;

                return (
                  <button
                    key={st.number}
                    type="button"
                    onClick={() => setCurrentStep(st.number as OPDStep)}
                    className={`py-1.5 px-2 rounded text-center border transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : isPassed
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: PATIENT CARD & HISTORY */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Step 1: Patient Details & History</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  MRN: {patient?.mrn || 'N/A'}
                </span>
              </div>

              {patient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded p-3 space-y-1.5">
                    <div className="font-semibold text-slate-900 text-sm">
                      {patient.firstName} {patient.middleName} {patient.lastName}
                    </div>
                    <div>Gender / Age: <span className="font-medium text-slate-800">{patient.gender}, {patientAge} yrs</span></div>
                    <div>Date of Birth: <span className="font-medium text-slate-800">{patient.dob}</span></div>
                    <div>Phone: <span className="font-medium text-slate-800">{patient.phone}</span></div>
                    <div>Payment: <span className="font-medium text-slate-800">{patient.payerClass}</span></div>
                  </div>

                  <div className="border border-slate-200 rounded p-3 space-y-1.5">
                    <div>Blood Group: <span className="font-bold text-slate-900">{patient.bloodGroup || 'O+'}</span></div>
                    <div>National ID: <span className="font-medium text-slate-800">{patient.nationalId}</span></div>
                    <div>Emergency Contact: <span className="font-medium text-slate-800">{patient.emergencyContactName} ({patient.emergencyContactPhone})</span></div>
                    <div className="text-rose-700 font-medium">
                      Allergies: {patient.allergies?.join(', ') || 'None recorded'}
                    </div>
                  </div>
                </div>
              )}

              {/* History Table */}
              <div className="border border-slate-200 rounded p-3 space-y-2">
                <div className="font-semibold text-slate-800">Prior Outpatient Encounters ({patientEncounters.length})</div>
                {patientEncounters.length === 0 ? (
                  <div className="text-slate-400">No prior encounters on record.</div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {patientEncounters.map((e) => (
                      <div key={e.encounterId} className="p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="flex justify-between font-medium">
                          <span>{e.createdAt} • Room {e.stationNumber}</span>
                          <span>{e.doctorName}</span>
                        </div>
                        <div className="text-slate-600 mt-0.5">Complaints: {e.chiefComplaints}</div>
                        <div className="text-slate-500 mt-0.5">Plan: {e.carePlan}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Next: Subjective &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SUBJECTIVE */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Step 2: Subjective (History of Present Illness)</span>
                <span className="text-slate-500">Patient: {patient?.firstName} {patient?.lastName}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Chief Complaints</label>
                  <textarea
                    rows={2}
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">History of Present Illness (HPI) & Associated Symptoms</label>
                  <textarea
                    rows={3}
                    value={subjectiveSymptoms}
                    onChange={(e) => setSubjectiveSymptoms(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Past Medical, Surgical & Family History</label>
                  <textarea
                    rows={2}
                    value={medicalHistoryNotes}
                    onChange={(e) => setMedicalHistoryNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Next: Objective & Vitals &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OBJECTIVE & VITALS */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Step 3: Objective (Vitals & Physical Exam)</span>
                <span className="text-slate-500">Patient: {patient?.firstName} {patient?.lastName}</span>
              </div>

              {/* Vitals Grid */}
              <div>
                <label className="block font-semibold text-slate-800 mb-2">Patient Vitals</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">BP Systolic</div>
                    <input
                      type="number"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">BP Diastolic</div>
                    <input
                      type="number"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">Heart Rate</div>
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">bpm</span>
                  </div>
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">Resp Rate</div>
                    <input
                      type="number"
                      value={vitals.respRate}
                      onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">/min</span>
                  </div>
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">Temperature</div>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.tempCelsius}
                      onChange={(e) => setVitals({ ...vitals, tempCelsius: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">°C</span>
                  </div>
                  <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                    <div className="text-slate-500 text-[11px]">SpO2</div>
                    <input
                      type="number"
                      value={vitals.spO2}
                      onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                      className="w-full font-bold text-center text-slate-900 mt-1 bg-white border border-slate-300 rounded py-1"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Station Specific Fields */}
              {activeStation === 3 && (
                <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
                  <div className="font-semibold text-slate-800">Pediatrics Specifics</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Child Weight (kg)</label>
                      <input
                        type="number"
                        value={childWeightKg}
                        onChange={(e) => setChildWeightKg(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Vaccinations Up-to-Date?</label>
                      <select
                        value={vaccinationUpToDate ? 'true' : 'false'}
                        onChange={(e) => setVaccinationUpToDate(e.target.value === 'true')}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white"
                      >
                        <option value="true">Yes - Complete for age</option>
                        <option value="false">No - Defaulter / Incomplete</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeStation === 5 && (
                <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
                  <div className="font-semibold text-slate-800">OB-GYN / Antenatal Specifics</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Obstetric History</label>
                      <input
                        type="text"
                        value={gravidaPara}
                        onChange={(e) => setGravidaPara(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Gestational Age (weeks)</label>
                      <input
                        type="number"
                        value={gestationalWeeks}
                        onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Fetal Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={fetalHeartRate}
                        onChange={(e) => setFetalHeartRate(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Physical Examination Findings</label>
                <textarea
                  rows={3}
                  value={objectiveObservations}
                  onChange={(e) => setObjectiveObservations(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Next: Diagnostic Workup &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DIAGNOSTICS */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Step 4: Diagnostic Workup (Lab & Radiology)</span>
                <button
                  type="button"
                  onClick={handleSimulateDiagnosticsCompletion}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-300 font-medium transition-colors cursor-pointer"
                  title="Simulate immediate lab/radiology verification"
                >
                  Simulate Verified Results
                </button>
              </div>

              {/* Order Lab & Radiology Checkboxes */}
              <div className="space-y-3">
                <div className="border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="labCheck"
                      checked={orderLab}
                      onChange={(e) => setOrderLab(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="labCheck" className="font-semibold text-slate-800 cursor-pointer">
                      Order Laboratory Investigation
                    </label>
                  </div>

                  {orderLab && (
                    <div className="pt-2">
                      <select
                        value={labTestType}
                        onChange={(e) => setLabTestType(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                      >
                        <option value="H_PYLORI_STOOL">H. Pylori Stool Antigen Test</option>
                        <option value="CBC_DIFF">Complete Blood Count (CBC / Diff)</option>
                        <option value="RPR_VDRL">RPR / VDRL Syphilis Screen</option>
                        <option value="LFT_RFT">Liver & Renal Panel (LFT / RFT)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="radCheck"
                      checked={orderRadiology}
                      onChange={(e) => setOrderRadiology(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="radCheck" className="font-semibold text-slate-800 cursor-pointer">
                      Order Radiology / Ultrasound Investigation
                    </label>
                  </div>

                  {orderRadiology && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <select
                        value={radiologyType}
                        onChange={(e) => setRadiologyType(e.target.value as any)}
                        className="border border-slate-300 rounded p-1.5 bg-white text-xs"
                      >
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="CT">CT Scan</option>
                      </select>
                      <input
                        type="text"
                        value={radiologyRegion}
                        onChange={(e) => setRadiologyRegion(e.target.value)}
                        placeholder="Target Region (e.g. Abdominal)"
                        className="border border-slate-300 rounded p-1.5 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>

                {(orderLab || orderRadiology) && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Dispatch Patient to Diagnostics</div>
                      <div className="text-slate-500 text-[11px]">
                        The patient will move to Diagnostics and return to your queue once results are ready.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendToDiagnostics}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Send & Next Patient
                    </button>
                  </div>
                )}
              </div>

              {/* View Existing Diagnostic Reports */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="font-semibold text-slate-800">Verified Diagnostic Results on File</div>
                {patientLabOrders.length === 0 && patientRadiologyOrders.length === 0 ? (
                  <div className="text-slate-400 text-xs">No lab or radiology reports currently on file.</div>
                ) : (
                  <div className="space-y-2">
                    {patientLabOrders.map((l) => (
                      <div key={l.labOrderId} className="p-2 border border-slate-200 rounded bg-slate-50">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{l.testName} ({l.labOrderId})</span>
                          <span className={l.verificationStatus === 'Verified' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                            {l.verificationStatus}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {l.results.map((r, i) => (
                            <div key={i} className="flex justify-between text-slate-700 font-mono text-[11px]">
                              <span>{r.parameter}:</span>
                              <span className={r.isAbnormal ? 'text-rose-600 font-bold' : 'font-semibold'}>
                                {r.value} {r.unit} (Ref: {r.referenceRange})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {patientRadiologyOrders.map((r) => (
                      <div key={r.radiologyOrderId} className="p-2 border border-slate-200 rounded bg-slate-50">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{r.modality} - {r.targetRegion}</span>
                          <span className="text-emerald-700 font-bold">{r.status}</span>
                        </div>
                        <div className="text-slate-700 mt-1 text-[11px]">{r.diagnosticFindings}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Next: Assessment & Prescription &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ASSESSMENT & CARE PLAN (Rx) */}
          {currentStep === 5 && (
            <form onSubmit={handleFinalizeEncounter} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Step 5: Assessment, Diagnosis & Prescription</span>
                <span className="text-slate-500">Patient: {patient?.firstName} {patient?.lastName}</span>
              </div>

              {/* ICD-10 Search */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">ICD-10 Clinical Diagnosis</label>
                <input
                  type="text"
                  value={icdSearch}
                  onChange={(e) => setIcdSearch(e.target.value)}
                  placeholder="Search ICD-10 by code or description..."
                  className="w-full border border-slate-300 rounded p-1.5 text-xs focus:border-slate-600 focus:outline-hidden"
                />

                {icdSearch && (
                  <div className="border border-slate-200 rounded mt-1 max-h-32 overflow-y-auto bg-white">
                    {filteredIcd10.map((code) => (
                      <div
                        key={code.code}
                        onClick={() => {
                          handleAddIcd(code);
                          setIcdSearch('');
                        }}
                        className="p-1.5 hover:bg-slate-50 cursor-pointer flex justify-between border-b border-slate-100 last:border-0"
                      >
                        <span className="font-mono font-semibold text-slate-900">{code.code}</span>
                        <span className="text-slate-600 truncate ml-2">{code.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected ICD Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedIcdCodes.map((code) => (
                    <span
                      key={code.code}
                      className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                    >
                      <strong className="font-mono">{code.code}</strong>: {code.description}
                      <button
                        type="button"
                        onClick={() => handleRemoveIcd(code.code)}
                        className="text-slate-400 hover:text-slate-800 ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Prescription */}
              <div className="border border-slate-200 rounded p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rxCheck"
                    checked={orderRx}
                    onChange={(e) => setOrderRx(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="rxCheck" className="font-semibold text-slate-800 cursor-pointer">
                    Issue Electronic Prescription (Rx)
                  </label>
                </div>

                {orderRx && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-600 mb-0.5">Medication</label>
                      <select
                        value={rxDrugCode}
                        onChange={(e) => setRxDrugCode(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                      >
                        {drugInventory.map((d) => (
                          <option key={d.drugCode} value={d.drugCode}>
                            {d.genericName} ({d.dosageForm}) - Stock: {d.stockQuantity}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Dosage</label>
                      <input
                        type="text"
                        value={rxDosage}
                        onChange={(e) => setRxDosage(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Frequency</label>
                      <input
                        type="text"
                        value={rxFrequency}
                        onChange={(e) => setRxFrequency(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Care Plan */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Care Plan & Clinical Instructions</label>
                <textarea
                  rows={3}
                  value={carePlan}
                  onChange={(e) => setCarePlan(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>

              {/* Disposition */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">Disposition / Clinical Route</label>
                    <select
                      value={referralDestination}
                      onChange={(e) => setReferralDestination(e.target.value as any)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                    >
                      <option value="Pharmacy">Discharge to Pharmacy</option>
                      <option value="IPD Admission">Admit to Inpatient Bed (IPD / Ward)</option>
                      <option value="Emergency">Transfer to Emergency Department</option>
                      <option value="Specialist Referral">Specialist Referral</option>
                      <option value="Home Discharge">Discharge Home</option>
                    </select>
                  </div>
                </div>

                {referralDestination === 'IPD Admission' && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2">
                    <div className="font-semibold text-indigo-950 text-xs flex items-center gap-1.5">
                      <span>Inpatient Ward & Bed Allocation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-700 font-medium mb-1">Target Specialized Ward</label>
                        <select
                          value={targetWard}
                          onChange={(e) => {
                            const newWard = e.target.value as WardCode;
                            setTargetWard(newWard);
                            const firstAvailable = beds.find((b) => b.wardCode === newWard && b.status === 'Available');
                            if (firstAvailable) setTargetBed(firstAvailable.bedNumber);
                          }}
                          className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                        >
                          <option value="GW-MALE">Male General Ward</option>
                          <option value="GW-FEMALE">Female General Ward</option>
                          <option value="ICU">Intensive Care Unit (ICU)</option>
                          <option value="PEDIATRICS">Pediatric Ward</option>
                          <option value="MATERNITY">Maternity & Labour Ward</option>
                          <option value="SURGICAL">Surgical Inpatient Ward</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-700 font-medium mb-1">Select Available Bed</label>
                        <select
                          value={targetBed}
                          onChange={(e) => setTargetBed(e.target.value)}
                          className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                        >
                          {beds
                            .filter((b) => b.wardCode === targetWard && b.status === 'Available')
                            .map((b) => (
                              <option key={b.bedId} value={b.bedNumber}>
                                {b.bedNumber} ({b.oxygenPortAvailable ? 'Oxygen Ready' : 'Standard'})
                              </option>
                            ))}
                          {beds.filter((b) => b.wardCode === targetWard && b.status === 'Available').length === 0 && (
                            <option value="">No beds currently available in this ward (Will queue)</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="text-[11px] text-indigo-800">
                      Finalizing this encounter will immediately admit the patient and mark the bed as Occupied in the IPD Bed Control matrix.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2 rounded transition-colors cursor-pointer"
                >
                  Complete & Save Consultation
                </button>
              </div>
            </form>
          )}

          {/* ENCOUNTER SUMMARY MODAL */}
          {submittedEncounter && (
            <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-4 space-y-3 text-xs shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">Consultation Completed</span>
                  <span className="font-mono text-slate-500">{submittedEncounter.encounterId}</span>
                </div>

                <div className="space-y-1 text-slate-700">
                  <div>Patient: <strong className="text-slate-900">{submittedEncounter.patientName}</strong> (MRN: {submittedEncounter.mrn})</div>
                  <div>Consulting Doctor: <strong className="text-slate-900">{submittedEncounter.doctorName}</strong></div>
                  <div>Diagnosis: <strong className="text-slate-900">{submittedEncounter.icd10Codes.map((c) => c.code).join(', ')}</strong></div>
                  <div>Disposition: <strong className="text-slate-900">{submittedEncounter.referralDestination}</strong></div>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedEncounter(null);
                      setCurrentStep(1);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
