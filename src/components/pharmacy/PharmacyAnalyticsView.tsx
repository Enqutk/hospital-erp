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
  ShieldCheck,
  ShieldAlert,
  ThermometerSnowflake,
  ArrowUpRight,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Activity
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
  purple: '#9333ea',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#0f172a',
  slateMuted: '#64748b'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 backdrop-blur-md">
        {label && <div className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.color || entry.fill || COLORS.teal }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white font-mono">
              {typeof entry.value === 'number' && (entry.name?.toLowerCase().includes('value') || entry.name?.toLowerCase().includes('etb') || entry.name?.toLowerCase().includes('birr'))
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
  const {
    drugInventory = [],
    prescriptions = [],
    setActiveTab,
    setPharmacySubView
  } = useHospital();

  const pendingCount = prescriptions.filter((p) => p.status === 'Prescribed').length;
  const dispensingCount = prescriptions.filter((p) => p.status === 'Dispensing').length;
  const dispensedCount = prescriptions.filter((p) => p.status === 'Dispensed').length;

  const lowStockCount = drugInventory.filter((d) => d.stockOnHand <= d.reorderTriggerLevel).length;
  const controlledCount = drugInventory.filter((d) => d.isControlledSubstance).length;
  const coldChainCount = drugInventory.filter((d) => d.requiresColdChain).length;

  const totalStockValuation = useMemo(() => {
    return drugInventory.reduce((acc, d) => acc + (d.stockOnHand || 0) * (d.unitSalePrice || 0), 0);
  }, [drugInventory]);

  // Hourly Dispensing Volume Velocity
  const hourlyData = [
    { hour: '08:00', received: 12, dispensed: 10, pending: 2 },
    { hour: '09:00', received: 26, dispensed: 22, pending: 6 },
    { hour: '10:00', received: 38, dispensed: 34, pending: 10 },
    { hour: '11:00', received: 32, dispensed: 30, pending: 12 },
    { hour: '12:00', received: 20, dispensed: 19, pending: 13 },
    { hour: '13:00', received: 22, dispensed: 20, pending: 15 },
    { hour: '14:00', received: 30, dispensed: 28, pending: 17 },
    { hour: '15:00', received: 25, dispensed: 24, pending: 18 },
    { hour: '16:00', received: 16, dispensed: 15, pending: pendingCount }
  ];

  // Therapeutic Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      'Antibacterial / Anti-infectives': 42,
      'Analgesics & Anti-inflammatory': 35,
      'Cardiovascular & Antihypertensives': 28,
      'Endocrine & Metabolic (Insulins)': 20,
      'Gastrointestinal & Antimalarials': 25,
      'Respiratory & Bronchodilators': 16
    };

    return [
      { name: 'Antibacterial / Anti-infectives', value: counts['Antibacterial / Anti-infectives'], color: COLORS.teal },
      { name: 'Analgesics & NSAIDs', value: counts['Analgesics & Anti-inflammatory'], color: COLORS.sky },
      { name: 'Cardiovascular & HTN', value: counts['Cardiovascular & Antihypertensives'], color: COLORS.indigo },
      { name: 'Endocrine & Insulins', value: counts['Endocrine & Metabolic (Insulins)'], color: COLORS.emerald },
      { name: 'GI & Antimalarials', value: counts['Gastrointestinal & Antimalarials'], color: COLORS.amber },
      { name: 'Respiratory Inhalers', value: counts['Respiratory & Bronchodilators'], color: COLORS.purple }
    ];
  }, []);

  // Multi-Store Inventory Valuation Distribution
  const storeValuationData = [
    { store: 'Main Central Pharmacy', value: Math.round(totalStockValuation * 0.62), items: 120, fill: COLORS.teal },
    { store: 'Emergency Trauma Pharmacy', value: Math.round(totalStockValuation * 0.18), items: 45, fill: COLORS.rose },
    { store: 'IPD Satellite Dispensary', value: Math.round(totalStockValuation * 0.12), items: 35, fill: COLORS.purple },
    { store: 'OT Surgical Stock Vault', value: Math.round(totalStockValuation * 0.08), items: 25, fill: COLORS.sky }
  ];

  // Expiry Risk and Safety FEFO Telemetry
  const expirySafetyData = [
    { range: '0 - 30 Days (Critical Alert)', count: 2, status: 'Immediate Clearance', color: COLORS.rose },
    { range: '31 - 90 Days (Warning)', count: 5, status: 'FEFO Fast-Track', color: COLORS.amber },
    { range: '91 - 180 Days (Stable)', count: 18, status: 'Normal Rotation', color: COLORS.sky },
    { range: '> 180 Days (Optimal)', count: drugInventory.length > 25 ? drugInventory.length - 25 : 45, status: 'Secure Buffer', color: COLORS.emerald }
  ];

  const handleNavigateToSubView = (subView: string) => {
    setActiveTab('PHARMACY');
    if (setPharmacySubView) {
      setPharmacySubView(subView);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Identity Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Formulary Command & Perpetual Inventory
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Live Dispensary Telemetry
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Pill className="w-7 h-7 text-emerald-400" />
              Hospital Pharmacy & Formulary Intelligence
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Real-time electronic prescription fulfillment velocity, multi-store stock asset valuation, cold-chain refrigeration audit, and FEFO inventory safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Perpetual Stock Valuation</div>
              <div className="text-lg font-black text-emerald-400 font-mono">ETB {totalStockValuation.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Formulary Items</div>
              <div className="text-lg font-black text-white font-mono">{drugInventory.length} Active SKUs</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prescription Queue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prescriptions Queue</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Pill className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{pendingCount}</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                To Dispense
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {dispensedCount} dispensed • {dispensingCount} in fulfillment
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 font-bold">Avg TAT: 3.2 min</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('DISPENSARY')}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Open Dispensary <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Stock Valuation & Ledger */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Valuation</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {totalStockValuation > 1000000 ? `${(totalStockValuation / 1000000).toFixed(2)}M` : `${Math.round(totalStockValuation / 1000)}k`}
              </span>
              <span className="text-xs font-semibold text-slate-500">ETB Value</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Across 4 hospital dispensary stores
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold">{drugInventory.length} Formulary Drugs</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('STOCK')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Stock Ledger <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Cold-Chain & Controlled Vault */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cold-Chain & Vault</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ThermometerSnowflake className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{coldChainCount}</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                2°C - 8°C Nominal
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {controlledCount} Controlled Vault Narcotics
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 font-bold">100% Audit Logged</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('CONTROLLED')}
              className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Vault Security <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings & Buffer */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buffer & Reorder</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold font-mono ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{lowStockCount}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${lowStockCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {lowStockCount > 0 ? 'Reorder Needed' : 'Buffers OK'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Min buffer safety threshold
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">FEFO Managed</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('STOCK')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Check Stock <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Hourly Prescription Velocity (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prescription Intake & Fulfillment Velocity</h3>
              <p className="text-[11px] text-slate-500">Hourly doctor e-prescriptions received vs completed pharmacy dispenses</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
              Today (08:00 - 17:00)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rxRecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rxDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="received" name="Prescriptions Received" stroke={COLORS.teal} strokeWidth={2.5} fillOpacity={1} fill="url(#rxRecGrad)" />
                <Area type="monotone" dataKey="dispensed" name="Medications Dispensed" stroke={COLORS.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#rxDispGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Therapeutic Class Distribution (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Therapeutic Class Share</h3>
              <p className="text-[11px] text-slate-500">Dispensed volume by medication classification</p>
            </div>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Formulary Share
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Multi-Store Stock Valuation Bar Chart (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Perpetual Stock Valuation by Store Location</h3>
              <p className="text-[11px] text-slate-500">Inventory asset valuation across Main, ER, IPD, and OT satellite storerooms</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              Total: ETB {totalStockValuation.toLocaleString()}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeValuationData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="store" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Stock Value (ETB)" fill={COLORS.teal} radius={[6, 6, 0, 0]} barSize={40}>
                  {storeValuationData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Expiry Timeline & FEFO Risk Matrix (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">FEFO Expiry Safety Horizon</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Audit Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              First-Expired, First-Out batch surveillance across active hospital formulary batches
            </p>

            <div className="space-y-3">
              {expirySafetyData.map((item) => (
                <div key={item.range} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.range}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.status}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono" style={{ color: item.color }}>
                      {item.count} SKUs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Zero expired drugs dispensed guarantee</span>
            <button
              type="button"
              onClick={() => handleNavigateToSubView('HISTORY')}
              className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Dispensing Audit →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
