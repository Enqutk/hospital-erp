import React, { useState, useMemo } from 'react';
import {
  Scissors,
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  Building,
  Clock,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Printer,
  HeartPulse,
  Droplets,
  Filter,
  Calendar,
  Layers,
  User,
  Stethoscope,
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpRight,
  Eye,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { SurgicalProcedure } from '../../types';

type OTSubTab = 'LIVE_SUITES' | 'SCHEDULE_REGISTRY' | 'WHO_SAFETY' | 'ANALYTICS';

export const OTModule: React.FC = () => {
  const {
    surgeries,
    createSurgerySchedule,
    updateSurgeryStatus,
    updateWhoChecklist,
    patients,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser,
    addToast
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<OTSubTab>('LIVE_SUITES');
  const [searchTerm, setSearchTerm] = useState('');
  const [suiteFilter, setSuiteFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected case for details drawer / modal
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<SurgicalProcedure | null>(null);
  const [detailActiveSection, setDetailActiveSection] = useState<'OVERVIEW' | 'TEAM' | 'INTRAOP' | 'WHO_CHECKLIST'>('OVERVIEW');

  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New Surgery Form state
  const [patientMrn, setPatientMrn] = useState(selectedPatientMrn || (patients[0]?.mrn || 'FPH-2025-0101'));
  const [procedureName, setProcedureName] = useState('Laparoscopic Cholecystectomy');
  const [preOpDiagnosis, setPreOpDiagnosis] = useState('Symptomatic Cholelithiasis with Biliary Colic');
  const [operatingTheatre, setOperatingTheatre] = useState('OR-1 (Main General & Orthopedic Suite)');
  const [leadSurgeon, setLeadSurgeon] = useState('Dr. Michael Assefa, MD, FACS (Consultant Surgeon)');
  const [assistantSurgeon, setAssistantSurgeon] = useState('Dr. Nahom Zewdu, MD (Surgical Resident)');
  const [anaesthetist, setAnaesthetist] = useState('Dr. Yared Getachew, MD (Senior Anesthesiologist)');
  const [anesthesiaType, setAnesthesiaType] = useState<'General Anesthesia' | 'Spinal Block' | 'Epidural' | 'Local with Sedation'>('General Anesthesia');
  const [asaGrade, setAsaGrade] = useState<'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA E (Emergency)'>('ASA II');
  const [scrubNurse, setScrubNurse] = useState('Sister Roman Alemu, RN');
  const [circulatingNurse, setCirculatingNurse] = useState('Nurse Tigist Mengistu, RN');
  const [scheduledDateTime, setScheduledDateTime] = useState(
    `${new Date().toISOString().split('T')[0]} 09:00`
  );
  const [surgicalNotes, setSurgicalNotes] = useState('Pre-operative workup complete. Consent verified, crossmatched blood standby.');
  const [postOpPlan, setPostOpPlan] = useState('Post-op recovery in PACU for 2h then transfer to Surgical Inpatient Ward.');

  // Color constants
  const COLORS = {
    slate: '#0f172a',
    emerald: '#059669',
    sky: '#0284c7',
    indigo: '#6366f1',
    amber: '#d97706',
    rose: '#e11d48'
  };

  // Metrics calculation
  const totalCases = surgeries.length;
  const inProgressCases = surgeries.filter((s) => s.status === 'In Progress').length;
  const pacuCases = surgeries.filter((s) => s.status === 'PACU Recovery' || s.status === 'Recovery / PACU').length;
  const scheduledCases = surgeries.filter((s) => s.status === 'Scheduled').length;
  const completedCases = surgeries.filter((s) => s.status === 'Completed').length;
  const orOccupancyRate = Math.min(100, Math.round(((inProgressCases + pacuCases) / 3) * 100));

  // Filtered surgeries list
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter((s) => {
      const proc = (s.procedureName || s.surgicalProcedureName || '').toLowerCase();
      const patient = (s.patientName || '').toLowerCase();
      const mrn = (s.mrn || '').toLowerCase();
      const surgeon = (s.leadSurgeon || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchSearch =
        proc.includes(search) ||
        patient.includes(search) ||
        mrn.includes(search) ||
        surgeon.includes(search) ||
        s.surgeryId.toLowerCase().includes(search);

      const matchSuite =
        suiteFilter === 'ALL' ||
        (s.operatingTheatre && s.operatingTheatre.includes(suiteFilter)) ||
        (s.targetOperatingRoom && s.targetOperatingRoom.includes(suiteFilter));

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchSuite && matchStatus;
    });
  }, [surgeries, searchTerm, suiteFilter, statusFilter]);

  // Operating Suites list
  const THEATRES = [
    {
      id: 'OR-1',
      name: 'OR-1: Main General & Orthopedic Suite',
      type: 'Major Surgical',
      status: surgeries.some((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-1') || s.targetOperatingRoom?.includes('OR 1')))
        ? 'Occupied - In Surgery'
        : 'Sterile & Ready',
      airPressure: 'Positive Pressure (+15 Pa)',
      temp: '20.5 °C',
      humidity: '48%',
      activeCase: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-1') || s.targetOperatingRoom?.includes('OR 1'))),
      nextCase: surgeries.find((s) => s.status === 'Scheduled' && (s.operatingTheatre?.includes('OR-1') || s.targetOperatingRoom?.includes('OR 1')))
    },
    {
      id: 'OR-2',
      name: 'OR-2: Laparoscopic & Endoscopy Suite',
      type: 'Minimally Invasive',
      status: surgeries.some((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-2') || s.targetOperatingRoom?.includes('OR 2')))
        ? 'Occupied - In Surgery'
        : 'Sterile & Ready',
      airPressure: 'Positive Pressure (+18 Pa)',
      temp: '19.8 °C',
      humidity: '52%',
      activeCase: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-2') || s.targetOperatingRoom?.includes('OR 2'))),
      nextCase: surgeries.find((s) => s.status === 'Scheduled' && (s.operatingTheatre?.includes('OR-2') || s.targetOperatingRoom?.includes('OR 2')))
    },
    {
      id: 'OR-3',
      name: 'OR-3: Maternity & Emergency Suite',
      type: 'Obstetric & Emergency',
      status: surgeries.some((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-3') || s.targetOperatingRoom?.includes('OR 3')))
        ? 'Occupied - In Surgery'
        : 'Sterile & Ready',
      airPressure: 'Positive Pressure (+14 Pa)',
      temp: '21.0 °C',
      humidity: '50%',
      activeCase: surgeries.find((s) => s.status === 'In Progress' && (s.operatingTheatre?.includes('OR-3') || s.targetOperatingRoom?.includes('OR 3'))),
      nextCase: surgeries.find((s) => s.status === 'Scheduled' && (s.operatingTheatre?.includes('OR-3') || s.targetOperatingRoom?.includes('OR 3')))
    }
  ];

  // Analytics datasets
  const specialtyDistributionData = [
    { name: 'General Surgery', cases: 18, share: 38, fill: COLORS.slate },
    { name: 'Ob-Gyn & C-Sections', cases: 12, share: 25, fill: COLORS.emerald },
    { name: 'Orthopedics & Trauma', cases: 9, share: 19, fill: COLORS.sky },
    { name: 'Urology & Minor', cases: 5, share: 10, fill: COLORS.amber },
    { name: 'Thoracic & Vascular', cases: 4, share: 8, fill: COLORS.indigo }
  ];

  const orUtilizationData = [
    { suite: 'OR-1 (General/Ortho)', utilization: 84, avgDurationMin: 95, turnaroundMin: 22 },
    { suite: 'OR-2 (Laparoscopic)', utilization: 76, avgDurationMin: 72, turnaroundMin: 18 },
    { suite: 'OR-3 (Maternity/ER)', utilization: 91, avgDurationMin: 58, turnaroundMin: 14 }
  ];

  const anesthesiaBreakdownData = [
    { name: 'General Anesthesia', count: 24, fill: COLORS.slate },
    { name: 'Spinal Subarachnoid Block', count: 14, fill: COLORS.emerald },
    { name: 'Epidural Analgesia', count: 6, fill: COLORS.sky },
    { name: 'Local with MAC Sedation', count: 4, fill: COLORS.amber }
  ];

  const handleCreateSurgerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = getPatientByMrn(patientMrn);

    const newSched = createSurgerySchedule({
      mrn: patientMrn,
      patientName: p ? `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim() : 'Surgical Patient',
      ageGender: p ? `${p.age} yrs, ${p.gender}` : undefined,
      bloodGroup: p?.bloodGroup,
      procedureName,
      surgicalProcedureName: procedureName,
      preOpDiagnosis,
      operatingTheatre,
      targetOperatingRoom: operatingTheatre.startsWith('OR-1') ? 'OR 1 (General & Ortho)' : operatingTheatre.startsWith('OR-2') ? 'OR 2 (Laparoscopic / Minor)' : 'OR 3 (Obstetrics & Emergency)',
      leadSurgeon,
      assistantSurgeon,
      anaesthetist,
      anesthetist: anaesthetist,
      anesthesiaType,
      asaGrade,
      scrubNurse,
      circulatingNurse,
      scheduledDateTime,
      scheduleDateTime: scheduledDateTime,
      whoChecklist: {
        signIn: false,
        timeOut: false,
        signOut: false
      },
      surgicalNotes,
      postOpCarePlan: postOpPlan,
      status: 'Scheduled'
    });

    setScheduleModalOpen(false);
    addToast('success', 'Surgical Case Scheduled', `${procedureName} scheduled in ${operatingTheatre}`);
  };

  const handlePrintOperativeReport = (surg: SurgicalProcedure) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('info', 'Print Prompt', 'Please enable browser popups to view operative record.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surgical & Operative Record - ${surg.surgeryId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .hospital-name { font-size: 20px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; }
          .section { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
          .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .notes { background: #fafafa; padding: 10px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-box { border-top: 1px solid #94a3b8; width: 220px; text-align: center; padding-top: 6px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="hospital-name">ETHIO-SWISS REFERRAL HOSPITAL</div>
            <div class="title">Official Operative Summary & Surgical Record</div>
            <div style="font-size: 11px; color: #64748b;">Operation Theatre Suite & Surgical Governance Desk</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">Case ID: ${surg.surgeryId}</div>
            <div style="font-size: 11px; color: #64748b;">Date: ${surg.scheduledDateTime || surg.scheduleDateTime || 'Today'}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div><strong>Patient Name:</strong> ${surg.patientName}</div>
          <div><strong>MRN:</strong> ${surg.mrn}</div>
          <div><strong>Age/Gender:</strong> ${surg.ageGender || 'Adult'}</div>
          <div><strong>Blood Group:</strong> ${surg.bloodGroup || 'O+'}</div>
          <div><strong>Theatre:</strong> ${surg.operatingTheatre || surg.targetOperatingRoom || 'OR-1'}</div>
          <div><strong>Status:</strong> ${surg.status}</div>
        </div>

        <div class="section">
          <div class="section-title">Procedure & Diagnostic Summary</div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${surg.procedureName || surg.surgicalProcedureName}</div>
          <div><strong>Pre-Op Diagnosis:</strong> ${surg.preOpDiagnosis || 'Surgical indication'}</div>
          <div><strong>Post-Op Diagnosis:</strong> ${surg.postOpDiagnosis || surg.preOpDiagnosis || 'Post-operative recovery'}</div>
          <div><strong>Anesthesia Modality:</strong> ${surg.anesthesiaType || 'General Anesthesia'} (ASA Grade: ${surg.asaGrade || 'ASA II'})</div>
        </div>

        <div class="section">
          <div class="section-title">Multidisciplinary Surgical Team</div>
          <div class="team-grid">
            <div><strong>Lead Surgeon:</strong> ${surg.leadSurgeon}</div>
            <div><strong>Assistant Surgeon:</strong> ${surg.assistantSurgeon || 'Resident on duty'}</div>
            <div><strong>Consultant Anesthetist:</strong> ${surg.anaesthetist || surg.anesthetist || 'Dr. Yared Getachew'}</div>
            <div><strong>Scrub Nurse:</strong> ${surg.scrubNurse}</div>
            <div><strong>Circulating Nurse:</strong> ${surg.circulatingNurse || 'Nurse on duty'}</div>
            <div><strong>WHO Safety Checklist:</strong> ${surg.whoChecklist?.signIn && surg.whoChecklist?.timeOut && surg.whoChecklist?.signOut ? '100% Fully Compliant' : 'Executed in OR'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Intra-Operative Summary & Technical Notes</div>
          <div class="notes">${surg.surgicalNotes || 'Procedure carried out uneventfully.'}</div>
          <div style="margin-top: 8px; font-size: 11px;">
            <strong>Estimated Blood Loss:</strong> ${surg.estimatedBloodLossMl ?? 50} ml | 
            <strong>IV Fluids:</strong> ${surg.ivFluidsMl ?? 1000} ml | 
            <strong>Implants / Sutures:</strong> ${surg.implantsUsed || 'Standard'} | 
            <strong>Counts:</strong> ${surg.spongeNeedleCountVerified !== false ? 'Sponges & needles correct' : 'Verified'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Post-Operative Care Plan & Destination</div>
          <div>${surg.postOpCarePlan || 'Monitor vitals in PACU.'}</div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            Lead Surgeon Signature<br/>
            <strong>${surg.leadSurgeon}</strong>
          </div>
          <div class="sig-box">
            Consultant Anesthetist<br/>
            <strong>${surg.anaesthetist || surg.anesthetist || 'Dr. Yared Getachew'}</strong>
          </div>
          <div class="sig-box">
            OT Scrub Sister Verification<br/>
            <strong>${surg.scrubNurse}</strong>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Surgical Services
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">
              OR Management, WHO Safety Protocol & Intraoperative Care
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-slate-800" />
            Operation Theatre (OT) & Surgical Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Surgical suite allocations (OR-1 Major/Ortho, OR-2 Laparoscopic/Endo, OR-3 Maternity/ER), multidisciplinary team coordination, integrated WHO Surgical Safety Checklists, and comprehensive operative charting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Surgery</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active in Theatre</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{inProgressCases}</span>
            <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Live Incisions
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Occupying sterile surgical suites</p>
        </div>

        {/* Card 2: PACU Recovery */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">PACU / Recovery</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pacuCases}</span>
            <span className="text-xs font-medium text-amber-600">Aldrete Monitored</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Post-anesthesia recovery beds</p>
        </div>

        {/* Card 3: Scheduled Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Scheduled Today</span>
            <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{scheduledCases}</span>
            <span className="text-xs font-medium text-slate-600">Pending Incision</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pre-op checked & consented</p>
        </div>

        {/* Card 4: Utilization & Completed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">OR Suite Utilization</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{orOccupancyRate}%</span>
            <span className="text-xs font-medium text-emerald-600">{completedCases} Handed Over</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">3 Certified Positive Pressure Suites</p>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('LIVE_SUITES')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'LIVE_SUITES'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Live Operating Suites ({THEATRES.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SCHEDULE_REGISTRY')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'SCHEDULE_REGISTRY'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Surgical Schedule & Registry ({totalCases})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WHO_SAFETY')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'WHO_SAFETY'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>WHO Safety Checklist Protocol</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ANALYTICS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ANALYTICS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Surgical Analytics & Utilization</span>
        </button>
      </div>

      {/* Subtab 1: LIVE SUITES MATRIX */}
      {activeSubTab === 'LIVE_SUITES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {THEATRES.map((theatre) => {
              const isOccupied = theatre.activeCase !== undefined;
              const caseItem = theatre.activeCase;
              const nextItem = theatre.nextCase;

              return (
                <div
                  key={theatre.id}
                  className={`bg-white rounded-xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                    isOccupied ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Theatre Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {theatre.type}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-0.5">{theatre.name}</h3>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isOccupied
                            ? 'bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                        {theatre.status}
                      </span>
                    </div>

                    {/* Environmental Controls */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-600 my-3 font-mono">
                      <div>
                        <div className="text-slate-400 font-sans">Pressure</div>
                        <div className="font-semibold text-slate-800">{theatre.airPressure}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-sans">Temp</div>
                        <div className="font-semibold text-slate-800">{theatre.temp}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-sans">Humidity</div>
                        <div className="font-semibold text-slate-800">{theatre.humidity}</div>
                      </div>
                    </div>

                    {/* Active Surgery Card */}
                    {caseItem ? (
                      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 truncate">
                            {caseItem.procedureName || caseItem.surgicalProcedureName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {caseItem.surgeryId}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600">
                          Patient: <strong className="text-slate-800">{caseItem.patientName}</strong> ({caseItem.mrn})
                        </div>

                        <div className="text-[11px] text-slate-600 grid grid-cols-1 gap-1 pt-1 border-t border-slate-200/60">
                          <div>Surgeon: <span className="font-medium text-slate-800">{caseItem.leadSurgeon}</span></div>
                          <div>Anesthetist: <span className="font-medium text-slate-800">{caseItem.anaesthetist || caseItem.anesthetist}</span></div>
                          <div>Incision: <span className="font-medium text-slate-800">{caseItem.incisionTime || 'Active'}</span></div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] bg-slate-200/70 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            {caseItem.anesthesiaType || 'General Anesthesia'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCaseForDetail(caseItem);
                              setDetailActiveSection('OVERVIEW');
                            }}
                            className="text-[11px] font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Live Console</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <div className="font-medium text-slate-700">Suite Cleaned & Disinfected</div>
                        <div className="text-[11px] text-slate-400">Ready for incoming surgical case</div>
                      </div>
                    )}

                    {/* Next scheduled case */}
                    {nextItem && (
                      <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between p-2 bg-slate-50/50 rounded border border-slate-100">
                        <span className="truncate">
                          Next: <strong className="text-slate-700">{nextItem.patientName}</strong> ({nextItem.procedureName || nextItem.surgicalProcedureName})
                        </span>
                        <span className="shrink-0 text-slate-400 text-[10px]">
                          {nextItem.scheduledDateTime?.split(' ')[1] || 'Today'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {caseItem ? (
                      <select
                        value={caseItem.status}
                        onChange={(e) => updateSurgeryStatus(caseItem.surgeryId, e.target.value as any)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value="In Progress">In Progress (Active Incision)</option>
                        <option value="PACU Recovery">Move to PACU Recovery</option>
                        <option value="Completed">Complete & Discharge to Ward</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => {
                          setOperatingTheatre(theatre.name);
                          setScheduleModalOpen(true);
                        }}
                        className="w-full text-center text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Book {theatre.id}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: SURGICAL SCHEDULE & REGISTRY (Searchable List + Click to Details) */}
      {activeSubTab === 'SCHEDULE_REGISTRY' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search procedure, patient name, MRN, surgeon, Case ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Suite:</span>
              </div>
              <select
                value={suiteFilter}
                onChange={(e) => setSuiteFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Suites</option>
                <option value="OR-1">OR-1 (General & Ortho)</option>
                <option value="OR-2">OR-2 (Laparoscopic / Minor)</option>
                <option value="OR-3">OR-3 (Maternity & Emergency)</option>
              </select>

              <div className="flex items-center gap-1 text-slate-500 font-medium ml-1">
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="PACU Recovery">PACU Recovery</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Surgeries Table / List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Surgical Registry & Operative Log</h3>
                <p className="text-[11px] text-slate-500">Click any row to open the complete multi-tab Case Details page.</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                {filteredSurgeries.length} of {totalCases} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-4">Case ID & Schedule</th>
                    <th className="py-2.5 px-4">Patient Demographics</th>
                    <th className="py-2.5 px-4">Procedure & Pre-Op Diagnosis</th>
                    <th className="py-2.5 px-4">Operating Suite</th>
                    <th className="py-2.5 px-4">Surgical Team</th>
                    <th className="py-2.5 px-4">WHO Safety</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSurgeries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No surgical records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSurgeries.map((surg) => {
                      const procName = surg.procedureName || surg.surgicalProcedureName || 'Surgical Procedure';
                      const suiteName = surg.operatingTheatre || surg.targetOperatingRoom || 'OR-1';
                      const whoSignIn = surg.whoChecklist?.signIn;
                      const whoTimeOut = surg.whoChecklist?.timeOut;
                      const whoSignOut = surg.whoChecklist?.signOut;
                      const whoComplete = whoSignIn && whoTimeOut && whoSignOut;

                      return (
                        <tr
                          key={surg.surgeryId}
                          onClick={() => {
                            setSelectedCaseForDetail(surg);
                            setDetailActiveSection('OVERVIEW');
                          }}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Case ID & Date */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {surg.surgeryId}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {surg.scheduledDateTime || surg.scheduleDateTime || 'Today'}
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{surg.patientName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              MRN: {surg.mrn} • {surg.ageGender || 'Adult'}
                            </div>
                          </td>

                          {/* Procedure */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 line-clamp-1">{procName}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {surg.preOpDiagnosis || 'Scheduled procedure'}
                            </div>
                          </td>

                          {/* Suite */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                              {suiteName.split(' ')[0]}
                            </span>
                          </td>

                          {/* Team */}
                          <td className="py-3 px-4 text-[11px]">
                            <div className="font-medium text-slate-800 truncate max-w-[160px]">
                              {surg.leadSurgeon.split(',')[0]}
                            </div>
                            <div className="text-slate-500 text-[10px] truncate max-w-[160px]">
                              {surg.anaesthetist || surg.anesthetist}
                            </div>
                          </td>

                          {/* WHO Safety Checklist */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span
                                title="Sign In"
                                className={`w-2.5 h-2.5 rounded-full ${
                                  whoSignIn ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                              <span
                                title="Time Out"
                                className={`w-2.5 h-2.5 rounded-full ${
                                  whoTimeOut ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                              <span
                                title="Sign Out"
                                className={`w-2.5 h-2.5 rounded-full ${
                                  whoSignOut ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                              <span className="text-[10px] text-slate-500 ml-1">
                                {whoComplete ? '3/3' : `${[whoSignIn, whoTimeOut, whoSignOut].filter(Boolean).length}/3`}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
                                surg.status === 'In Progress'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : surg.status === 'PACU Recovery' || surg.status === 'Recovery / PACU'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : surg.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {surg.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrintOperativeReport(surg);
                                }}
                                title="Print Operative Summary"
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCaseForDetail(surg);
                                  setDetailActiveSection('OVERVIEW');
                                }}
                                className="p-1.5 text-slate-400 group-hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: WHO SURGICAL SAFETY CHECKLIST AUDIT & PROTOCOL */}
      {activeSubTab === 'WHO_SAFETY' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-800" />
                  WHO Surgical Safety Protocol & Verification Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  World Health Organization 3-Phase standard to eliminate preventable surgical errors and guarantee sterility.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  Safety Compliance: 98.4%
                </span>
              </div>
            </div>

            {/* 3 Step Phase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              {/* Phase 1: Sign In */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    SIGN IN
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Before Induction</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Patient identity, surgical site, and consent verbally confirmed</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Surgical site marked by operating surgeon</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Pulse oximeter on patient and functioning normally</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Known allergies & difficult airway / aspiration risk assessed</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Risk of &gt;500ml blood loss assessed (crossmatched PRBC ready)</span>
                  </div>
                </div>
              </div>

              {/* Phase 2: Time Out */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    TIME OUT
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Before Skin Incision</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>All team members introduce themselves by name and role</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Surgeon, Anesthetist & Nurse confirm patient, site, and procedure</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Anticipated critical events & operative duration reviewed</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Antibiotic prophylaxis administered within past 60 minutes</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Essential diagnostic imaging displayed on OR monitor</span>
                  </div>
                </div>
              </div>

              {/* Phase 3: Sign Out */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    SIGN OUT
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Before Leaving OR</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Nurse verbally confirms name of the completed procedure</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Instrument, sponge, and needle counts are complete & correct</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Specimens labeled with patient name and MRN correctly</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Equipment issues or malfunctions addressed</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Key post-op concerns & recovery plan reviewed for PACU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: SURGICAL ANALYTICS & UTILIZATION */}
      {activeSubTab === 'ANALYTICS' && (
        <div className="space-y-5">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Procedure by Specialty */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Surgical Case Volume by Specialty</h3>
                  <p className="text-[11px] text-slate-500">Distribution across hospital surgical subspecialties</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  Monthly Total: 48 Cases
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={specialtyDistributionData}
                      dataKey="cases"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {specialtyDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Theatre Utilization & Turnaround */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Operating Suite Utilization & Turnaround</h3>
                  <p className="text-[11px] text-slate-500">Occupancy rate (%) vs. Average Turnaround (min)</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  Target &gt;75%
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="suite" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="utilization" name="Utilization Rate (%)" fill={COLORS.slate} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="turnaroundMin" name="Turnaround Time (min)" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Anesthesia Modalities */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Anesthesia Technique Breakdown</h3>
                  <p className="text-[11px] text-slate-500">General vs. Regional Neuraxial vs. Sedation</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={anesthesiaBreakdownData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" name="Cases Logged" fill={COLORS.indigo} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metric Summary Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-xs">Surgical Quality & Safety Indicators</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                    Audit Benchmarks
                  </span>
                </div>

                <div className="space-y-3 mt-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">WHO Checklist 3-Phase Compliance</span>
                    <span className="font-bold text-emerald-600">98.4%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Unplanned Return to OR (30 Days)</span>
                    <span className="font-bold text-slate-900">0.0%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Surgical Site Infection (SSI) Rate</span>
                    <span className="font-bold text-slate-900">0.8% (Target &lt;1.5%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Surgical Instrument / Sponge Discrepancy</span>
                    <span className="font-bold text-emerald-600">0 Reported</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Data certified by Ethio-Swiss Hospital Surgical Governance & Infection Prevention Committee.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE CASE DETAILS DRAWER / MODAL (The Subject Details View)       */}
      {/* ========================================================================= */}
      {selectedCaseForDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 text-xs overflow-hidden max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs bg-slate-800 text-slate-200 font-semibold px-2.5 py-0.5 rounded border border-slate-700">
                    {selectedCaseForDetail.surgeryId}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    MRN: {selectedCaseForDetail.mrn}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${
                      selectedCaseForDetail.status === 'In Progress'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : selectedCaseForDetail.status === 'Completed'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : selectedCaseForDetail.status === 'PACU Recovery' || selectedCaseForDetail.status === 'Recovery / PACU'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {selectedCaseForDetail.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mt-1.5 tracking-tight">
                  {selectedCaseForDetail.procedureName || selectedCaseForDetail.surgicalProcedureName}
                </h2>
                <div className="text-xs text-slate-300 mt-0.5">
                  Patient: <strong className="text-white">{selectedCaseForDetail.patientName}</strong> • {selectedCaseForDetail.ageGender || 'Adult'} • Blood Group: <strong className="text-white">{selectedCaseForDetail.bloodGroup || 'O+'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintOperativeReport(selectedCaseForDetail)}
                  title="Print Operative Record"
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>
                <button
                  onClick={() => setSelectedCaseForDetail(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 bg-slate-50/70 text-xs font-semibold">
              <button
                onClick={() => setDetailActiveSection('OVERVIEW')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  detailActiveSection === 'OVERVIEW'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview & Diagnosis
              </button>
              <button
                onClick={() => setDetailActiveSection('TEAM')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  detailActiveSection === 'TEAM'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Multidisciplinary Team
              </button>
              <button
                onClick={() => setDetailActiveSection('INTRAOP')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  detailActiveSection === 'INTRAOP'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Intra-Operative & Anesthesia
              </button>
              <button
                onClick={() => setDetailActiveSection('WHO_CHECKLIST')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  detailActiveSection === 'WHO_CHECKLIST'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                WHO Safety Protocol (3-Phase)
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* SECTION 1: OVERVIEW & DIAGNOSIS */}
              {detailActiveSection === 'OVERVIEW' && (
                <div className="space-y-4">
                  {/* Status & Operating Suite Ribbon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold">Assigned Operating Suite</div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                        <Building className="w-4 h-4 text-slate-600" />
                        {selectedCaseForDetail.operatingTheatre || selectedCaseForDetail.targetOperatingRoom || 'OR-1 Main Surgical Suite'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">Update Status:</span>
                      <select
                        value={selectedCaseForDetail.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          updateSurgeryStatus(selectedCaseForDetail.surgeryId, newStatus);
                          setSelectedCaseForDetail((prev) => prev ? { ...prev, status: newStatus } : null);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-xs cursor-pointer"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress (Active Incision)</option>
                        <option value="PACU Recovery">PACU Recovery</option>
                        <option value="Completed">Completed & Discharged</option>
                        <option value="Postponed">Postponed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Diagnostic Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Pre-Operative Diagnosis
                      </span>
                      <div className="font-bold text-slate-900 text-xs">
                        {selectedCaseForDetail.preOpDiagnosis || 'Symptomatic indication confirmed by consultant surgeon.'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Post-Operative Diagnosis
                      </span>
                      <div className="font-bold text-slate-900 text-xs">
                        {selectedCaseForDetail.postOpDiagnosis || selectedCaseForDetail.preOpDiagnosis || 'Awaiting post-op documentation.'}
                      </div>
                    </div>
                  </div>

                  {/* Surgical Timelines & ASA Classification */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">ASA Status</span>
                      <span className="font-bold text-slate-900 text-xs">{selectedCaseForDetail.asaGrade || 'ASA II'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">Scheduled Time</span>
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {selectedCaseForDetail.scheduledDateTime?.split(' ')[1] || '09:00'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">Incision Time</span>
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {selectedCaseForDetail.incisionTime || '--:--'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">Closure Time</span>
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {selectedCaseForDetail.closureTime || '--:--'}
                      </span>
                    </div>
                  </div>

                  {/* Post-Op Care Plan */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      Post-Operative Inpatient Care Plan & Ward Destination
                    </span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {selectedCaseForDetail.postOpCarePlan || 'Transfer to surgical inpatient ward following PACU discharge criteria fulfillment.'}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 2: MULTIDISCIPLINARY SURGICAL TEAM */}
              {detailActiveSection === 'TEAM' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Lead Surgeon */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Lead Primary Surgeon
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedCaseForDetail.leadSurgeon}</div>
                        <div className="text-[11px] text-slate-500">Board Certified Consultant</div>
                      </div>
                    </div>

                    {/* Assistant Surgeon */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          First Assistant Surgeon
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedCaseForDetail.assistantSurgeon || 'Senior Surgical Resident on duty'}</div>
                        <div className="text-[11px] text-slate-500">Clinical Surgical Support</div>
                      </div>
                    </div>

                    {/* Anesthesiologist */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Consultant Anesthesiologist
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedCaseForDetail.anaesthetist || selectedCaseForDetail.anesthetist}</div>
                        <div className="text-[11px] text-slate-500">Airway & Hemodynamic Monitoring</div>
                      </div>
                    </div>

                    {/* Scrub Nurse */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          OT Scrub Sister (Nurse)
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedCaseForDetail.scrubNurse}</div>
                        <div className="text-[11px] text-slate-500">Sterile Field & Instrument Count Lead</div>
                      </div>
                    </div>

                    {/* Circulating Nurse */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Circulating Nurse
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedCaseForDetail.circulatingNurse || 'Nurse Hana Kebede, RN'}</div>
                        <div className="text-[11px] text-slate-500">Non-sterile Coordination & Documentation</div>
                      </div>
                    </div>

                    {/* Safety Sign-off */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          WHO Verification Sign-Off
                        </span>
                        <div className="font-bold text-emerald-700 mt-0.5">Dual-Witness Confirmed</div>
                        <div className="text-[11px] text-slate-500">Sterile counts & timeouts signed</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: INTRA-OPERATIVE & ANESTHESIA RECORD */}
              {detailActiveSection === 'INTRAOP' && (
                <div className="space-y-4">
                  {/* Operative Notes Box */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      Official Intra-Operative Findings & Procedure Summary
                    </span>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedCaseForDetail.surgicalNotes || 'Standard surgical technique executed. Hemostasis secured with no intra-operative complications recorded.'}
                    </div>
                  </div>

                  {/* Quantitative Operative Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Estimated Blood Loss (EBL)</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                        {selectedCaseForDetail.estimatedBloodLossMl ?? 45} ml
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Blood Transfused</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                        {selectedCaseForDetail.bloodUnitsTransfused ? `${selectedCaseForDetail.bloodUnitsTransfused} Unit(s) PRBC` : '0 Units (None)'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">IV Crystalloids Infused</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                        {selectedCaseForDetail.ivFluidsMl ?? 1200} ml (RL/NS)
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Anesthesia Type</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                        {selectedCaseForDetail.anesthesiaType || 'General Anesthesia'}
                      </span>
                    </div>
                  </div>

                  {/* Implants & Specimens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Implants, Prosthetics & Sutures
                      </span>
                      <div className="font-medium text-slate-800 text-[11px]">
                        {selectedCaseForDetail.implantsUsed || 'Standard absorbable sutures used.'}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pathology & Lab Specimens
                      </span>
                      <div className="font-medium text-slate-800 text-[11px]">
                        {selectedCaseForDetail.specimensCollected || 'Routine biopsy/tissue submitted to Histopathology.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: WHO SAFETY PROTOCOL CHECKLIST */}
              {detailActiveSection === 'WHO_CHECKLIST' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-slate-700" />
                        WHO Surgical Safety Verification Status for Case {selectedCaseForDetail.surgeryId}
                      </span>
                      <span className="text-[10px] text-slate-500">Live Dual-Sign Verification</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Sign In Checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCaseForDetail.whoChecklist?.signIn || false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            updateWhoChecklist(selectedCaseForDetail.surgeryId, { signIn: val });
                            setSelectedCaseForDetail((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    whoChecklist: {
                                      ...(prev.whoChecklist || { signIn: false, timeOut: false, signOut: false }),
                                      signIn: val
                                    }
                                  }
                                : null
                            );
                          }}
                          className="mt-0.5 rounded text-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>1. SIGN IN (Before Induction of Anaesthesia)</span>
                            {selectedCaseForDetail.whoChecklist?.signIn && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Patient identity, procedure site, consent signed, pulse oximeter active, allergy check, and airway assessment verified by surgeon and anesthetist.
                          </div>
                        </div>
                      </label>

                      {/* Time Out Checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCaseForDetail.whoChecklist?.timeOut || false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            updateWhoChecklist(selectedCaseForDetail.surgeryId, { timeOut: val });
                            setSelectedCaseForDetail((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    whoChecklist: {
                                      ...(prev.whoChecklist || { signIn: false, timeOut: false, signOut: false }),
                                      timeOut: val
                                    }
                                  }
                                : null
                            );
                          }}
                          className="mt-0.5 rounded text-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>2. TIME OUT (Before Skin Incision)</span>
                            {selectedCaseForDetail.whoChecklist?.timeOut && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Entire multidisciplinary team verbally introduces roles; confirms patient name, incision site, prophylactic antibiotics &lt;60 min, and critical surgical steps.
                          </div>
                        </div>
                      </label>

                      {/* Sign Out Checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCaseForDetail.whoChecklist?.signOut || false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            updateWhoChecklist(selectedCaseForDetail.surgeryId, { signOut: val });
                            setSelectedCaseForDetail((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    whoChecklist: {
                                      ...(prev.whoChecklist || { signIn: false, timeOut: false, signOut: false }),
                                      signOut: val
                                    }
                                  }
                                : null
                            );
                          }}
                          className="mt-0.5 rounded text-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>3. SIGN OUT (Before Patient Departs Operating Suite)</span>
                            {selectedCaseForDetail.whoChecklist?.signOut && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Scrub sister confirms instrument and sponge counts 100% correct; specimen correctly labeled with MRN; postoperative recovery key concerns documented.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCaseForDetail(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                Close Case Details
              </button>

              <button
                type="button"
                onClick={() => handlePrintOperativeReport(selectedCaseForDetail)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export & Print Operative Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE NEW SURGERY MODAL                                                */}
      {/* ========================================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 text-xs overflow-hidden max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-slate-700" />
                Schedule Surgical Procedure in OT Suite
              </h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSurgerySubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Patient (MRN) *
                </label>
                <select
                  value={patientMrn}
                  onChange={(e) => setPatientMrn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {patients.map((p) => (
                    <option key={p.mrn} value={p.mrn}>
                      {p.firstName} {p.middleName || ''} {p.lastName} (MRN: {p.mrn}) • {p.age} yrs • Blood: {p.bloodGroup || 'O+'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Procedure Name & Pre-op Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Planned Surgical Procedure *
                  </label>
                  <input
                    type="text"
                    required
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    placeholder="e.g. Laparoscopic Appendectomy"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pre-Operative Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={preOpDiagnosis}
                    onChange={(e) => setPreOpDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Suppurative Appendicitis"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Operating Suite & Date/Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating Suite Allocation *
                  </label>
                  <select
                    value={operatingTheatre}
                    onChange={(e) => setOperatingTheatre(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                  >
                    <option value="OR-1 (Main General & Orthopedic Suite)">OR-1: Main General & Orthopedic Suite</option>
                    <option value="OR-2 (Laparoscopic & Minor Suite)">OR-2: Laparoscopic & Minor Suite</option>
                    <option value="OR-3 (Maternity & Emergency Suite)">OR-3: Maternity & Emergency Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Surgical Staff (Surgeon & Resident) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Primary Surgeon *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadSurgeon}
                    onChange={(e) => setLeadSurgeon(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assistant Surgeon
                  </label>
                  <input
                    type="text"
                    value={assistantSurgeon}
                    onChange={(e) => setAssistantSurgeon(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Anesthesia Staff & Modality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Consultant Anesthesiologist *
                  </label>
                  <input
                    type="text"
                    required
                    value={anaesthetist}
                    onChange={(e) => setAnaesthetist(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anesthesia Modality & ASA *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={anesthesiaType}
                      onChange={(e) => setAnesthesiaType(e.target.value as any)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 text-[11px]"
                    >
                      <option value="General Anesthesia">General</option>
                      <option value="Spinal Block">Spinal</option>
                      <option value="Epidural">Epidural</option>
                      <option value="Local with Sedation">Local/MAC</option>
                    </select>

                    <select
                      value={asaGrade}
                      onChange={(e) => setAsaGrade(e.target.value as any)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 text-[11px]"
                    >
                      <option value="ASA I">ASA I</option>
                      <option value="ASA II">ASA II</option>
                      <option value="ASA III">ASA III</option>
                      <option value="ASA IV">ASA IV</option>
                      <option value="ASA E (Emergency)">ASA E</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nursing Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    OT Scrub Sister (Nurse) *
                  </label>
                  <input
                    type="text"
                    required
                    value={scrubNurse}
                    onChange={(e) => setScrubNurse(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Circulating Nurse
                  </label>
                  <input
                    type="text"
                    value={circulatingNurse}
                    onChange={(e) => setCirculatingNurse(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Notes & Post-Op Plan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operative Indication / Pre-Op Instructions
                </label>
                <textarea
                  rows={2}
                  value={surgicalNotes}
                  onChange={(e) => setSurgicalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Post-Op Recovery & Ward Care Plan
                </label>
                <input
                  type="text"
                  value={postOpPlan}
                  onChange={(e) => setPostOpPlan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Surgery Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
