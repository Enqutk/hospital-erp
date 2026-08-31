import React, { useMemo } from 'react';
import {
  Wallet,
  Receipt,
  CreditCard,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle
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
  purple: '#8b5cf6',
  amber: '#d97706',
  rose: '#e11d48',
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
              ETB {Number(entry.value).toLocaleString()}.00
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CashierAnalyticsView: React.FC = () => {
  const { billingInvoices = [], transactions = [], currentUser } = useHospital();

  // Shift Reconciliations
  const totalClearedRevenue = billingInvoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cashRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && i.paymentMethod === 'Cash')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const telebirrRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && i.paymentMethod === 'Telebirr')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cbeBirrRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && i.paymentMethod === 'CBE Birr')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cbhiRevenue = billingInvoices
    .filter((i) => i.status === 'Paid' && (i.paymentMethod === 'CBHI Insurance' || i.paymentMethod === 'Private Insurance'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingUnpaidTotal = billingInvoices
    .filter((i) => i.status === 'Pending' || i.status === 'Insurance Pending')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Hourly Collection Velocity Data
  const hourlyRevenueData = [
    { hour: '08:00', collections: 150, transactions: 2 },
    { hour: '09:00', collections: 420, transactions: 4 },
    { hour: '10:00', collections: 680, transactions: 7 },
    { hour: '11:00', collections: 950, transactions: 9 },
    { hour: '12:00', collections: 540, transactions: 5 },
    { hour: '13:00', collections: 320, transactions: 3 },
    { hour: '14:00', collections: 810, transactions: 8 },
    { hour: '15:00', collections: 760, transactions: 7 }
  ];

  // Payment Channel Mix
  const paymentChannelData = useMemo(() => [
    { name: 'Physical Cash Drawer', value: Math.max(350, cashRevenue), color: COLORS.emerald },
    { name: 'Telebirr QR / Mobile', value: Math.max(400, telebirrRevenue), color: COLORS.blue },
    { name: 'CBE Birr POS', value: Math.max(150, cbeBirrRevenue), color: COLORS.indigo },
    { name: 'CBHI Government Claims', value: Math.max(250, cbhiRevenue), color: COLORS.teal }
  ], [cashRevenue, telebirrRevenue, cbeBirrRevenue, cbhiRevenue]);

  // Revenue By Department Service Source
  const departmentRevenueData = [
    { department: 'Pharmacy Dispensary', revenue: 1450 },
    { department: 'Laboratory & Blood Bank', revenue: 1120 },
    { department: 'OPD Doctor Consultations', revenue: 890 },
    { department: 'IPD Wards & Nursing', revenue: 2150 },
    { department: 'Radiology & Imaging', revenue: 650 },
    { department: 'Surgical Theater', revenue: 1800 }
  ];

  return (
    <div className="space-y-4 text-xs">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Cashier POS & Financial Intelligence Dashboard</h2>
            <p className="text-slate-500 text-[11px]">
              Active shift reconciliation, digital payment gateway settlement, CBHI claim audit, and service revenue telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>POS Register 01 Online</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Total Shift Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono mt-1">
            ETB {totalClearedRevenue.toLocaleString()}.00
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            All cleared settlements
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Physical Cash Drawer</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-700 font-mono mt-1">
            ETB {cashRevenue.toLocaleString()}.00
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Drawer register count
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Telebirr & CBE Birr</span>
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-700 font-mono mt-1">
            ETB {(telebirrRevenue + cbeBirrRevenue).toLocaleString()}.00
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Digital gateway collections
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">CBHI & Insurance</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-black text-teal-700 font-mono mt-1">
            ETB {cbhiRevenue.toLocaleString()}.00
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Beneficiary coverage
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-700 font-mono mt-1">
            ETB {pendingUnpaidTotal.toLocaleString()}.00
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            Awaiting settlement
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Collection Velocity (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Hourly Collections & Settlement Velocity</h3>
              <p className="text-[11px] text-slate-500">Real-time hourly revenue flow and transaction volume</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Today (08:00 - 16:00)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="collections" name="Hourly Revenue (ETB)" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#collGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Gateway Distribution (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Payment Channel Mix</h3>
              <p className="text-[11px] text-slate-500">Breakdown by cash, digital gateway & CBHI</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              POS Channels
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChannelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentChannelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Clinical Department (Full Width) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Revenue Generated by Clinical Department</h3>
              <p className="text-[11px] text-slate-500">Service billing distribution across clinical service departments</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Department Matrix
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Service Revenue (ETB)" fill={COLORS.teal} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
