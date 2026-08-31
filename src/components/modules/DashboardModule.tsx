import React, { useMemo } from 'react';
import {
  Activity,
  Users,
  Stethoscope,
  BedDouble,
  AlertOctagon,
  FlaskConical,
  Pill,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Droplet,
  Scissors,
  Scan,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { ReceptionAnalyticsView } from '../reception/ReceptionAnalyticsView';
import { LabAnalyticsView } from '../lab/LabAnalyticsView';
import { IPDAnalyticsView } from '../ipd/IPDAnalyticsView';
import { PharmacyAnalyticsView } from '../pharmacy/PharmacyAnalyticsView';
import { DoctorAnalyticsView } from '../opd/DoctorAnalyticsView';
import { EmergencyAnalyticsView } from '../emergency/EmergencyAnalyticsView';

const PALETTE = {
  emerald: '#059669',
  teal: '#0d9488',
  sky: '#0284c7',
  indigo: '#6366f1',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#0f172a',
  slateMuted: '#64748b'
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-800 text-xs space-y-1">
        {label && <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color || entry.fill || PALETTE.emerald }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-white font-mono">
              {typeof entry.value === 'number' && (entry.name?.toLowerCase().includes('revenue') || entry.name?.toLowerCase().includes('birr'))
                ? `ETB ${entry.value.toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardModule: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    patients = [],
    opdQueue = [],
    opdEncounters = [],
    beds = [],
    ipdAdmissions = [],
    emergencyRecords = [],
    labOrders = [],
    bloodUnits = [],
    prescriptions = [],
    drugInventory = [],
    bills = [],
    transactions = [],
    staffList = [],
    surgicalProcedures = [],
    auditLogs = []
  } = useHospital();

  const [adminAnalyticsTab, setAdminAnalyticsTab] = React.useState<'EXECUTIVE' | 'RECEPTION' | 'OPD' | 'EMERGENCY' | 'LAB' | 'PHARMACY' | 'IPD'>('EXECUTIVE');

  if (currentUser.role === 'RECEPTIONIST') {
    return <ReceptionAnalyticsView />;
  }

  if (currentUser.role === 'OPD_DOCTOR') {
    return <DoctorAnalyticsView />;
  }

  if (currentUser.role === 'EMERGENCY_OFFICER') {
    return <EmergencyAnalyticsView />;
  }

  if (currentUser.role === 'LAB_TECH') {
    return <LabAnalyticsView />;
  }

  if (currentUser.role === 'PHARMACIST') {
    return <PharmacyAnalyticsView />;
  }

  if (currentUser.role === 'IPD_NURSE') {
    return <IPDAnalyticsView />;
  }

  // Metrics calculations
  const totalPatients = patients.length;
  const waitingOPD = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const inConsultationOPD = (opdQueue || []).filter((q) => q.status === 'In Consultation').length;

  const occupiedBeds = (beds || []).filter((b) => b.status === 'Occupied').length;
  const totalBeds = beds.length || 1;
  const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const emergencyActive = (emergencyRecords || []).filter(
    (e) => e.status === 'Triaged' || e.status === 'In Trauma Bay'
  ).length;
  const criticalEmergencyCount = (emergencyRecords || []).filter(
    (e) => e.triageLevel === 'RED' && (e.status === 'Triaged' || e.status === 'In Trauma Bay')
  ).length;

  const pendingLab = (labOrders || []).filter(
    (l) => l.verificationStatus === 'Pending Collection' || l.verificationStatus === 'Sample Received' || l.verificationStatus === 'Analyzing'
  ).length;

  const pendingRx = (prescriptions || []).filter((p) => p.status === 'Prescribed').length;
  const lowStockDrugs = (drugInventory || []).filter((d) => d.stockOnHand <= d.reorderTriggerLevel).length;

  const activeSurgeries = (surgicalProcedures || []).filter((s) => s.status === 'In Progress' || s.status === 'PACU Recovery').length;
  const scheduledSurgeries = (surgicalProcedures || []).filter((s) => s.status === 'Scheduled').length;

  const totalRevenue = useMemo(() => {
    return (transactions || []).reduce((acc, curr) => acc + (curr.amountReceived || 0), 0);
  }, [transactions]);

  // Hourly Patient Traffic / Admissions mock distribution for trend
  const hourlyTrafficData = useMemo(() => [
    { hour: '08:00', opd: 12, emergency: 3, admissions: 1 },
    { hour: '09:00', opd: 28, emergency: 5, admissions: 2 },
    { hour: '10:00', opd: 45, emergency: 6, admissions: 4 },
    { hour: '11:00', opd: 52, emergency: 4, admissions: 3 },
    { hour: '12:00', opd: 38, emergency: 7, admissions: 2 },
    { hour: '13:00', opd: 24, emergency: 5, admissions: 1 },
    { hour: '14:00', opd: 40, emergency: 8, admissions: 3 },
    { hour: '15:00', opd: 34, emergency: 6, admissions: 2 }
  ], []);

  // Bed Distribution by Ward
  const wardBedData = useMemo(() => {
    const wardMap: Record<string, { occupied: number; total: number }> = {};
    (beds || []).forEach((b) => {
      if (!wardMap[b.wardName]) {
        wardMap[b.wardName] = { occupied: 0, total: 0 };
      }
      wardMap[b.wardName].total += 1;
      if (b.status === 'Occupied') {
        wardMap[b.wardName].occupied += 1;
      }
    });

    return Object.keys(wardMap).map((ward) => ({
      name: ward.replace('Ward', '').trim(),
      occupied: wardMap[ward].occupied,
      available: wardMap[ward].total - wardMap[ward].occupied,
      total: wardMap[ward].total
    }));
  }, [beds]);

  // Payer Class Revenue Share
  const payerRevenueData = useMemo(() => {
    const payerMap: Record<string, number> = {
      'Cash': 0,
      'CBHI': 0,
      'Private Insurance': 0,
      'Corporate': 0
    };

    (bills || []).forEach((bill) => {
      const payer = String(bill.payerClass || '');
      if (payer.includes('CBHI')) {
        payerMap['CBHI'] += bill.amountPayable || bill.subtotal || 0;
      } else if (payer.includes('Private')) {
        payerMap['Private Insurance'] += bill.amountPayable || bill.subtotal || 0;
      } else if (payer.includes('Corporate')) {
        payerMap['Corporate'] += bill.amountPayable || bill.subtotal || 0;
      } else {
        payerMap['Cash'] += bill.amountPayable || bill.subtotal || 0;
      }
    });

    return [
      { name: 'Cash', value: payerMap['Cash'], color: PALETTE.emerald },
      { name: 'CBHI Insurance', value: payerMap['CBHI'], color: PALETTE.sky },
      { name: 'Private Insurance', value: payerMap['Private Insurance'], color: PALETTE.indigo },
      { name: 'Corporate', value: payerMap['Corporate'], color: PALETTE.amber }
    ].filter((item) => item.value > 0);
  }, [bills]);

  // Emergency Triage Breakdown
  const triageData = useMemo(() => {
    const counts = { Red: 0, Yellow: 0, Green: 0, Blue: 0 };
    (emergencyRecords || []).forEach((r) => {
      if (r.triageLevel === 'RED') counts.Red += 1;
      else if (r.triageLevel === 'YELLOW') counts.Yellow += 1;
      else if (r.triageLevel === 'GREEN') counts.Green += 1;
      else counts.Blue += 1;
    });

    return [
      { name: 'Critical (Red)', count: counts.Red, color: PALETTE.rose },
      { name: 'Urgent (Yellow)', count: counts.Yellow, color: PALETTE.amber },
      { name: 'Standard (Green)', count: counts.Green, color: PALETTE.emerald },
      { name: 'Non-urgent (Blue)', count: counts.Blue, color: PALETTE.sky }
    ];
  }, [emergencyRecords]);

  // Department quick navigation cards
  const departmentSnapshots = [
    {
      id: 'OPD',
      title: 'OPD Consultations',
      desc: `${waitingOPD} waiting • ${inConsultationOPD} in consult`,
      icon: Stethoscope,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      badge: `${opdQueue.length} queued`
    },
    {
      id: 'EMERGENCY',
      title: 'Emergency Unit',
      desc: `${emergencyActive} active cases • ${criticalEmergencyCount} code red`,
      icon: AlertOctagon,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
      badge: `${criticalEmergencyCount} critical`,
      isAlert: criticalEmergencyCount > 0
    },
    {
      id: 'IPD',
      title: 'Inpatient Wards',
      desc: `${occupiedBeds}/${totalBeds} beds occupied (${bedOccupancyRate}%)`,
      icon: BedDouble,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      badge: `${totalBeds - occupiedBeds} beds free`
    },
    {
      id: 'LAB_BLOOD',
      title: 'Laboratory & Blood',
      desc: `${pendingLab} pending tests • ${bloodUnits.length} blood units`,
      icon: FlaskConical,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      badge: `${pendingLab} orders`
    },
    {
      id: 'PHARMACY',
      title: 'Pharmacy Desk',
      desc: `${pendingRx} pending Rx • ${lowStockDrugs} low stock items`,
      icon: Pill,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      badge: `${pendingRx} to dispense`
    },
    {
      id: 'OT',
      title: 'Operating Theater',
      desc: `${activeSurgeries} active ORs • ${scheduledSurgeries} scheduled`,
      icon: Scissors,
      color: 'bg-teal-500/10 text-teal-600 border-teal-200',
      badge: `${activeSurgeries + scheduledSurgeries} surgeries`
    },
    {
      id: 'CASHIER',
      title: 'Cashier & Billing',
      desc: `ETB ${totalRevenue.toLocaleString()} collected today`,
      icon: Receipt,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      badge: `${transactions.length} receipts`
    },
    {
      id: 'ADMIN',
      title: 'Administration',
      desc: `${auditLogs.length} audit logs • ${staffList.length} staff members`,
      icon: Building2,
      color: 'bg-slate-500/10 text-slate-700 border-slate-200',
      badge: 'RBAC Active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Hospital Command Center
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Live Operational Telemetry
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-emerald-400" />
              Hospital Executive & Clinical Dashboard
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Real-time operational intelligence across 10 specialized departments, bed occupancy, emergency triage, pharmacy fulfillment, and financial performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Staff On Duty</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{staffList.length} Personnel</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Registered Patients</div>
              <div className="text-lg font-black text-white font-mono">{totalPatients} Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Analytics Station Switcher */}
      {currentUser.role === 'ADMIN_HR' && (
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('EXECUTIVE')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'EXECUTIVE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Executive Hospital Overview
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('RECEPTION')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'RECEPTION'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Front Desk & Registry Analytics
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('OPD')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'OPD'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Doctor OPD Clinical Analytics
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('EMERGENCY')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'EMERGENCY'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Emergency & Triage Analytics
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('LAB')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'LAB'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Laboratory & Blood Bank Analytics
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('PHARMACY')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'PHARMACY'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dispensary & Stock Analytics
          </button>

          <button
            type="button"
            onClick={() => setAdminAnalyticsTab('IPD')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              adminAnalyticsTab === 'IPD'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Inpatient Wards & Bed Analytics
          </button>
        </div>
      )}

      {adminAnalyticsTab === 'RECEPTION' ? (
        <ReceptionAnalyticsView />
      ) : adminAnalyticsTab === 'OPD' ? (
        <DoctorAnalyticsView />
      ) : adminAnalyticsTab === 'EMERGENCY' ? (
        <EmergencyAnalyticsView />
      ) : adminAnalyticsTab === 'LAB' ? (
        <LabAnalyticsView />
      ) : adminAnalyticsTab === 'PHARMACY' ? (
        <PharmacyAnalyticsView />
      ) : adminAnalyticsTab === 'IPD' ? (
        <IPDAnalyticsView />
      ) : (
        <>
          {/* KPI Top Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: OPD Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OPD Consultations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{waitingOPD}</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Waiting</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{inConsultationOPD} in active consult</span>
            <button
              onClick={() => setActiveTab('OPD')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Open OPD <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Bed Occupancy */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IPD Bed Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BedDouble className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{bedOccupancyRate}%</span>
            <span className="text-xs font-medium text-slate-500">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${bedOccupancyRate > 80 ? 'bg-rose-500' : 'bg-purple-600'}`}
              style={{ width: `${Math.min(100, bedOccupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Emergency Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Triage</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${criticalEmergencyCount > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>
              <AlertOctagon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{emergencyActive}</span>
            <span className="text-xs font-semibold text-slate-500">Active Cases</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className={criticalEmergencyCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
              {criticalEmergencyCount} Code Red
            </span>
            <button
              onClick={() => setActiveTab('EMERGENCY')}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Open ER <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Daily Revenue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">ETB {totalRevenue.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{transactions.length} receipts settled</span>
            <button
              onClick={() => setActiveTab('CASHIER')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              POS Desk <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hourly Clinical Traffic */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Patient Volume & Department Load</h3>
              <p className="text-[11px] text-slate-500">Hourly patient encounters across OPD, Emergency & Admissions</p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Today (08:00 - 16:00)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="opdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.sky} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PALETTE.sky} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="erGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="opd" name="OPD Visits" stroke={PALETTE.sky} strokeWidth={2} fillOpacity={1} fill="url(#opdGrad)" />
                <Area type="monotone" dataKey="emergency" name="Emergency Cases" stroke={PALETTE.rose} strokeWidth={2} fillOpacity={1} fill="url(#erGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ward Bed Utilization */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inpatient Ward Bed Capacity</h3>
              <p className="text-[11px] text-slate-500">Occupied vs Available beds per specialized ward</p>
            </div>
            <span className="text-[11px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded">
              {occupiedBeds} of {totalBeds} Occupied
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardBedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="occupied" name="Occupied Beds" fill={PALETTE.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Section: Revenue by Payer & Emergency Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payer Class Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue by Payer Class</h3>
            <p className="text-[11px] text-slate-500">Cash vs CBHI Health Insurance vs Corporate</p>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payerRevenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {payerRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {payerRevenueData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 font-mono">ETB {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Triage Levels */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Emergency Triage Severity (SATS)</h3>
            <p className="text-[11px] text-slate-500">Acuity distribution of active emergency admissions</p>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triageData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="count" name="Patients" radius={[0, 4, 4, 0]}>
                    {triageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="bg-rose-50 rounded-lg p-2 text-rose-700">
              <div className="text-xs font-bold">{criticalEmergencyCount} Red / Resus</div>
              <div className="text-[10px] text-rose-600">Immediate trauma care</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-emerald-700">
              <div className="text-xs font-bold">{emergencyRecords.length - criticalEmergencyCount} Stable</div>
              <div className="text-[10px] text-emerald-600">Standard observation</div>
            </div>
          </div>
        </div>

        {/* Live Hospital Activity Feed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Hospital Activity</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[250px] no-scrollbar pr-1">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <Activity className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp?.split(' ')[1] || 'Just now'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400">{log.userName} • {log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Workstation Snapshots (Quick Access Matrix) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hospital Department Workstations</h3>
            <p className="text-[11px] text-slate-500">Live operational status across all clinical, diagnostic and administrative units</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Current Station: <strong className="text-emerald-700">{currentUser.department}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {departmentSnapshots.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.id}
                onClick={() => setActiveTab(dept.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-xs bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${dept.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${dept.isAlert ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                      {dept.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {dept.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {dept.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-600 group-hover:text-emerald-600">
                  <span>Enter Workstation</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
