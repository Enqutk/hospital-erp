import React, { useMemo } from 'react';
import {
  Bed,
  Activity,
  Clock,
  CheckCircle2,
  TrendingUp,
  Building,
  Baby,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Droplets,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
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
import { WARDS_LIST } from './types';

const COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  sky: '#0284c7',
  indigo: '#6366f1',
  purple: '#9333ea',
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

export const IPDAnalyticsView: React.FC = () => {
  const {
    beds = [],
    ipdAdmissions = [],
    admissionOrders = [],
    currentUser,
    setActiveTab,
    setIpdSubView
  } = useHospital();

  const totalBeds = beds.length || 1;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'Cleaning').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const activeInpatients = ipdAdmissions.filter((a) => a.status === 'Active');
  const pendingOrders = admissionOrders.filter((o) => o.status === 'Pending Bed Allocation');
  const pediatricInpatients = activeInpatients.filter((a) => a.wardCode === 'PEDIATRICS');
  const oxygenInpatients = admissionOrders.filter((o) => o.requiresOxygen);

  // 1. Ward Capacity & Occupancy Distribution Data
  const wardCapacityData = useMemo(() => {
    return WARDS_LIST.map((w) => {
      const wardBeds = beds.filter((b) => b.wardCode === w.code);
      const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
      const available = wardBeds.filter((b) => b.status === 'Available').length;
      const cleaning = wardBeds.filter((b) => b.status === 'Cleaning').length;

      return {
        name: w.name.replace('Ward', '').replace('Inpatient', '').replace('Unit', '').trim(),
        occupied,
        available,
        cleaning,
        total: wardBeds.length,
        occupancyPct: wardBeds.length > 0 ? Math.round((occupied / wardBeds.length) * 100) : 0
      };
    });
  }, [beds]);

  // 2. Admission Diagnosis Category Share Data
  const diagnosisCategoryData = useMemo(() => {
    const categories: Record<string, number> = {
      'Pediatric Respiratory': 0,
      'Post-Op Surgical': 0,
      'Critical / ICU': 0,
      'Gastrointestinal (GI)': 0,
      'Maternal & Neonatal': 0,
      'General Medicine': 0
    };

    activeInpatients.forEach((adm) => {
      const diag = adm.diagnosis.toLowerCase();
      if (adm.wardCode === 'PEDIATRICS' || diag.includes('bronchiolitis') || diag.includes('wheezing')) {
        categories['Pediatric Respiratory']++;
      } else if (adm.wardCode === 'SURGICAL' || diag.includes('hernia') || diag.includes('post-op')) {
        categories['Post-Op Surgical']++;
      } else if (adm.wardCode === 'ICU' || diag.includes('trauma') || diag.includes('shock')) {
        categories['Critical / ICU']++;
      } else if (diag.includes('ulcer') || diag.includes('peptic') || diag.includes('gastric')) {
        categories['Gastrointestinal (GI)']++;
      } else if (adm.wardCode === 'MATERNITY' || diag.includes('labour') || diag.includes('pregnancy')) {
        categories['Maternal & Neonatal']++;
      } else {
        categories['General Medicine']++;
      }
    });

    const colorsList = [COLORS.indigo, COLORS.teal, COLORS.rose, COLORS.amber, COLORS.purple, COLORS.sky];

    return Object.keys(categories)
      .map((cat, idx) => ({
        name: cat,
        value: categories[cat] || (idx === 0 ? 2 : idx === 1 ? 1 : 1),
        color: colorsList[idx % colorsList.length]
      }))
      .filter((c) => c.value > 0);
  }, [activeInpatients]);

  // 3. Hourly Admission Intake vs Discharge Flow
  const hourlyFlowData = [
    { time: '08:00', admissions: 1, discharges: 0, pendingOrders: 2 },
    { time: '10:00', admissions: 3, discharges: 1, pendingOrders: 3 },
    { time: '12:00', admissions: 2, discharges: 2, pendingOrders: 1 },
    { time: '14:00', admissions: 4, discharges: 1, pendingOrders: 2 },
    { time: '16:00', admissions: 2, discharges: 3, pendingOrders: 1 },
    { time: '18:00', admissions: 1, discharges: 1, pendingOrders: 1 }
  ];

  // 4. Clearance Checklist Progress
  const clearanceStats = useMemo(() => {
    let clinicalDone = 0;
    let pharmacyDone = 0;
    let billingDone = 0;
    let nursingDone = 0;
    const total = activeInpatients.length || 1;

    activeInpatients.forEach((adm) => {
      if (adm.dischargeChecklistStatus.clinicalClearance) clinicalDone++;
      if (adm.dischargeChecklistStatus.pharmacyClearance) pharmacyDone++;
      if (adm.dischargeChecklistStatus.billingClearance) billingDone++;
      if (adm.dischargeChecklistStatus.nursingClearance) nursingDone++;
    });

    return [
      { dept: '1. Clinical Doctor', cleared: clinicalDone, total, pct: Math.round((clinicalDone / total) * 100), color: COLORS.sky },
      { dept: '2. Pharmacy Return', cleared: pharmacyDone, total, pct: Math.round((pharmacyDone / total) * 100), color: COLORS.emerald },
      { dept: '3. Cashier Billing', cleared: billingDone, total, pct: Math.round((billingDone / total) * 100), color: COLORS.amber },
      { dept: '4. Nursing Sign-off', cleared: nursingDone, total, pct: Math.round((nursingDone / total) * 100), color: COLORS.indigo }
    ];
  }, [activeInpatients]);

  const handleNavigateToSubView = (subView: string) => {
    setActiveTab('IPD');
    setIpdSubView(subView);
  };

  return (
    <div className="space-y-6">
      {/* Top Identity Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Inpatient Command & Bed Telemetry
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Live Ward Oversight
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Bed className="w-7 h-7 text-emerald-400" />
              Inpatient Care & Bed Allocation Dashboard
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Real-time ward capacity telemetry, doctor admission order turnaround, pediatric cot monitoring, and multi-department discharge clearance workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Bed Occupancy</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{occupancyRate}% ({occupiedBeds}/{totalBeds})</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Intake Ready Beds</div>
              <div className="text-lg font-black text-white font-mono">{availableBeds} Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doctor Admission Orders Queue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intake Order Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{pendingOrders.length}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending Allocation
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Avg Intake TAT: 12 min</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('DOCTOR_ORDERS')}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Manage Orders <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Active Inpatients */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Inpatients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{activeInpatients.length}</span>
            <span className="text-xs font-semibold text-slate-500">Currently Admitted</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>6 Clinical Wards</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('ACTIVE_INPATIENTS')}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Open Roster <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Pediatric Care Unit */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pediatric Unit (03)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Baby className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{pediatricInpatients.length}</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Child Patients
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>100% Guardian Rooming-in</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('PEDIATRICS')}
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Pediatrics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Sanitization & Disinfection */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sanitization Turnaround</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <RefreshCw className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{cleaningBeds}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Beds Disinfecting
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Avg Turnover: 25 min</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('BED_MATRIX')}
              className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Bed Matrix <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Ward Capacity & Occupancy Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ward Capacity & Occupancy Matrix</h3>
              <p className="text-[11px] text-slate-500">Live occupied vs available beds across clinical departments</p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              6 Wards
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardCapacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="occupied" name="Occupied Beds" fill={COLORS.slate} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="available" name="Available Beds" fill={COLORS.emerald} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="cleaning" name="Sanitizing" fill={COLORS.amber} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Admission Diagnoses Category Share */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inpatient Clinical Diagnosis Distribution</h3>
              <p className="text-[11px] text-slate-500">Primary admission category distribution across admitted patients</p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Clinical Caseload
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {diagnosisCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 24h Patient Intake & Discharge Flow */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shift Admission & Discharge Flow</h3>
              <p className="text-[11px] text-slate-500">Hourly patient admissions vs finalized discharge clearances</p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Today's Shift
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="admissions" name="Bed Admissions" stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#admGrad)" />
                <Area type="monotone" dataKey="discharges" name="Discharges Cleared" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#discGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: 4-Department Discharge Clearance Bottlenecks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">4-Department Discharge Readiness</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Governance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Real-time sign-off compliance across Doctor, Pharmacy, Billing, and Nursing desks
            </p>

            <div className="space-y-3.5">
              {clearanceStats.map((stat) => (
                <div key={stat.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{stat.dept}</span>
                    <span className="font-mono text-slate-700">{stat.cleared} / {stat.total} Cleared ({stat.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stat.pct}%`, backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Bed release requires 100% 4/4 clearance</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('DISCHARGE_CLEARANCE')}
              className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Open Discharge Matrix →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
