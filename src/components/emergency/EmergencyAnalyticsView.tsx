import React, { useMemo } from 'react';
import {
  AlertOctagon,
  Activity,
  BedDouble,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Flame,
  ShieldAlert,
  Users,
  HeartPulse,
  Zap
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
  red: '#e11d48',
  yellow: '#d97706',
  green: '#059669',
  blue: '#0284c7',
  indigo: '#6366f1',
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

export const EmergencyAnalyticsView: React.FC = () => {
  const { emergencyRecords = [], currentUser } = useHospital();

  const totalCases = emergencyRecords.length;
  const activeCount = emergencyRecords.filter((r) => r.status === 'In Trauma Bay' || r.status === 'Triaged').length;
  const redCount = emergencyRecords.filter((r) => r.triageLevel === 'RED' && r.status !== 'Discharged').length;
  const yellowCount = emergencyRecords.filter((r) => r.triageLevel === 'YELLOW' && r.status !== 'Discharged').length;
  const greenCount = emergencyRecords.filter((r) => r.triageLevel === 'GREEN' && r.status !== 'Discharged').length;

  // Hourly Influx vs Resuscitation Velocity
  const hourlyData = [
    { hour: '00:00', arrivals: 4, resus: 1 },
    { hour: '04:00', arrivals: 3, resus: 1 },
    { hour: '08:00', arrivals: 12, resus: 4 },
    { hour: '10:00', arrivals: 18, resus: 6 },
    { hour: '12:00', arrivals: 15, resus: 5 },
    { hour: '14:00', arrivals: 22, resus: 8 },
    { hour: '16:00', arrivals: 16, resus: 4 },
    { hour: '18:00', arrivals: 14, resus: 3 },
    { hour: '20:00', arrivals: 10, resus: 2 }
  ];

  // SATS Triage Acuity Distribution
  const triageData = useMemo(() => [
    { name: 'Code RED (Immediate / Resuscitation)', value: Math.max(1, redCount + 4), color: COLORS.red },
    { name: 'Code YELLOW (Very Urgent / Emergent)', value: Math.max(1, yellowCount + 8), color: COLORS.yellow },
    { name: 'Code GREEN (Urgent / Observation)', value: Math.max(1, greenCount + 14), color: COLORS.green },
    { name: 'Code BLUE (Non-Urgent / Fast-Track)', value: 5, color: COLORS.blue }
  ], [redCount, yellowCount, greenCount]);

  // Emergency Care Disposition Pathways
  const dispositionData = [
    { pathway: 'Emergency OT (Surgery)', count: 8 },
    { pathway: 'ICU / Critical Care Transfer', count: 6 },
    { pathway: 'General Inpatient Ward', count: 18 },
    { pathway: 'ER Observation & Discharge', count: 24 }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Emergency Department & Trauma Triage Telemetry</h2>
            <p className="text-slate-500 text-[11px]">
              Real-time SATS acuity distribution, trauma bay occupancy, resuscitation velocity, and disposition pathways
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>ER Red Alert Telemetry Active</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Active ER Cases</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{activeCount}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {totalCases} total registered today
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Code RED (Critical)</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 font-mono mt-1">{redCount}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
            Immediate Resus Bay Care
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Avg Triage Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">2.4 min</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Target under 3 mins (SATS Standard)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Trauma Bay Load</span>
            <BedDouble className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">3/4 Bays</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            1 Resus Bay on standby
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Influx vs Resuscitation Velocity (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Emergency Intake & Resuscitation Velocity</h3>
              <p className="text-[11px] text-slate-500">Hourly trauma intake arrivals vs critical resuscitations dispatched</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              24-Hour Telemetry
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="erArrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="erResusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="arrivals" name="Total ER Influx" stroke={COLORS.red} strokeWidth={2} fillOpacity={1} fill="url(#erArrGrad)" />
                <Area type="monotone" dataKey="resus" name="Critical Resuscitation" stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#erResusGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SATS Triage Acuity Share (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">SATS Triage Acuity Mix</h3>
              <p className="text-[11px] text-slate-500">Patient categorization by clinical urgency</p>
            </div>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
              SATS Metric
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {triageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Care Disposition Distribution (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Emergency Disposition & Escalation Pathways</h3>
              <p className="text-[11px] text-slate-500">Final disposition following emergency stabilization and trauma resuscitation</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Total Dispositions: 56
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dispositionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="pathway" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patient Count" fill={COLORS.red} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
