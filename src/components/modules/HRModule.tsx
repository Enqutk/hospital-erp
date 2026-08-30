import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Phone,
  Building,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Send,
  X,
  FileText,
  UserCheck,
  Sparkles
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
  LineChart,
  Line
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { StaffEmployee, LeaveRequest } from '../../types';

// Uniform Medical Color Palette for Charts
const PALETTE = {
  primary: '#0f172a', // Slate 900
  secondary: '#059669', // Emerald 600
  tertiary: '#0284c7', // Sky 600
  accent1: '#6366f1', // Indigo 500
  accent2: '#d97706', // Amber 600
  accent3: '#e11d48', // Rose 600
  accent4: '#0d9488', // Teal 600
  accent5: '#0891b2', // Cyan 600
  muted: '#64748b' // Slate 500
};

const PIE_COLORS = [
  PALETTE.secondary,
  PALETTE.tertiary,
  PALETTE.accent1,
  PALETTE.accent2,
  PALETTE.accent4,
  PALETTE.accent5,
  PALETTE.primary,
  PALETTE.muted
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
            <span className="font-bold text-white font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const HRModule: React.FC = () => {
  const { staffList, leaveRequests, addStaffMember, submitLeaveRequest, updateLeaveStatus } = useHospital();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STAFF_ROSTER' | 'SHIFTS' | 'LEAVE_DESK'>('ANALYTICS');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('ALL');

  // Modals
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<StaffEmployee | null>(null);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    nationalIdNumber: '',
    jobTitle: '',
    department: 'OPD',
    dateOfHiring: new Date().toISOString().split('T')[0],
    qualifications: '',
    licenseName: '',
    licenseExpiry: '2027-12-31',
    currentShift: 'Morning (07:00-15:00)' as StaffEmployee['currentShift'],
    phone: ''
  });

  // New Leave Request Form State
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    leaveType: 'Annual Leave' as LeaveRequest['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    days: 5,
    reason: ''
  });

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDeptFilter === 'ALL' || s.department.toLowerCase() === selectedDeptFilter.toLowerCase();
      const matchShift = selectedShiftFilter === 'ALL' || s.currentShift.toLowerCase().includes(selectedShiftFilter.toLowerCase());
      return matchSearch && matchDept && matchShift;
    });
  }, [staffList, searchTerm, selectedDeptFilter, selectedShiftFilter]);

  // Analytics Computations
  const totalStaffCount = staffList.length;
  const onDutyCount = staffList.filter((s) => s.currentShift !== 'Off Duty' && s.status === 'Active').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;
  const compliantLicensesCount = staffList.filter((s) => s.activeCertifications.every((c) => c.valid)).length;
  const complianceRate = totalStaffCount ? Math.round((compliantLicensesCount / totalStaffCount) * 100) : 100;

  // Chart 1: Staff Distribution by Department (Pie Chart)
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    staffList.forEach((s) => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return Object.keys(counts).map((dept) => ({
      name: dept,
      value: counts[dept]
    }));
  }, [staffList]);

  // Chart 2: Shift Distribution across Cadres (Bar Chart)
  const shiftData = useMemo(() => {
    const shifts: Record<string, { morning: number; evening: number; night: number }> = {};
    staffList.forEach((s) => {
      if (!shifts[s.department]) {
        shifts[s.department] = { morning: 0, evening: 0, night: 0 };
      }
      if (s.currentShift.includes('Morning')) shifts[s.department].morning += 1;
      else if (s.currentShift.includes('Evening')) shifts[s.department].evening += 1;
      else if (s.currentShift.includes('Night')) shifts[s.department].night += 1;
    });
    return Object.keys(shifts).map((dept) => ({
      department: dept,
      Morning: shifts[dept].morning,
      Evening: shifts[dept].evening,
      Night: shifts[dept].night
    }));
  }, [staffList]);

  // Chart 3: Clinical Workload / Consultations Velocity per Clinician
  const clinicianWorkloadData = [
    { name: 'Dr. Michael Assefa', patients: 12, avgMinutes: 28, dept: 'Surgery' },
    { name: 'Dr. Dawit Haile', patients: 24, avgMinutes: 14, dept: 'OPD' },
    { name: 'Dr. Hana Tadesse', patients: 19, avgMinutes: 16, dept: 'Pediatrics' },
    { name: 'Dr. Solomon Bekele', patients: 22, avgMinutes: 18, dept: 'Emergency' },
    { name: 'Dr. Bethlehem Desta', patients: 16, avgMinutes: 12, dept: 'Radiology' }
  ];

  // Chart 4: 6-Month Staff Attendance & Leave Trends (Area / Line Chart)
  const monthlyTrendsData = [
    { month: 'Oct 2024', attendanceRate: 97.5, leaveDays: 14, overtimeHours: 42 },
    { month: 'Nov 2024', attendanceRate: 98.2, leaveDays: 11, overtimeHours: 38 },
    { month: 'Dec 2024', attendanceRate: 95.8, leaveDays: 22, overtimeHours: 55 },
    { month: 'Jan 2025', attendanceRate: 98.6, leaveDays: 8, overtimeHours: 32 },
    { month: 'Feb 2025', attendanceRate: 96.9, leaveDays: 16, overtimeHours: 46 },
    { month: 'Mar 2025', attendanceRate: 97.8, leaveDays: 12, overtimeHours: 39 }
  ];

  // Chart 5: License & Credential Compliance Breakdown
  const credentialComplianceData = [
    { category: 'Medical Board License', verified: 12, expiringSoon: 2, expired: 0 },
    { category: 'BLS / ACLS Certification', verified: 14, expiringSoon: 0, expired: 0 },
    { category: 'Specialty Board (FACS/PALS)', verified: 8, expiringSoon: 1, expired: 0 },
    { category: 'Infection Prevention (IPPS)', verified: 14, expiringSoon: 0, expired: 0 }
  ];

  // Handle Add Staff Submission
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.fullName || !newStaff.jobTitle) return;

    const newEmp: StaffEmployee = {
      employeeId: `EMP-FPH-0${staffList.length + 1 < 10 ? '0' + (staffList.length + 1) : staffList.length + 1}`,
      nationalIdNumber: newStaff.nationalIdNumber || `ETH-${Math.floor(10000000 + Math.random() * 90000000)}`,
      fullName: newStaff.fullName,
      jobTitle: newStaff.jobTitle,
      department: newStaff.department,
      dateOfHiring: newStaff.dateOfHiring,
      academicQualifications: newStaff.qualifications
        ? newStaff.qualifications.split(',').map((q) => q.trim())
        : ['Standard Clinical Certification'],
      activeCertifications: [
        {
          name: newStaff.licenseName || 'Professional Practicing License',
          expiryDate: newStaff.licenseExpiry,
          valid: true
        }
      ],
      leaveBalances: { annualLeave: 16, sickLeave: 14, maternityPaternity: 0, studyLeave: 4 },
      currentShift: newStaff.currentShift,
      status: 'Active',
      phone: newStaff.phone || '+251 911 000 000'
    };

    addStaffMember(newEmp);
    setAddStaffModalOpen(false);
    setNewStaff({
      fullName: '',
      nationalIdNumber: '',
      jobTitle: '',
      department: 'OPD',
      dateOfHiring: new Date().toISOString().split('T')[0],
      qualifications: '',
      licenseName: '',
      licenseExpiry: '2027-12-31',
      currentShift: 'Morning (07:00-15:00)',
      phone: ''
    });
  };

  // Handle Submit Leave Request
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = staffList.find((s) => s.employeeId === newLeave.employeeId) || staffList[0];
    if (!emp) return;

    submitLeaveRequest({
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days: Number(newLeave.days),
      reason: newLeave.reason || 'Personal / Clinical Leave',
      status: 'Pending'
    });

    setLeaveModalOpen(false);
    setNewLeave({
      employeeId: '',
      leaveType: 'Annual Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      days: 5,
      reason: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workforce Intelligence
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">
              Clinical Staffing, Shifts & Credentials
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800" />
            Human Resources & Clinical Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Institutional workforce governance: headcount analytics, departmental staffing distribution, live duty shift rosters, credential verification, and automated leave approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAddStaffModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll New Staff</span>
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
          <span>HR Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('STAFF_ROSTER')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'STAFF_ROSTER'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Roster ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SHIFTS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'SHIFTS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Duty Shifts</span>
        </button>

        <button
          onClick={() => setActiveTab('LEAVE_DESK')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'LEAVE_DESK'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Desk {pendingLeavesCount > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">{pendingLeavesCount}</span>}</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Total Hospital Staff</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">{totalStaffCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Across 8 clinical cadres</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">On-Duty Today</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">{onDutyCount}</div>
            <div className="text-[11px] text-slate-500">
              {Math.round((onDutyCount / (totalStaffCount || 1)) * 100)}% Coverage of wards & clinics
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Licensure & CME Compliance</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">{complianceRate}%</div>
            <div className="text-[11px] text-emerald-600 font-medium">All MoH boards verified</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Pending Leave Requests</span>
            <div className="text-2xl font-bold text-amber-600 font-mono">{pendingLeavesCount}</div>
            <div className="text-[11px] text-slate-500">Awaiting admin authorization</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WORKFORCE ANALYTICS & CHARTS */}
      {/* ======================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Row 1: Headcount Distribution (Pie) & Shift Coverage (Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Chart: Headcount by Department */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Personnel by Department</h3>
                  <p className="text-[11px] text-slate-500">Headcount percentage across hospital units</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <Building className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
                  <span className="text-slate-500 block">Largest Cadre</span>
                  <strong className="text-slate-800">OPD & IPD Nursing (42%)</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 block">Staff-to-Bed Ratio</span>
                  <strong className="text-slate-800">1 : 2.8 Beds (Optimal)</strong>
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart: Shift Coverage by Department */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Shift Staffing Roster Distribution</h3>
                  <p className="text-[11px] text-slate-500">Morning, Evening, and Night active duty slots per unit</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Morning" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Evening" fill={PALETTE.tertiary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Night" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Emergency and IPD maintain mandatory 24/7 tri-shift presence</span>
                <span className="font-semibold text-emerald-700">100% Minimum Shift Quotas Met ✓</span>
              </div>
            </div>
          </div>

          {/* Row 2: Clinician Workload Velocity (Bar) & 6-Month Attendance Trends (Area) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Chart: Clinical Workload per Doctor */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Doctor Consultation Load & Velocity</h3>
                  <p className="text-[11px] text-slate-500">Patients attended today and avg consultation duration (minutes)</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <Briefcase className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clinicianWorkloadData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="patients" name="Patients Attended" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgMinutes" name="Avg Consult (Mins)" fill={PALETTE.accent2} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Standard OPD target: 15–20 minutes per diagnostic consultation</span>
                <span className="font-mono text-slate-700 font-semibold">Total Encounters: 93</span>
              </div>
            </div>

            {/* Area Chart: 6-Month Staff Attendance & Overtime Trends */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">6-Month Attendance & Overtime Trajectory</h3>
                  <p className="text-[11px] text-slate-500">Monthly attendance percentage and cumulative overtime hours</p>
                </div>
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.secondary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={PALETTE.secondary} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="overtimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.tertiary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PALETTE.tertiary} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Area
                      type="monotone"
                      dataKey="attendanceRate"
                      name="Attendance Rate (%)"
                      stroke={PALETTE.secondary}
                      fillOpacity={1}
                      fill="url(#attendanceGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="overtimeHours"
                      name="Overtime Hours"
                      stroke={PALETTE.tertiary}
                      fillOpacity={1}
                      fill="url(#overtimeGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Peak holiday overtime controlled in December</span>
                <span className="font-semibold text-emerald-700">Average Punctuality: 97.4%</span>
              </div>
            </div>
          </div>

          {/* Row 3: Professional Credentialing & Licensing Matrix */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Professional Board Certifications & CME Audit</h3>
                <p className="text-[11px] text-slate-500">Credentialing status across clinical regulatory categories</p>
              </div>
              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <FileCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={credentialComplianceData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} width={160} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="verified" name="Fully Verified & Active" fill={PALETTE.secondary} stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="expiringSoon" name="Renewal Due <90 Days" fill={PALETTE.accent2} stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STAFF DIRECTORY & CREDENTIALING */}
      {/* ======================================================== */}
      {activeTab === 'STAFF_ROSTER' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name, title, department, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="OPD">OPD Clinic</option>
                <option value="IPD">Inpatient (IPD)</option>
                <option value="Surgery">Surgery & OT</option>
                <option value="Emergency">Emergency</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Cashier & Finance">Finance</option>
                <option value="Administration">Administration</option>
              </select>

              {/* Shift Filter */}
              <select
                value={selectedShiftFilter}
                onChange={(e) => setSelectedShiftFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <button
              onClick={() => setAddStaffModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Staff Roster Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-3">Employee & Role</span>
              <span className="col-span-2">Department</span>
              <span className="col-span-2">Current Shift</span>
              <span className="col-span-3">Certifications & Licensing</span>
              <span className="col-span-2 text-right">Profile & Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.employeeId}
                  className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/70 transition-colors"
                >
                  {/* Name & ID */}
                  <div className="col-span-3 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{staff.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {staff.employeeId} • {staff.jobTitle}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-2">
                    <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {staff.department}
                    </span>
                  </div>

                  {/* Current Shift */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                        staff.currentShift.includes('Morning')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : staff.currentShift.includes('Evening')
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : staff.currentShift.includes('Night')
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{staff.currentShift.split(' ')[0]}</span>
                    </span>
                  </div>

                  {/* Certifications */}
                  <div className="col-span-3 text-[11px] text-slate-600 min-w-0">
                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{staff.activeCertifications[0]?.name || 'Board Licensed'}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Exp: {staff.activeCertifications[0]?.expiryDate || 'Active'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => setSelectedStaffProfile(staff)}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}

              {filteredStaff.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No staff members matched your filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DUTY SHIFTS & ROSTER MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'SHIFTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">24-Hour Clinical Duty Roster Matrix</h3>
                <p className="text-[11px] text-slate-500">Live allocation across Morning, Evening, and Night duty shifts</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Morning (07:00-15:00)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  Evening (15:00-23:00)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  Night (23:00-07:00)
                </span>
              </div>
            </div>

            {/* Department Shift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['OPD', 'IPD', 'Emergency', 'Surgery', 'Laboratory', 'Pharmacy'].map((dept) => {
                const deptStaff = staffList.filter((s) => s.department.toLowerCase().includes(dept.toLowerCase()));

                return (
                  <div key={dept} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {dept} Department
                      </span>
                      <span className="text-[10px] font-semibold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {deptStaff.length} On Roster
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deptStaff.map((staff) => (
                        <div key={staff.employeeId} className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">{staff.fullName}</div>
                            <div className="text-[10px] text-slate-500">{staff.jobTitle}</div>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              staff.currentShift.includes('Morning')
                                ? 'bg-emerald-50 text-emerald-700'
                                : staff.currentShift.includes('Evening')
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {staff.currentShift.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LEAVE MANAGEMENT & APPROVALS */}
      {/* ======================================================== */}
      {activeTab === 'LEAVE_DESK' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Staff Leave Requests & Authorization Desk</h3>
              <p className="text-[11px] text-slate-500">Track and approve annual, sick, and continuing education study leaves</p>
            </div>

            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>

          {/* Leave Requests Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <span className="col-span-2">Request ID</span>
              <span className="col-span-3">Employee & Dept</span>
              <span className="col-span-2">Leave Type</span>
              <span className="col-span-2">Period & Duration</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-2 text-right">Approval Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaveRequests.map((leave) => (
                <div key={leave.requestId} className="px-4 py-3 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-2 font-mono text-[11px] font-semibold text-slate-700">
                    {leave.requestId}
                  </div>

                  <div className="col-span-3">
                    <div className="font-bold text-slate-900">{leave.employeeName}</div>
                    <div className="text-[11px] text-slate-500">{leave.department}</div>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {leave.leaveType}
                    </span>
                  </div>

                  <div className="col-span-2 text-[11px] text-slate-600">
                    <div>{leave.startDate} to {leave.endDate}</div>
                    <div className="text-slate-400 font-medium">({leave.days} working days)</div>
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : leave.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                    {leave.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => updateLeaveStatus(leave.requestId, 'Approved')}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                          title="Approve Leave"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave.requestId, 'Rejected')}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold px-2 py-1 rounded text-xs transition-colors cursor-pointer border border-slate-200"
                          title="Reject"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Decision Logged</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW STAFF MEMBER */}
      {/* ======================================================== */}
      {addStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-xl border border-slate-200 text-xs space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Add New Hospital Staff Member</h3>
              </div>
              <button
                onClick={() => setAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Full Name (with Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aster Kebede, MD"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consultant Gynecologist"
                    value={newStaff.jobTitle}
                    onChange={(e) => setNewStaff({ ...newStaff, jobTitle: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  >
                    <option value="OPD">OPD Consultations</option>
                    <option value="IPD">Inpatient Wards (IPD)</option>
                    <option value="Emergency">Emergency & Triage</option>
                    <option value="Surgery">Surgery & OT</option>
                    <option value="Laboratory">Laboratory & Blood Bank</option>
                    <option value="Radiology">Radiology (PACS)</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Cashier & Finance">Finance & Cashier</option>
                    <option value="Administration">Administration & HR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Assigned Shift</label>
                  <select
                    value={newStaff.currentShift}
                    onChange={(e) => setNewStaff({ ...newStaff, currentShift: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  >
                    <option value="Morning (07:00-15:00)">Morning (07:00-15:00)</option>
                    <option value="Evening (15:00-23:00)">Evening (15:00-23:00)</option>
                    <option value="Night (23:00-07:00)">Night (23:00-07:00)</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">National ID / Staff ID</label>
                  <input
                    type="text"
                    placeholder="ETH-88229911"
                    value={newStaff.nationalIdNumber}
                    onChange={(e) => setNewStaff({ ...newStaff, nationalIdNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+251 911 000 000"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Academic Qualifications (comma separated)</label>
                <input
                  type="text"
                  placeholder="MD, Specialty Board in Obstetrics & Gyn"
                  value={newStaff.qualifications}
                  onChange={(e) => setNewStaff({ ...newStaff, qualifications: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Primary Board Licensure Name</label>
                  <input
                    type="text"
                    placeholder="Federal MoH Practicing License"
                    value={newStaff.licenseName}
                    onChange={(e) => setNewStaff({ ...newStaff, licenseName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Licensure Expiry Date</label>
                  <input
                    type="date"
                    value={newStaff.licenseExpiry}
                    onChange={(e) => setNewStaff({ ...newStaff, licenseExpiry: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStaffModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: STAFF PROFILE INSPECTOR DRAWER */}
      {/* ======================================================== */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-xl border border-slate-200 text-xs space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {selectedStaffProfile.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedStaffProfile.fullName}</h3>
                  <p className="text-[11px] text-slate-500">{selectedStaffProfile.jobTitle} • {selectedStaffProfile.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Employee ID:</span>
                  <strong className="text-slate-800 font-mono">{selectedStaffProfile.employeeId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">National ID:</span>
                  <strong className="text-slate-800 font-mono">{selectedStaffProfile.nationalIdNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Hiring:</span>
                  <strong className="text-slate-800">{selectedStaffProfile.dateOfHiring}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <strong className="text-slate-800">{selectedStaffProfile.phone}</strong>
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                  <span>Academic Qualifications</span>
                </div>
                <ul className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-slate-700">
                  {selectedStaffProfile.academicQualifications.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certifications */}
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-600" />
                  <span>Active Board Certifications</span>
                </div>
                <div className="space-y-1.5">
                  {selectedStaffProfile.activeCertifications.map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-slate-400 text-[10px]">Valid until: {c.expiryDate}</div>
                      </div>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        Verified ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Balances */}
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Remaining Annual Leave Allowances</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500">Annual Leave</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">{selectedStaffProfile.leaveBalances.annualLeave} Days</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500">Sick Leave</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">{selectedStaffProfile.leaveBalances.sickLeave} Days</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500">Study / CME</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">{selectedStaffProfile.leaveBalances.studyLeave} Days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SUBMIT LEAVE REQUEST */}
      {/* ======================================================== */}
      {leaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl border border-slate-200 text-xs space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Submit Staff Leave Request</h3>
              </div>
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Select Staff Member *</label>
                <select
                  required
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {staffList.map((s) => (
                    <option key={s.employeeId} value={s.employeeId}>
                      {s.fullName} ({s.department} - {s.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Leave Type *</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Study / Training">Study / Training / CME</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">End Date</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Total Working Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newLeave.days}
                  onChange={(e) => setNewLeave({ ...newLeave, days: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Clinical Reason / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Enter reason for leave..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
