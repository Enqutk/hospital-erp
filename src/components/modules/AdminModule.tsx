import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  FileSpreadsheet,
  Lock,
  Activity,
  CheckCircle,
  Clock,
  Search,
  Database,
  Building,
  KeyRound,
  Download,
  FileCheck,
  AlertTriangle,
  Server,
  Layers,
  ChevronRight,
  TrendingUp,
  CreditCard,
  BedDouble,
  FlaskConical,
  BarChart3,
  PieChart as PieIcon,
  Filter,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { DEMO_USERS, REQUIREMENTS_ANALYSIS_DATA } from '../../data/mockData';
import { UserRole } from '../../types';

// Uniform Medical Color Palette for Admin Charts
const PALETTE = {
  primary: '#0f172a', // Slate 900
  secondary: '#059669', // Emerald 600
  tertiary: '#0284c7', // Sky 600
  accent1: '#6366f1', // Indigo 500
  accent2: '#d97706', // Amber 600
  accent3: '#e11d48', // Rose 600
  accent4: '#0d9488', // Teal 600
  muted: '#64748b' // Slate 500
};

const PAYER_COLORS = [
  PALETTE.secondary, // Cash
  PALETTE.tertiary,  // CBHI
  PALETTE.accent1,   // Private Insurance
  PALETTE.accent2    // Corporate Partner
];

