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
  CheckCircle,
  X,
  User,
  ShieldCheck,
  Sparkles
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

  const [activeStation, setActiveStation] = useState<number>(currentUser.stationNumber || 2);
  const [queueTab, setQueueTab] = useState<'CURRENT_ROOM' | 'RESULTS_READY' | 'ALL_ROOMS'>('CURRENT_ROOM');
  const [currentStep, setCurrentStep] = useState<OPDStep>(1);

  const currentStationInfo: OPDStationInfo =
    OPD_STATIONS.find((s) => s.stationNumber === activeStation) || OPD_STATIONS[0];

  const patient = selectedPatientMrn ? getPatientByMrn(selectedPatientMrn) : patients[0];
  const patientAge = patient ? calculateAge(patient.dob) : 38;

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
            quantity: rxDuration * (rxFrequency.includes('TID') ? 3 : rxFrequency.includes('BID') ? 2 : 1),
            dispensedStatus: 'Pending'
          }
        ]
      });
    }

    setSubmittedEncounter(encounter);
  };

  const stepsList = [
    { num: 1, label: '1. Patient Card' },
    { num: 2, label: '2. Subjective' },
    { num: 3, label: '3. Objective & Vitals' },
    { num: 4, label: '4. Diagnostics' },
    { num: 5, label: '5. Assessment & Rx' }
  ];

  const priorEncounters = opdEncounters.filter((e) => e.mrn === patient?.mrn);
  const patientLabResults = labOrders.filter((l) => l.mrn === patient?.mrn);
  const patientRadReports = radiologyOrders.filter((r) => r.mrn === patient?.mrn);

  return (
    <div className="space-y-4 text-xs">
      
      {/* Station Selector & Physician Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                {currentStationInfo.name}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Station {activeStation}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Attending: <strong className="text-slate-800">{currentStationInfo.doctorName}</strong> • {currentStationInfo.specialty}
            </p>
          </div>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {OPD_STATIONS.map((stn) => {
            const isSelected = activeStation === stn.stationNumber;
            const count = (opdQueue || []).filter(
              (q) => q.assignedRoom === stn.stationNumber && q.status === 'Waiting'
            ).length;
            const readyCount = (opdQueue || []).filter(
              (q) => q.assignedRoom === stn.stationNumber && q.status === 'Results Ready'
            ).length;

            return (
              <button
                key={stn.stationNumber}
                type="button"
                onClick={() => setActiveStation(stn.stationNumber)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>Room {stn.stationNumber}</span>
                {readyCount > 0 && (
                  <span className="px-1 bg-emerald-600 text-white text-[10px] rounded-full font-bold">
                    +{readyCount}
                  </span>
                )}
                {count > 0 && readyCount === 0 && (
                  <span className={`px-1 text-[10px] rounded-full font-bold ${
                    isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN 2-COLUMN WORKSTATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: ROOM QUEUE PANEL (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          
          {/* Header & Quick Call Next Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs">
              Room {activeStation} Waiting Queue
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {waitingInCurrentRoom.length + resultsReadyInCurrentRoom.length} queued
            </span>
          </div>

          <button
            type="button"
            onClick={handleCallNextPatient}
            disabled={waitingInCurrentRoom.length === 0 && resultsReadyInCurrentRoom.length === 0}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              resultsReadyInCurrentRoom.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : waitingInCurrentRoom.length > 0
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>
              {resultsReadyInCurrentRoom.length > 0
                ? `Call Results Ready (${resultsReadyInCurrentRoom[0]?.tokenNumber})`
                : waitingInCurrentRoom.length > 0
                ? `Call Next Patient (${waitingInCurrentRoom[0]?.tokenNumber})`
                : 'No Patients Waiting'}
            </span>
          </button>

          {/* Queue Tab Switchers */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setQueueTab('CURRENT_ROOM')}
              className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                queueTab === 'CURRENT_ROOM' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Room ({currentRoomQueue.length})
            </button>
            <button
              type="button"
              onClick={() => setQueueTab('RESULTS_READY')}
              className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                queueTab === 'RESULTS_READY' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Ready ({totalResultsReadyAllRooms})
            </button>
            <button
              type="button"
              onClick={() => setQueueTab('ALL_ROOMS')}
              className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                queueTab === 'ALL_ROOMS' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All ({totalWaitingAllRooms})
            </button>
          </div>

          {/* Queue List Stream */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
            {queueTab === 'CURRENT_ROOM' ? (
              currentRoomQueue.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Users className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  No patients waiting in Room {activeStation}
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
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : isResultsReady
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
                          : isAwaitingDiag
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100/60'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.tokenNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-slate-800 text-white'
                            : isResultsReady
                            ? 'bg-emerald-200 text-emerald-900'
                            : isAwaitingDiag
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className={`font-bold mt-1 text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.patientName}
                      </div>

                      <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.mrn} • {item.priority}
                      </div>

                      {item.awaitingDiagnosticsNotes && (
                        <div className={`mt-1.5 p-1.5 rounded text-[10px] ${
                          isSelected ? 'bg-slate-800 text-slate-200' : 'bg-white/80 border border-slate-200 text-slate-600'
                        }`}>
                          {item.awaitingDiagnosticsNotes}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : queueTab === 'RESULTS_READY' ? (
              (opdQueue || []).filter((q) => q.status === 'Results Ready').length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No diagnostic returns pending.
                </div>
              ) : (
                (opdQueue || [])
                  .filter((q) => q.status === 'Results Ready')
                  .map((item) => (
                    <div
                      key={item.queueId}
                      onClick={() => handleSelectQueueItem(item)}
                      className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-950">
                          {item.tokenNumber} (Room {item.assignedRoom})
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold">
                          Results Ready
                        </span>
                      </div>
                      <div className="font-bold text-emerald-950 mt-1">{item.patientName}</div>
                      <div className="text-emerald-800 text-[11px] font-mono">MRN: {item.mrn}</div>
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
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        activeStation === stn.stationNumber
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span>{stn.name}</span>
                      <span className="font-mono text-[11px] opacity-80">{stnWaiting} wait</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CLINICAL ENCOUNTER WORKBENCH (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Top 5-Step Stepper Bar */}
          <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-[11px]">
            {stepsList.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num as OPDStep)}
                className={`py-2 px-1 rounded-lg font-bold transition-all text-center cursor-pointer truncate ${
                  currentStep === st.num
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* STEP 1: PATIENT DEMOGRAPHICS & MEDICAL HISTORY */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Step 1: Patient Details & Background</span>
                <span className="font-mono text-slate-500 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {patient?.mrn}
                </span>
              </div>

              {/* Patient Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="text-base font-bold text-slate-900">{patient?.firstName} {patient?.middleName} {patient?.lastName}</div>
                  <div className="text-slate-600">Gender: <strong className="text-slate-800">{patient?.gender}</strong> • Age: <strong className="text-slate-800">{patientAge} yrs</strong> (DOB: {patient?.dob})</div>
                  <div className="text-slate-600">Phone: <strong className="text-slate-800">{patient?.phoneNumber}</strong></div>
                  <div className="text-slate-600">Payer: <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">{patient?.paymentCategory}</span></div>
                </div>

                <div className="space-y-1 md:border-l md:border-slate-200 md:pl-4">
                  <div className="text-slate-600">Blood Group: <strong className="text-rose-700 font-bold text-sm">{patient?.bloodGroup || 'O+'}</strong></div>
                  <div className="text-slate-600">National ID: <strong className="font-mono text-slate-800">{patient?.nationalId || 'ETH-99384721'}</strong></div>
                  <div className="text-slate-600">Emergency Contact: {patient?.emergencyContactName} ({patient?.emergencyContactRelationship}) - {patient?.emergencyContactPhone}</div>
                  <div className="text-rose-700 font-semibold mt-1">Allergies: {patient?.allergies?.join(', ') || 'No known drug allergies'}</div>
                </div>
              </div>

              {/* Prior Outpatient Encounters */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs">Prior Encounters at FPH ({priorEncounters.length})</span>
                {priorEncounters.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    No prior medical records for this patient.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {priorEncounters.map((enc) => (
                      <div key={enc.encounterId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{enc.timestamp} • Room {enc.stationNumber}</span>
                          <span className="text-slate-500 font-semibold">{enc.doctorName}</span>
                        </div>
                        <div className="text-slate-700 text-xs"><strong>Complaints:</strong> {enc.chiefComplaints}</div>
                        <div className="text-slate-600 text-xs"><strong>Plan:</strong> {enc.carePlan}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Navigation Button */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>Next: Subjective History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SUBJECTIVE HISTORY & SYMPTOMS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Step 2: Subjective History & Symptoms</span>
                <span className="text-slate-400 text-[11px]">Patient reported clinical complaints</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Chief Complaint *</label>
                  <input
                    type="text"
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    placeholder="Enter main reason for encounter..."
                    className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">History of Presenting Illness (HPI)</label>
                  <textarea
                    rows={3}
                    value={subjectiveSymptoms}
                    onChange={(e) => setSubjectiveSymptoms(e.target.value)}
                    placeholder="Onset, character, severity, radiation, associated symptoms..."
                    className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Past Medical, Surgical & Family History</label>
                  <input
                    type="text"
                    value={medicalHistoryNotes}
                    onChange={(e) => setMedicalHistoryNotes(e.target.value)}
                    placeholder="Prior illnesses, chronic conditions, surgeries, tobacco/alcohol..."
                    className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>Next: Vitals & Exam</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OBJECTIVE VITALS & PHYSICAL EXAMINATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Step 3: Objective Vitals & Physical Exam</span>
                <span className="text-slate-400 text-[11px]">Triage and physician physical examination</span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure (mmHg)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                      className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white text-center"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="number"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                      className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.tempCelsius}
                    onChange={(e) => setVitals({ ...vitals, tempCelsius: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitals.spO2}
                    onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={vitals.respRate}
                    onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={fastingBloodSugar}
                    onChange={(e) => setFastingBloodSugar(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>

              {/* Physical Exam Findings */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Physical Examination Findings</label>
                <textarea
                  rows={3}
                  value={objectiveObservations}
                  onChange={(e) => setObjectiveObservations(e.target.value)}
                  placeholder="Systemic examination findings (HEENT, Chest, CVS, Abdomen, Neuro, Extremities)..."
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>Next: Diagnostic Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DIAGNOSTIC WORKUP (LAB & RADIOLOGY) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Step 4: Diagnostic Workup & Results</span>
                <span className="text-slate-400 text-[11px]">Order and review investigations</span>
              </div>

              {/* Orders Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Lab Order */}
                <div className={`p-4 rounded-xl border transition-all ${
                  orderLab ? 'bg-teal-50/50 border-teal-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-slate-900 text-xs">Laboratory Investigation</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderLab}
                      onChange={(e) => setOrderLab(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                  </div>

                  {orderLab && (
                    <select
                      value={labTestType}
                      onChange={(e) => setLabTestType(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden cursor-pointer"
                    >
                      <option value="H_PYLORI_STOOL">H. Pylori Stool Antigen (ETB 150)</option>
                      <option value="CBC_DIFF">Complete Blood Count (CBC) (ETB 180)</option>
                      <option value="LFT_RFT">Liver & Renal Function Panel (ETB 250)</option>
                      <option value="RPR_VDRL">RPR / VDRL Syphilis Screen (ETB 100)</option>
                    </select>
                  )}
                </div>

                {/* Radiology Order */}
                <div className={`p-4 rounded-xl border transition-all ${
                  orderRadiology ? 'bg-sky-50/50 border-sky-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-sky-700" />
                      <span className="font-bold text-slate-900 text-xs">Radiology & Imaging</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderRadiology}
                      onChange={(e) => setOrderRadiology(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </div>

                  {orderRadiology && (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={radiologyType}
                        onChange={(e) => setRadiologyType(e.target.value as any)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden cursor-pointer"
                      >
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="X-Ray">Digital X-Ray</option>
                        <option value="CT">CT Scan</option>
                      </select>
                      <input
                        type="text"
                        value={radiologyRegion}
                        onChange={(e) => setRadiologyRegion(e.target.value)}
                        placeholder="e.g. Abdomen, Chest..."
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Results Section */}
              {(patientLabResults.length > 0 || patientRadReports.length > 0) && (
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Active Diagnostic Results for Patient</span>
                    <button
                      type="button"
                      onClick={handleSimulateDiagnosticsCompletion}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      ⚡ Fast-Track Diagnostic Return
                    </button>
                  </div>

                  {patientLabResults.map((lr) => (
                    <div key={lr.labOrderId} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{lr.testName}</span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {lr.verificationStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {lr.results.map((r, i) => (
                          <span key={i} className="mr-3 font-medium">
                            {r.parameter}: <strong className={r.isAbnormal ? 'text-rose-600' : 'text-slate-900'}>{r.value} {r.unit}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  {(orderLab || orderRadiology) && (
                    <button
                      type="button"
                      onClick={handleSendToDiagnostics}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Diagnostics</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Next: Assessment & Rx</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ASSESSMENT, ICD-10, PRESCRIPTIONS & CARE PLAN */}
          {currentStep === 5 && (
            <form onSubmit={handleFinalizeEncounter} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Step 5: Assessment, Diagnosis & Prescription</span>
                <span className="text-slate-400 text-[11px]">Final physician sign-off</span>
              </div>

              {/* ICD-10 Diagnosis Selector */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 text-xs">ICD-10 Clinical Diagnosis *</label>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={icdSearch}
                    onChange={(e) => setIcdSearch(e.target.value)}
                    placeholder="Search ICD-10 by code or disease name (e.g. Gastritis, Malaria, Hypertension)..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden"
                  />
                </div>

                {icdSearch && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto space-y-1">
                    {filteredIcd10.map((item) => (
                      <div
                        key={item.code}
                        onClick={() => {
                          handleAddIcd(item);
                          setIcdSearch('');
                        }}
                        className="p-1.5 hover:bg-white rounded-md text-xs cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900">{item.description}</span>
                        <span className="font-mono text-slate-500 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px]">
                          {item.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Diagnosis Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedIcdCodes.map((item) => (
                    <span
                      key={item.code}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold rounded-lg text-xs"
                    >
                      <span>{item.description} ({item.code})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIcd(item.code)}
                        className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Prescription Builder */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900 text-xs">E-Prescription Order</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderRx}
                    onChange={(e) => setOrderRx(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {orderRx && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Medication</label>
                      <select
                        value={rxDrugCode}
                        onChange={(e) => setRxDrugCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden cursor-pointer font-medium"
                      >
                        {drugInventory.map((d) => (
                          <option key={d.drugCode} value={d.drugCode}>
                            {d.genericName} ({d.stockOnHand} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Frequency</label>
                      <input
                        type="text"
                        value={rxFrequency}
                        onChange={(e) => setRxFrequency(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={rxDuration}
                        onChange={(e) => setRxDuration(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-hidden font-bold font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Care Plan & Referral Destination */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Clinical Care Plan & Instructions</label>
                  <textarea
                    rows={2}
                    value={carePlan}
                    onChange={(e) => setCarePlan(e.target.value)}
                    placeholder="Patient advice, dietary notes, return warnings..."
                    className="w-full px-3 py-1.5 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Disposition Pathway</label>
                  <select
                    value={referralDestination}
                    onChange={(e) => setReferralDestination(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-semibold"
                  >
                    <option value="Pharmacy">Outpatient Pharmacy</option>
                    <option value="IPD Admission">Inpatient Bed Admission</option>
                    <option value="Emergency">Emergency Transfer</option>
                    <option value="Discharge">Direct Home Discharge</option>
                  </select>
                </div>
              </div>

              {/* Form Navigation & Sign-off Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete & Sign Encounter</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* ENCOUNTER SUBMITTED CONFIRMATION BANNER */}
      {submittedEncounter && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">
                Clinical Encounter Completed & Signed ({submittedEncounter.encounterId})
              </div>
              <div className="text-emerald-800 text-[11px]">
                Encounter chart saved to EMR. Dispatched to: {submittedEncounter.referralDestination}.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmittedEncounter(null)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

    </div>
  );
};
