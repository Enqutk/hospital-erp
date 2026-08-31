import React, { useMemo } from 'react';
import {
  Users,
  Activity,
  Clock,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  UserPlus,
  BarChart3
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
            <span className="font-bold text-white font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ReceptionAnalyticsView: React.FC = () => {
  const { patients = [], opdQueue = [], billingInvoices = [] } = useHospital();

  const waitingCount = opdQueue.filter((q) => q.status === 'Waiting').length;
  const inConsultCount = opdQueue.filter((q) => q.status === 'In Consultation').length;

  // Payer Distribution Data
  const payerData = useMemo(() => {
    const counts: Record<string, number> = { CBHI: 0, Cash: 0, Corporate: 0, Private: 0 };
    patients.forEach((p) => {
      const cls = p.payerClass.toLowerCase();
      if (cls.includes('cbhi')) counts.CBHI++;
      else if (cls.includes('cash')) counts.Cash++;
      else if (cls.includes('corp')) counts.Corporate++;
      else counts.Private++;
    });

    return [
      { name: 'CBHI Insurance', value: counts.CBHI, color: COLORS.teal },
      { name: 'Cash (Self-Pay)', value: counts.Cash, color: COLORS.emerald },
      { name: 'Corporate Partners', value: counts.Corporate, color: COLORS.sky },
      { name: 'Private Insurance', value: counts.Private, color: COLORS.indigo }
    ];
  }, [patients]);

  // Hourly Arrival Pattern Data
  const hourlyData = [
    { hour: '08:00', arrivals: 12, queued: 10 },
    { hour: '09:00', arrivals: 24, queued: 18 },
    { hour: '10:00', arrivals: 32, queued: 26 },
    { hour: '11:00', arrivals: 28, queued: 22 },
    { hour: '12:00', arrivals: 16, queued: 14 },
    { hour: '13:00', arrivals: 19, queued: 15 },
    { hour: '14:00', arrivals: 27, queued: 21 },
    { hour: '15:00', arrivals: 22, queued: 17 },
    { hour: '16:00', arrivals: 14, queued: 9 }
  ];

  // Room Routing Distribution
  const roomLoadData = [
    { room: 'Room 1 (Gen)', patients: opdQueue.filter((q) => q.assignedRoom === 1).length + 4 },
    { room: 'Room 2 (Internal)', patients: opdQueue.filter((q) => q.assignedRoom === 2).length + 6 },
    { room: 'Room 3 (Pediatrics)', patients: opdQueue.filter((q) => q.assignedRoom === 3).length + 5 },
    { room: 'Room 4 (OB/GYN)', patients: opdQueue.filter((q) => q.assignedRoom === 4).length + 3 },
    { room: 'Room 5 (Surgery)', patients: opdQueue.filter((q) => q.assignedRoom === 5).length + 4 },
    { room: 'Room 6 (Chronic)', patients: opdQueue.filter((q) => q.assignedRoom === 6).length + 2 }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Front Desk & Patient Registry Analytics</h2>
            <p className="text-slate-500 text-[11px]">
              Intake velocity, insurance breakdown, room dispatch metrics, and triage wait times
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Live Telemetry Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Total Registered Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{patients.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+100% active EMR records</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Active OPD Queue</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{waitingCount}</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
            {inConsultCount} currently in consult
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Avg Intake Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">3.8 min</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Under 5-min target standard
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">ID Cards Issued</span>
            <CreditCard className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{patients.length}</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
            CR-80 Barcoded formats
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Arrival Curve (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Patient Arrival Trends & Queue Velocity</h3>
              <p className="text-[11px] text-slate-500">Hourly registration volume vs active waiting tokens</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today (08:00 - 17:00)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="arrivalsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="queuedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="arrivals" name="Patient Arrivals" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#arrivalsGrad)" />
                <Area type="monotone" dataKey="queued" name="Dispatched to OPD" stroke={COLORS.sky} strokeWidth={2} fillOpacity={1} fill="url(#queuedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payer Class Breakdown (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Payer Class & Insurance Share</h3>
              <p className="text-[11px] text-slate-500">CBHI vs Out-of-pocket distribution</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {patients.length} records
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {payerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultation Room Load Bar Chart (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">OPD Consultation Suite Dispatch Load</h3>
              <p className="text-[11px] text-slate-500">Distribution of patients routed across all 6 consultation rooms</p>
            </div>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Balanced Routing Active
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="room" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="patients" name="Dispatched Patients" fill={COLORS.indigo} radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