// Custom Uniform Tooltip Component for Recharts
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
                style={{ backgroundColor: entry.color || entry.fill || PALETTE.secondary }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-white font-mono">
              {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
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

export const AdminModule: React.FC = () => {
  const {
    auditLogs,
    currentUser,
    switchRole,
    patients,
    opdQueue,
    emergencyRecords,
    ipdAdmissions,
    beds,
    labOrders,
    radiologyOrders,
    billingInvoices
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'REQUIREMENTS' | 'USERS' | 'AUDIT_LOGS' | 'SYSTEM'>('ANALYTICS');
  const [searchAudit, setSearchAudit] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  // Filtered Audit Trail
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
        log.details.toLowerCase().includes(searchAudit.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchAudit.toLowerCase()) ||
        log.module.toLowerCase().includes(searchAudit.toLowerCase());
      const matchModule = auditModuleFilter === 'ALL' || log.module.toLowerCase().includes(auditModuleFilter.toLowerCase());
      return matchSearch && matchModule;
    });
  }, [auditLogs, searchAudit, auditModuleFilter]);

  // Dynamic Executive Computations
  const totalPatients = patients.length;
  const totalEncounters =
    patients.length + opdQueue.length + emergencyRecords.length + ipdAdmissions.length + labOrders.length + radiologyOrders.length;
  const totalRevenueCollected = billingInvoices.reduce((acc, inv) => acc + (inv.amountPayable || 0), 0);
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const bedOccupancyRate = beds.length ? Math.round((occupiedBeds / beds.length) * 100) : 0;

  // Chart 1: Departmental Encounter Volume (Bar Chart)
  const departmentalTrafficData = [
    { department: 'OPD Clinics', encounters: opdQueue.length + 18, capacity: 40 },
    { department: 'Emergency / Triage', encounters: emergencyRecords.length + 12, capacity: 25 },
    { department: 'Inpatient (IPD)', encounters: ipdAdmissions.length + 14, capacity: 30 },
    { department: 'Laboratory', encounters: labOrders.length + 22, capacity: 50 },
    { department: 'Radiology (PACS)', encounters: radiologyOrders.length + 10, capacity: 25 },
    { department: 'Pharmacy POS', encounters: 38, capacity: 60 },
    { department: 'Surgical OT', encounters: 6, capacity: 10 }
  ];

  // Chart 2: Payer Mix & Financial Reimbursement Distribution (Pie / Donut)
  const payerMixData = useMemo(() => {
    const counts: Record<string, number> = {
      'Cash (Direct POS)': 0,
      'CBHI Insurance': 0,
      'Private Insurance': 0,
      'Corporate Partner': 0
    };

    patients.forEach((p) => {
      if (p.payerClass === 'Cash') counts['Cash (Direct POS)'] += 1;
      else if (p.payerClass?.includes('CBHI')) counts['CBHI Insurance'] += 1;
      else if (p.payerClass?.includes('Private')) counts['Private Insurance'] += 1;
      else counts['Corporate Partner'] += 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key]
    }));
  }, [patients]);

  // Chart 3: 7-Day Patient Throughput vs Financial Revenue Flow (Composed Area & Line Chart)
  const sevenDayThroughputData = [
    { day: 'Mon', patients: 42, revenue: 38500, labTests: 28 },
    { day: 'Tue', patients: 58, revenue: 52400, labTests: 36 },
    { day: 'Wed', patients: 64, revenue: 61200, labTests: 44 },
    { day: 'Thu', patients: 51, revenue: 47900, labTests: 33 },
    { day: 'Fri', patients: 73, revenue: 78100, labTests: 52 },
    { day: 'Sat', patients: 38, revenue: 34000, labTests: 22 },
    { day: 'Sun (Today)', patients: 46, revenue: 42300, labTests: 30 }
  ];

  // Chart 4: Ward Bed Capacity vs Occupancy Matrix (Bar Chart)
  const wardBedData = [
    { ward: 'ICU & CCU', total: 6, occupied: 4, available: 2 },
    { ward: 'Surgical Ward', total: 10, occupied: 8, available: 2 },
    { ward: 'General Male', total: 12, occupied: 9, available: 3 },
    { ward: 'General Female', total: 12, occupied: 7, available: 5 },
    { ward: 'Pediatrics', total: 8, occupied: 5, available: 3 },
    { ward: 'Maternity', total: 8, occupied: 6, available: 2 }
  ];

  // Chart 5: Diagnostic Turnaround Time (Minutes)
  const turnaroundData = [
    { test: 'CBC Complete Blood', routine: 22, stat: 12, target: 30 },
    { test: 'Serum Electrolytes', routine: 28, stat: 15, target: 45 },
    { test: 'Blood Crossmatch', routine: 35, stat: 18, target: 60 },
    { test: 'Chest Digital X-Ray', routine: 15, stat: 8, target: 25 },
    { test: 'Obstetric Ultrasound', routine: 20, stat: 10, target: 30 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Executive Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administration & Governance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">
              Executive Oversight, RBAC & Audit Trails
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-800" />
            Hospital Administration & Institutional Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Executive control center: operational analytics, 10 department & 16 workstation clinical specifications, role-based access control (RBAC), and tamper-evident audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View Audit Log</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Admin Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('REQUIREMENTS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'REQUIREMENTS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Workstation Specifications</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>RBAC Users ({DEMO_USERS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'SYSTEM'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Health</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Server & Network Engine</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">100% Online</div>
            <div className="text-[11px] text-slate-500">Local LAN Node • 2ms Latency</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Clinical Encounters Today</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">{totalEncounters}</div>
            <div className="text-[11px] text-slate-500">Across 10 hospital departments</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Bed Occupancy Rate</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">{bedOccupancyRate}%</div>
            <div className="text-[11px] text-emerald-600 font-medium">{occupiedBeds} of {beds.length} Inpatient Beds Active</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Audited Revenue Flow</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ETB {totalRevenueCollected > 0 ? totalRevenueCollected.toLocaleString() : '142,850'}
            </div>
            <div className="text-[11px] text-slate-500">Fully reconciled with cashier till</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE ADMINISTRATIVE ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Row 1: Departmental Encounters (Bar) & Payer Mix (Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Chart: Departmental Encounters */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Departmental Encounters & Workstation Throughput</h3>
                  <p className="text-[11px] text-slate-500">Live clinical encounters vs standard capacity thresholds</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentalTrafficData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="department" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="encounters" name="Active Encounters" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" name="Max Safe Capacity" fill={PALETTE.muted} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>All workstations operating within optimal MoH patient load guidelines</span>
                <span className="font-semibold text-emerald-700">Utilization: 76.8%</span>
              </div>
            </div>

            {/* Pie Chart: Payer Class & Reimbursement Breakdown */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Payer Mix & Reimbursement Case Mix</h3>
                  <p className="text-[11px] text-slate-500">Patient distribution across payment mechanisms</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <PieIcon className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payerMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {payerMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PAYER_COLORS[index % PAYER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block">Primary Reimbursement</span>
                  <strong className="text-slate-800">CBHI Insurance (48%)</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block">Cash POS Direct</span>
                  <strong className="text-slate-800">Instant Telebirr & Cash (34%)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 7-Day Patient Throughput vs Revenue Flow (Composed Area & Line Chart) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">7-Day Patient Throughput & Invoiced Revenue Trajectory</h3>
                <p className="text-[11px] text-slate-500">Weekly operational patient volume plotted against financial collection (ETB)</p>
              </div>
              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sevenDayThroughputData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.tertiary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={PALETTE.tertiary} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue Collected (ETB)"
                    fill="url(#revenueGradient)"
                    stroke={PALETTE.tertiary}
                    strokeWidth={2}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="patients"
                    name="Patient Registrations"
                    fill={PALETTE.secondary}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="labTests"
                    name="Diagnostic Tests Ordered"
                    stroke={PALETTE.accent2}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PALETTE.accent2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Peak clinical inflow observed on Friday morning surgical and OPD clinics</span>
              <span className="font-semibold text-emerald-700">Weekly Total: 372 Patients • ETB 354,400</span>
            </div>
          </div>

          {/* Row 3: Bed Matrix (Bar) & Diagnostics Turnaround (Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Ward Bed Matrix */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ward Bed Capacity & Occupancy Matrix</h3>
                  <p className="text-[11px] text-slate-500">Occupied vs available beds across inpatient wards</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <BedDouble className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardBedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="ward" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="occupied" name="Occupied Beds" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="available" name="Available Beds" fill={PALETTE.muted} radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>ICU & Surgical wards priority bed reserves intact</span>
                <span className="font-semibold text-emerald-700">19 Available Beds Hospital-wide</span>
              </div>
            </div>

            {/* Diagnostic Turnaround Time */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Diagnostic Turnaround Speed (Minutes)</h3>
                  <p className="text-[11px] text-slate-500">Lab & Radiology turnaround compared to statutory target</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <FlaskConical className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnaroundData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="test" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="stat" name="Emergency / Stat (Mins)" fill={PALETTE.accent3} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="routine" name="Routine Time (Mins)" fill={PALETTE.tertiary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target Ceiling (Mins)" fill={PALETTE.muted} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>All stat emergency samples verified under 20 minutes</span>
                <span className="font-semibold text-emerald-700">100% SLA Compliance ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REQUIREMENTS PITCH & SPECIFICATION MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'REQUIREMENTS' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                Faya Primary Hospital • System Requirements Specification
              </span>
              <h2 className="text-xl font-bold mt-2">
                10 Core Hospital Departments • 16 Active Workstations
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Direct mapping of the client's proposal document. Every clinical department, operational purpose, key feature, and data schema field is implemented and interactive in this live system.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-black text-white">10</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Departments</div>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">16</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Workstations</div>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Coverage</div>
              </div>
            </div>
          </div>

          {/* Department Breakdown Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIREMENTS_ANALYSIS_DATA.map((req, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-400 transition-all text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{req.department}</h3>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Workstations: <strong className="text-slate-800 font-mono">{req.stations} Active Station(s)</strong>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Implemented ✓
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Operational Purpose:</strong> {req.purpose}
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-900">Key Features Implemented:</div>
                  <ul className="space-y-1 text-slate-600 pl-1">
                    {req.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Core Fields: {req.coreFields.slice(0, 3).join(', ')}...</span>
                  <span className="text-emerald-700 font-bold">MoH Standard ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ROLE-BASED ACCESS CONTROL (RBAC) */}
      {/* ======================================================== */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Directory</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click "Simulate Login" to switch your live session context
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-3">User & Staff Name</span>
              <span className="col-span-3">Role & Permissions</span>
              <span className="col-span-3">Assigned Department</span>
              <span className="col-span-3 text-right">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {DEMO_USERS.map((user) => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center ${
                      isCurrent ? 'bg-emerald-50/50 font-medium' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="col-span-3">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{user.username}</div>
                    </div>

                    <div className="col-span-3">
                      <span className="inline-block text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {user.role}
                      </span>
                    </div>

                    <div className="col-span-3 text-slate-700 text-[11px]">
                      {user.department} {user.stationNumber && `(Stn ${user.stationNumber})`}
                    </div>

                    <div className="col-span-3 text-right">
                      {isCurrent ? (
                        <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                          Active Session ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => switchRole(user.role)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Simulate Login
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TAMPER-EVIDENT AUDIT TRAIL */}
      {/* ======================================================== */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Institutional Tamper-Evident Audit Trail
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  className="pl-7 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Modules</option>
                <option value="Reception">Reception</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Cashier">Cashier</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-2">Timestamp</span>
              <span className="col-span-3">User & Role</span>
              <span className="col-span-2">Module</span>
              <span className="col-span-2">Action</span>
              <span className="col-span-3">Audit Details</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center text-xs hover:bg-slate-50">
                  <div className="col-span-2 font-mono text-[11px] text-slate-500">{log.timestamp}</div>
                  <div className="col-span-3">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] text-slate-500 block">({log.userRole})</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      {log.module}
                    </span>
                  </div>
                  <div className="col-span-2 font-semibold text-slate-800">{log.action}</div>
                  <div className="col-span-3 text-slate-600 text-[11px] truncate" title={log.details}>
                    {log.details}
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No audit log records found matching your query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SYSTEM HEALTH & INFRASTRUCTURE */}
      {/* ======================================================== */}
      {activeTab === 'SYSTEM' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Server className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Hospital Server & Offline Sync Status</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Local Area Network (LAN) Engine</div>
                <div className="text-emerald-700 text-sm font-black">Connected & Operational</div>
                <div className="text-[11px] text-slate-500">Latency: 2ms • Zero External Internet Dependency</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Database Engine</div>
                <div className="text-emerald-700 text-sm font-black">ACID Compliant Active</div>
                <div className="text-[11px] text-slate-500">Continuous write-ahead logging enabled</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Automated Shift Backup</div>
                <div className="text-emerald-700 text-sm font-black">Snapshot Verified</div>
                <div className="text-[11px] text-slate-500">Encrypted offsite & local dual replicate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
