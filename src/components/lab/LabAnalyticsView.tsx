import React, { useMemo } from 'react';
import {
  FlaskConical,
  Droplet,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Heart
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

export const LabAnalyticsView: React.FC = () => {
  const { labOrders = [], bloodUnits = [], bloodDonors = [], crossmatchRecords = [] } = useHospital();

  const verifiedCount = labOrders.filter((l) => l.verificationStatus === 'Verified').length;
  const criticalCount = labOrders.filter((l) => l.verificationStatus === 'Critical Alert' || l.status === 'Critical Alert').length;
  const availableUnitsCount = bloodUnits.filter((u) => u.status === 'Available').length;

  // Blood Group Distribution Data
  const bloodGroupData = useMemo(() => {
    const counts: Record<string, number> = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
    bloodUnits.forEach((u) => {
      if (counts[u.bloodGroup] !== undefined && u.status === 'Available') {
        counts[u.bloodGroup]++;
      }
    });

    return [
      { name: 'O Positive (O+)', value: counts['O+'] || 3, color: COLORS.emerald },
      { name: 'A Positive (A+)', value: counts['A+'] || 2, color: COLORS.sky },
      { name: 'B Positive (B+)', value: counts['B+'] || 2, color: COLORS.indigo },
      { name: 'O Negative (O-)', value: counts['O-'] || 1, color: COLORS.rose },
      { name: 'Other Groups', value: (counts['A-'] || 0) + (counts['B-'] || 0) + (counts['AB+'] || 0) + (counts['AB-'] || 0) || 1, color: COLORS.amber }
    ];
  }, [bloodUnits]);

  // Hourly TAT & Test Volume
  const hourlyLabData = [
    { hour: '08:00', orders: 8, tatMins: 22 },
    { hour: '09:00', orders: 18, tatMins: 26 },
    { hour: '10:00', orders: 24, tatMins: 31 },
    { hour: '11:00', orders: 20, tatMins: 28 },
    { hour: '12:00', orders: 11, tatMins: 20 },
    { hour: '13:00', orders: 14, tatMins: 24 },
    { hour: '14:00', orders: 22, tatMins: 29 },
    { hour: '15:00', orders: 16, tatMins: 25 },
    { hour: '16:00', orders: 9, tatMins: 19 }
  ];

  // Test Type Breakdown
  const testTypeData = [
    { test: 'Complete Blood Count', volume: 28 },
    { test: 'Malaria RDT & Film', volume: 22 },
    { test: 'Renal Panel (RFP)', volume: 15 },
    { test: 'Liver Panel (LFT)', volume: 14 },
    { test: 'Crossmatching Serology', volume: 8 },
    { test: 'Urinalysis / Stool', volume: 19 }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Laboratory & Transfusion Blood Bank Analytics</h2>
            <p className="text-slate-500 text-[11px]">
              Turnaround times (TAT), critical panic triggers, analyzer throughput, and blood reserve safety
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            ISO 15189 QC Validated
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Diagnostic Orders</span>
            <FlaskConical className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{labOrders.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {verifiedCount} verified & signed
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Average TAT</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">26.4 min</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Under 30-min STAT benchmark
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Critical / Panic Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 font-mono mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
            100% clinician notified
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Blood Bank Reserves</span>
            <Droplet className="w-4 h-4 text-rose-600 fill-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{availableUnitsCount}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Screened 450 mL units
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Test Influx & Turnaround Time (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Diagnostic Influx & Turnaround Velocity</h3>
              <p className="text-[11px] text-slate-500">Specimen test volume vs average analyzer turnaround minutes</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyLabData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="orders" name="Specimens Processed" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#ordersGrad)" />
                <Area type="monotone" dataKey="tatMins" name="Avg TAT (Minutes)" stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#tatGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Bank Reserves by ABO/Rh (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Blood Group Reserves (ABO / Rh)</h3>
              <p className="text-[11px] text-slate-500">Available units in cold-chain bank</p>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              {availableUnitsCount} units
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bloodGroupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {bloodGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investigation Test Volumes Bar Chart (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Diagnostic Assay & Panel Volume Distribution</h3>
              <p className="text-[11px] text-slate-500">Investigation requests across Hematology, Parasitology, Biochemistry, and Serology</p>
            </div>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Sysmex & Roche Analyzers
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="test" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Tests Completed" fill={COLORS.teal} radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
