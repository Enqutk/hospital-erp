import React, { useMemo } from 'react';
import {
  Pill,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Store,
  ShieldCheck
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
  teal: '#0d9488',
  emerald: '#059669',
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
            <span className="font-bold text-white font-mono">
              {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('value')
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

export const PharmacyAnalyticsView: React.FC = () => {
  const { drugInventory = [], prescriptions = [] } = useHospital();

  const pendingCount = prescriptions.filter((p) => p.status === 'Prescribed').length;
  const dispensedCount = prescriptions.filter((p) => p.status === 'Dispensed').length;

  const lowStockCount = drugInventory.filter((d) => d.stockOnHand <= d.reorderTriggerLevel).length;

  const totalStockValuation = useMemo(() => {
    return drugInventory.reduce((acc, d) => acc + d.stockOnHand * d.unitSalePrice, 0);
  }, [drugInventory]);

  // Hourly Dispensing Volume Data
  const hourlyData = [
    { hour: '08:00', received: 10, dispensed: 8 },
    { hour: '09:00', received: 22, dispensed: 18 },
    { hour: '10:00', received: 35, dispensed: 30 },
    { hour: '11:00', received: 30, dispensed: 28 },
    { hour: '12:00', received: 18, dispensed: 16 },
    { hour: '13:00', received: 20, dispensed: 19 },
    { hour: '14:00', received: 28, dispensed: 26 },
    { hour: '15:00', received: 24, dispensed: 22 },
    { hour: '16:00', received: 15, dispensed: 14 }
  ];

  // Therapeutic Class Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      'Antibiotics': 42,
      'Analgesics / NSAIDs': 35,
      'Antihypertensives': 28,
      'Antidiabetics': 20,
      'Antimalarials / GI': 25,
      'Vitamins & Minerals': 18
    };

    return [
      { name: 'Antibacterial / Anti-infectives', value: counts['Antibiotics'], color: COLORS.teal },
      { name: 'Analgesics & Anti-inflammatory', value: counts['Analgesics / NSAIDs'], color: COLORS.sky },
      { name: 'Cardiovascular / Antihypertensives', value: counts['Antihypertensives'], color: COLORS.indigo },
      { name: 'Endocrine & Metabolic (Insulins/Metformin)', value: counts['Antidiabetics'], color: COLORS.emerald },
      { name: 'Gastrointestinal & Antimalarials', value: counts['Antimalarials / GI'], color: COLORS.amber }
    ];
  }, []);

  // Store Location Valuation Distribution
  const storeValuationData = [
    { store: 'Main Pharmacy Store', value: Math.round(totalStockValuation * 0.65), items: 120 },
    { store: 'Emergency Unit Pharmacy', value: Math.round(totalStockValuation * 0.20), items: 45 },
    { store: 'IPD Satellite Dispensary', value: Math.round(totalStockValuation * 0.15), items: 35 }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Pharmacy Dispensary & Formulary Analytics</h2>
            <p className="text-slate-500 text-[11px]">
              Prescription velocity, multi-store valuation, therapeutic category throughput, and buffer levels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
            Live Dispensary Feed
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Pending Prescriptions</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{pendingCount}</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
            {dispensedCount} dispensed today
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Stock Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            ETB {totalStockValuation.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {drugInventory.length} active formulary items
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Avg Dispense Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">3.2 min</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Under 5-min target standard
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono mt-1">{lowStockCount}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            Below reorder threshold
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Prescription Flow (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Prescription Intake & Dispensing Velocity</h3>
              <p className="text-[11px] text-slate-500">Hourly doctor e-prescriptions vs completed patient dispenses</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today (08:00 - 17:00)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rxRecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rxDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="received" name="Prescriptions Received" stroke={COLORS.teal} strokeWidth={2} fillOpacity={1} fill="url(#rxRecGrad)" />
                <Area type="monotone" dataKey="dispensed" name="Medications Dispensed" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#rxDispGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Therapeutic Category Breakdown (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Therapeutic Class Distribution</h3>
              <p className="text-[11px] text-slate-500">Dispensed medication share by category</p>
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              Formulary Share
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Store Stock Valuation Bar Chart (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Perpetual Stock Valuation by Store Location</h3>
              <p className="text-[11px] text-slate-500">Inventory asset value across Main, ER, and IPD satellite storerooms</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Total: ETB {totalStockValuation.toLocaleString()}
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeValuationData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="store" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Stock Value (ETB)" fill={COLORS.teal} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
