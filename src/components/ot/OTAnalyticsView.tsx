import React, { useMemo } from 'react';
import {
  Scissors,
  ShieldCheck,
  Activity,
  BedDouble,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  HeartPulse
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
  blue: '#0284c7',
  indigo: '#6366f1',
  amber: '#d97706',
  rose: '#e11d48',
  purple: '#8b5cf6',
  slate: '#475569'
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

export const OTAnalyticsView: React.FC = () => {
  const { surgeries = [] } = useHospital();

  const totalCases = surgeries.length;
  const inProgressCases = surgeries.filter((s) => s.status === 'In Progress').length;
  const pacuCases = surgeries.filter((s) => s.status === 'PACU Recovery' || s.status === 'Recovery / PACU').length;
  const scheduledCases = surgeries.filter((s) => s.status === 'Scheduled').length;
  const completedCases = surgeries.filter((s) => s.status === 'Completed').length;
  const orOccupancyRate = Math.min(100, Math.round(((inProgressCases + pacuCases) / 3) * 100));

  // Hourly Operating Theater Load Data
  const hourlyOTData = [
    { hour: '07:00', incisions: 0, pacu: 0 },
    { hour: '08:00', incisions: 1, pacu: 0 },
    { hour: '09:00', incisions: 2, pacu: 1 },
    { hour: '10:00', incisions: 3, pacu: 1 },
    { hour: '11:00', incisions: 2, pacu: 2 },
    { hour: '12:00', incisions: 1, pacu: 2 },
    { hour: '13:00', incisions: 2, pacu: 1 },
    { hour: '14:00', incisions: 3, pacu: 2 },
    { hour: '15:00', incisions: 2, pacu: 1 },
    { hour: '16:00', incisions: 1, pacu: 1 }
  ];

  // Surgical Specialty Distribution
  const specialtyData = useMemo(() => [
    { name: 'General & Laparoscopy', value: 8, color: COLORS.emerald },
    { name: 'Orthopedic & Trauma', value: 5, color: COLORS.blue },
    { name: 'Obstetric & Emergency C-Section', value: 6, color: COLORS.rose },
    { name: 'Urology & Endourology', value: 3, color: COLORS.purple }
  ], []);

  // ASA Physical Status Classification
  const asaData = [
    { grade: 'ASA I (Normal Healthy)', count: 6 },
    { grade: 'ASA II (Mild Systemic)', count: 10 },
    { grade: 'ASA III (Severe Systemic)', count: 4 },
    { grade: 'ASA IV (Life Threat)', count: 1 },
    { grade: 'ASA E (Emergency Case)', count: 3 }
  ];

  return (
    <div className="space-y-4 text-xs">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Operating Theater Suite & Surgical Intelligence Telemetry</h2>
            <p className="text-slate-500 text-[11px]">
              Active intraoperative incisions, PACU Aldrete recovery telemetry, WHO surgical safety audit, and suite capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>WHO 3-Phase Checklist: 100% Compliance</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Live Intraoperative Incisions</span>
            <Scissors className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">{inProgressCases} Active</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Occupying sterile theater suites
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">PACU / Recovery Beds</span>
            <HeartPulse className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">{pacuCases} Monitored</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Aldrete score monitoring
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Scheduled Surgical Cases</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{scheduledCases} Booked</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Pre-op checked & consented
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">OR Suite Utilization</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">{orOccupancyRate}%</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            3 Positive-Pressure Suites
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Theater Schedule & PACU Flow (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Operating Suites Load & PACU Recovery Flow</h3>
              <p className="text-[11px] text-slate-500">Hourly intraoperative surgical cases vs PACU recovery bed occupancy</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today (07:00 - 16:00)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyOTData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incisionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pacuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="incisions" name="Active Surgical Incisions" stroke={COLORS.rose} strokeWidth={2} fillOpacity={1} fill="url(#incisionGrad)" />
                <Area type="monotone" dataKey="pacu" name="PACU Post-Anesthesia Recovery" stroke={COLORS.amber} strokeWidth={2} fillOpacity={1} fill="url(#pacuGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Surgical Specialty Mix (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Surgical Specialty Mix</h3>
              <p className="text-[11px] text-slate-500">Distribution of surgical procedures performed</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
              Specialties
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ASA Classification Distribution (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">ASA Physical Status Risk Classification</h3>
              <p className="text-[11px] text-slate-500">Anesthetic risk stratification across scheduled and emergency surgical patients</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Total Audited: 24
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patient Count" fill={COLORS.indigo} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
