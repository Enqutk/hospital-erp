import React, { useMemo } from 'react';
import {
  Stethoscope,
  Users,
  Clock,
  FlaskConical,
  Scan,
  Pill,
  BedDouble,
  Activity,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle
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

const COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  sky: '#0284c7',
  indigo: '#6366f1',
  amber: '#d97706',
  rose: '#e11d48',
  purple: '#9333ea',
  slate: '#334155'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-800 text-xs space-y-1">
        {label && <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white font-mono">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DoctorAnalyticsView: React.FC = () => {
  const {
    opdQueue = [],
    opdEncounters = [],
    labOrders = [],
    radiologyOrders = [],
    prescriptions = [],
    admissionOrders = [],
    currentUser
  } = useHospital();

  const waitingCount = opdQueue.filter((q) => q.status === 'Waiting').length;
  const inConsultCount = opdQueue.filter((q) => q.status === 'In Consultation').length;
  const completedCount = opdEncounters.length;
  const pendingLab = labOrders.filter((l) => l.status === 'Pending').length;
  const pendingRx = prescriptions.filter((p) => p.status === 'Prescribed').length;
  const pendingAdmissions = admissionOrders.filter((a) => a.status === 'Pending Bed Allocation').length;

  // Hourly Clinical Consultation Influx
  const hourlyData = [
    { hour: '08:00', arrived: 6, completed: 4 },
    { hour: '09:00', arrived: 14, completed: 10 },
    { hour: '10:00', arrived: 22, completed: 18 },
    { hour: '11:00', arrived: 18, completed: 16 },
    { hour: '12:00', arrived: 10, completed: 12 },
    { hour: '13:00', arrived: 12, completed: 11 },
    { hour: '14:00', arrived: 16, completed: 15 },
    { hour: '15:00', arrived: 14, completed: 13 },
    { hour: '16:00', arrived: 8, completed: 8 }
  ];

  // Top Diagnoses breakdown
  const diagnosisData = useMemo(() => [
    { name: 'Acute Febrile Illness (Malaria/Typhoid)', value: 34, color: COLORS.emerald },
    { name: 'Essential Hypertension (Stage 1/2)', value: 26, color: COLORS.indigo },
    { name: 'Type 2 Diabetes Mellitus', value: 20, color: COLORS.sky },
    { name: 'Upper RTI / Bronchitis', value: 18, color: COLORS.amber },
    { name: 'Dyspepsia / Peptic Ulcer Disease', value: 15, color: COLORS.teal },
    { name: 'Trauma / Musculoskeletal', value: 12, color: COLORS.rose }
  ], []);

  // Clinical Disposition / Dispatch Mix
  const dispatchData = useMemo(() => [
    { disposition: 'Prescription & Outpatient Discharge', count: 48 },
    { disposition: 'Diagnostic Lab / X-Ray Workup', count: 32 },
    { disposition: 'Inpatient Ward Admission', count: 12 },
    { disposition: 'Surgical Referral / OT', count: 6 },
    { disposition: 'Follow-Up in 14 Days', count: 24 }
  ], []);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Doctor OPD & Clinical Consultation Intelligence</h2>
            <p className="text-slate-500 text-[11px]">
              Consultation velocity, diagnostic workup dispatch, patient wait time telemetry, and morbidity classification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Station: {currentUser.stationNumber ? `Room ${currentUser.stationNumber}` : 'General OPD Suite'}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Waiting Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{waitingCount}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {inConsultCount} currently in consult
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Completed Encounters</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{completedCount}</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
            Signed EMR clinical charts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Diagnostic Orders</span>
            <FlaskConical className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{pendingLab + radiologyOrders.length}</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
            Lab & imaging requested
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Bed Admissions</span>
            <BedDouble className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{pendingAdmissions}</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
            Inpatient ward admission orders
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Consultation Velocity (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Patient Consultation Velocity</h3>
              <p className="text-[11px] text-slate-500">Hourly queue arrival rate vs doctor encounter completions</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today (08:00 - 17:00)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="opdArrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="opdCompGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="arrived" name="Patients Arrived" stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#opdArrGrad)" />
                <Area type="monotone" dataKey="completed" name="Consultations Completed" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#opdCompGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Morbidity / Diagnosis Share (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Morbidity & Clinical Diagnosis Mix</h3>
              <p className="text-[11px] text-slate-500">ICD-10 clinical diagnosis distribution</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              ICD-10 Share
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {diagnosisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Care Dispatch Distribution (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Patient Clinical Disposition & Service Referrals</h3>
              <p className="text-[11px] text-slate-500">Breakdown of care pathways ordered following physician evaluation</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Total Dispatches: 122
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dispatchData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="disposition" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patient Count" fill={COLORS.emerald} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
