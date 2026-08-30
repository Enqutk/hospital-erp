import React, { useState } from 'react';
import {
  Bed,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  LogOut,
  Plus,
  ShieldCheck,
  UserCheck,
  Building,
  RefreshCw,
  X,
  Stethoscope,
  Activity,
  Droplets,
  Search,
  Inbox,
  Check,
  User,
  Baby,
  Eye,
  FileText,
  Phone
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { WardCode, IPDAdmission, DoctorAdmissionOrder } from '../../types';

type IPDSubTab = 'BED_MATRIX' | 'DOCTOR_ORDERS' | 'PEDIATRICS' | 'ACTIVE_INPATIENTS' | 'DISCHARGE_CLEARANCE';

export const IPDModule: React.FC = () => {
  const {
    beds,
    ipdAdmissions,
    admissionOrders,
    createAdmissionOrder,
    allocateBedForOrder,
    cancelAdmissionOrder,
    patients,
    admitPatientToBed,
    transferBed,
    updateBedStatus,
    updateDischargeChecklist,
    finalizeDischarge,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<IPDSubTab>('DOCTOR_ORDERS');
  const [selectedWard, setSelectedWard] = useState<WardCode | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [newDoctorOrderModalOpen, setNewDoctorOrderModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [orderToAllocate, setOrderToAllocate] = useState<DoctorAdmissionOrder | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<DoctorAdmissionOrder | null>(null);
  const [activeAdmissionForTransfer, setActiveAdmissionForTransfer] = useState<IPDAdmission | null>(null);
  const [selectedAdmissionForChart, setSelectedAdmissionForChart] = useState<IPDAdmission | null>(null);

  // Admit form state
  const [admitMrn, setAdmitMrn] = useState(selectedPatientMrn || 'FPH-2025-0105');
  const [admitWard, setAdmitWard] = useState<WardCode>('PEDIATRICS');
  const [admitBed, setAdmitBed] = useState('PED-03');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('Acute Bronchiolitis with Wheezing & Moderate Dehydration');
  const [admittingDoc, setAdmittingDoc] = useState('Dr. Hana Tadesse, MD (Consultant Pediatrician)');

  // Allocate order bed state
  const [allocWard, setAllocWard] = useState<WardCode>('GW-MALE');
  const [allocBed, setAllocBed] = useState('');

  // Transfer form state
  const [targetWard, setTargetWard] = useState<WardCode>('ICU');
  const [targetBed, setTargetBed] = useState('ICU-02');
  const [transferReason, setTransferReason] = useState('Clinical escalation requiring high-dependency respiratory monitoring');

  // New Doctor Order form state
  const [orderMrn, setOrderMrn] = useState(selectedPatientMrn || 'FPH-2025-0101');
  const [orderWard, setOrderWard] = useState<WardCode>('GW-MALE');
  const [orderPriority, setOrderPriority] = useState<'Routine' | 'Urgent' | 'Emergency / Stat'>('Urgent');
  const [orderOxygen, setOrderOxygen] = useState(false);
  const [orderDiag, setOrderDiag] = useState('Acute Exacerbation of Peptic Ulcer Disease');
  const [orderDoctor, setOrderDoctor] = useState(currentUser.name || 'Dr. Sarah Jenkins, MD');
  const [orderSource, setOrderSource] = useState<'OPD Clinic' | 'Emergency & Trauma' | 'Surgical OT' | 'Specialist Clinic'>('OPD Clinic');
  const [orderSourceLoc, setOrderSourceLoc] = useState('Station 1 - General Medicine');
  const [orderNotes, setOrderNotes] = useState('Immediate bed admission for continuous IV infusion and close monitoring.');

  // Pediatric fluid calculation helper state
  const [pedWeight, setPedWeight] = useState<number>(19.5);

  const calculatePediatricFluids = (weightKg: number) => {
    let dailyMl = 0;
    if (weightKg <= 10) {
      dailyMl = weightKg * 100;
    } else if (weightKg <= 20) {
      dailyMl = 1000 + (weightKg - 10) * 50;
    } else {
      dailyMl = 1500 + (weightKg - 20) * 20;
    }
    const hourlyMl = Math.round(dailyMl / 24);
    return { dailyMl, hourlyMl };
  };

  const wardsList: { code: WardCode; name: string; category: string; capacity: number }[] = [
    { code: 'PEDIATRICS', name: 'Pediatric & Child Inpatient', category: 'Pediatric Care (<15 yrs)', capacity: 4 },
    { code: 'ICU', name: 'Intensive Care Unit (ICU)', category: 'Critical Care & Telemetry', capacity: 2 },
    { code: 'MATERNITY', name: 'Maternity & Labour Ward', category: 'Maternal & Obstetric Care', capacity: 2 },
    { code: 'SURGICAL', name: 'Surgical Inpatient Ward', category: 'Post-Operative Recovery', capacity: 3 },
    { code: 'GW-MALE', name: 'Male General Ward', category: 'Adult Medical Inpatient', capacity: 3 },
    { code: 'GW-FEMALE', name: 'Female General Ward', category: 'Adult Medical Inpatient', capacity: 2 }
  ];

  const filteredBeds = beds.filter((b) => {
    const matchesWard = selectedWard === 'ALL' || b.wardCode === selectedWard;
    const matchesSearch =
      searchTerm === '' ||
      b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.patientName && b.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.patientMrn && b.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesWard && matchesSearch;
  });

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'Cleaning').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Pediatric specific stats
  const pediatricBeds = beds.filter((b) => b.wardCode === 'PEDIATRICS');
  const pediatricOccupied = pediatricBeds.filter((b) => b.status === 'Occupied').length;
  const pediatricAvailable = pediatricBeds.filter((b) => b.status === 'Available').length;

  // Pending Doctor Bed Orders
  const pendingOrders = (admissionOrders || []).filter((o) => o.status === 'Pending Bed Allocation');
  const totalOrders = (admissionOrders || []).length;

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    admitPatientToBed(admitMrn, admitWard, admitBed, admitDiagnosis, admittingDoc);
    setAdmitModalOpen(false);
  };

  const handleCreateNewDoctorOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = getPatientByMrn(orderMrn);
    const patientName = pt ? `${pt.firstName} ${pt.lastName}` : 'Patient';
    const ageGender = pt ? `${getPatientAge(pt.dob)}, ${pt.gender}` : undefined;
    const isChild = orderWard === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt.dob), 10) < 15);
    const guardian = isChild ? pt?.emergencyContactName || 'Parent Present' : undefined;

    createAdmissionOrder({
      mrn: orderMrn,
      patientName,
      ageGender,
      orderingDoctor: orderDoctor,
      sourceDepartment: orderSource,
      sourceLocation: orderSourceLoc,
      recommendedWard: orderWard,
      clinicalPriority: orderPriority,
      diagnosis: orderDiag,
      requiresOxygen: orderOxygen,
      guardianPresent: guardian,
      notes: orderNotes
    });

    setNewDoctorOrderModalOpen(false);
  };

  const handleOpenAllocateModal = (order: DoctorAdmissionOrder) => {
    setOrderToAllocate(order);
    setAllocWard(order.recommendedWard);
    const firstAvail = beds.find((b) => b.wardCode === order.recommendedWard && b.status === 'Available');
    setAllocBed(firstAvail ? firstAvail.bedNumber : '');
    setAllocateModalOpen(true);
  };

  const handleConfirmBedAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToAllocate || !allocBed) return;

    allocateBedForOrder(orderToAllocate.orderId, allocWard, allocBed, currentUser.name || 'Admissions Desk');
    setAllocateModalOpen(false);
    setOrderToAllocate(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdmissionForTransfer) return;
    transferBed(activeAdmissionForTransfer.admissionId, targetWard, targetBed, transferReason);
    setTransferModalOpen(false);
    setActiveAdmissionForTransfer(null);
  };

  const getPatientAge = (dobString?: string) => {
    if (!dobString) return 'Adult';
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    if (age < 1) return 'Infant (<1 yr)';
    if (age <= 3) return `${age} yrs (Toddler)`;
    if (age < 15) return `${age} yrs (Child)`;
    return `${age} yrs`;
  };

  const isChildPatient = (adm: IPDAdmission) => {
    if (adm.wardCode === 'PEDIATRICS') return true;
    const pt = getPatientByMrn(adm.mrn);
    if (!pt) return false;
    const age = parseInt(getPatientAge(pt.dob), 10);
    return !isNaN(age) && age < 15;
  };

  return (
    <div className="space-y-5">
      {/* Refined Executive Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inpatient Department
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-600">
                Bed Management & Clinical Intake
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              IPD Wards & Bed Control
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Doctor admission order intake, specialized pediatric unit oversight, real-time bed capacity matrix, inter-ward transfers, and multi-department discharge clearance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setNewDoctorOrderModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>New Bed Order</span>
            </button>
            <button
              onClick={() => {
                setAdmitWard('PEDIATRICS');
                const firstAvail = beds.find((b) => b.wardCode === 'PEDIATRICS' && b.status === 'Available');
                if (firstAvail) setAdmitBed(firstAvail.bedNumber);
                setAdmitModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Direct Bed Admit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* KPI 1: Doctor Orders Queue */}
        <div
          onClick={() => setActiveSubTab('DOCTOR_ORDERS')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'DOCTOR_ORDERS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={activeSubTab === 'DOCTOR_ORDERS' ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
              Doctor Orders
            </span>
            <Inbox className={`w-4 h-4 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-white' : 'text-slate-900'}`}>
            {pendingOrders.length} Pending
          </div>
          <div className={`text-[11px] mt-0.5 ${activeSubTab === 'DOCTOR_ORDERS' ? 'text-slate-400' : 'text-slate-500'}`}>
            {totalOrders} Total Orders
          </div>
        </div>

        {/* KPI 2: Total Bed Capacity */}
        <div
          onClick={() => setActiveSubTab('BED_MATRIX')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'BED_MATRIX'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={activeSubTab === 'BED_MATRIX' ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
              Total Beds
            </span>
            <Building className={`w-4 h-4 ${activeSubTab === 'BED_MATRIX' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'BED_MATRIX' ? 'text-white' : 'text-slate-900'}`}>
            {totalBeds} Beds
          </div>
          <div className={`text-[11px] mt-0.5 ${activeSubTab === 'BED_MATRIX' ? 'text-slate-400' : 'text-slate-500'}`}>
            6 Clinical Wards
          </div>
        </div>

        {/* KPI 3: Occupied Beds */}
        <div
          onClick={() => setActiveSubTab('ACTIVE_INPATIENTS')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'ACTIVE_INPATIENTS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
              Active Inpatients
            </span>
            <UserCheck className={`w-4 h-4 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-white' : 'text-slate-900'}`}>
            {occupiedBeds} Admitted
          </div>
          <div className={`text-[11px] mt-0.5 ${activeSubTab === 'ACTIVE_INPATIENTS' ? 'text-slate-400' : 'text-slate-500'}`}>
            {occupancyRate}% Occupancy
          </div>
        </div>

        {/* KPI 4: Pediatric Ward */}
        <div
          onClick={() => setActiveSubTab('PEDIATRICS')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'PEDIATRICS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={activeSubTab === 'PEDIATRICS' ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
              Pediatrics (Ward 03)
            </span>
            <Baby className={`w-4 h-4 ${activeSubTab === 'PEDIATRICS' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${activeSubTab === 'PEDIATRICS' ? 'text-white' : 'text-slate-900'}`}>
            {pediatricOccupied} / {pediatricBeds.length}
          </div>
          <div className={`text-[11px] mt-0.5 ${activeSubTab === 'PEDIATRICS' ? 'text-slate-400' : 'text-slate-500'}`}>
            {pediatricAvailable} Beds Free
          </div>
        </div>

        {/* KPI 5: Available */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Intake Ready</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1.5">
            {availableBeds} Available
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {cleaningBeds > 0 ? `${cleaningBeds} in sanitization` : 'Direct Intake Ready'}
          </div>
        </div>
      </div>

      {/* Sub-Page Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('DOCTOR_ORDERS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'DOCTOR_ORDERS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Doctor Bed Orders</span>
          {pendingOrders.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'DOCTOR_ORDERS' ? 'bg-slate-800 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('BED_MATRIX')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'BED_MATRIX'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Live Bed Matrix</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
              activeSubTab === 'BED_MATRIX' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {beds.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('PEDIATRICS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'PEDIATRICS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>Pediatric Inpatient Unit</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
              activeSubTab === 'PEDIATRICS' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Ward 03
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ACTIVE_INPATIENTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ACTIVE_INPATIENTS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Active Inpatients</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
              activeSubTab === 'ACTIVE_INPATIENTS' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {occupiedBeds}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('DISCHARGE_CLEARANCE')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'DISCHARGE_CLEARANCE'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Discharge Clearances</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-PAGE 1: DOCTOR BED ORDERS & ADMISSION INTAKE QUEUE */}
      {/* ======================================================== */}
      {activeSubTab === 'DOCTOR_ORDERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Doctor Bed Admission Orders Queue</span>
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {pendingOrders.length} Pending Allocation
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patients sent for inpatient admission by OPD consult stations and emergency teams.
                </p>
              </div>

              <button
                onClick={() => setNewDoctorOrderModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Bed Order</span>
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-2.5">
              {admissionOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No admission orders currently in the intake queue.
                </div>
              ) : (
                admissionOrders.map((order) => {
                  const isPending = order.status === 'Pending Bed Allocation';
                  const isAllocated = order.status === 'Bed Allocated';
                  const pt = getPatientByMrn(order.mrn);
                  const isChild = order.recommendedWard === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt.dob), 10) < 15);
                  const wardObj = wardsList.find((w) => w.code === order.recommendedWard);

                  return (
                    <div
                      key={order.orderId}
                      className={`p-3.5 rounded-lg border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isPending
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : isAllocated
                          ? 'border-slate-200 bg-slate-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Left: Essential Identification & Placement Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5 md:mt-0">
                          {isChild ? (
                            <Baby className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Bed className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {order.patientName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {order.mrn}
                            </span>
                            {order.ageGender && (
                              <span className="text-[11px] text-slate-500">
                                • {order.ageGender}
                              </span>
                            )}
                            {isChild && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                                Pediatric
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                order.clinicalPriority === 'Emergency / Stat'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : order.clinicalPriority === 'Urgent'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {order.clinicalPriority}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>Target: {wardObj?.name || order.recommendedWard}</span>
                            </span>
                            <span>•</span>
                            <span>
                              Ordered by <strong className="text-slate-700 font-medium">{order.orderingDoctor.split(',')[0]}</strong>
                            </span>
                            <span>•</span>
                            <span>{order.orderTime}</span>
                            {order.requiresOxygen && (
                              <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-medium border border-blue-200 text-[10px]">
                                O2 Port Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded border ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isAllocated
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isPending ? 'Pending Allocation' : isAllocated ? `Bed Assigned (${order.assignedBedNumber})` : order.status}
                        </span>

                        <button
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="View complete clinical diagnosis, doctor notes, and directives"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details</span>
                        </button>

                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleOpenAllocateModal(order)}
                              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              <Bed className="w-3.5 h-3.5" />
                              <span>Allocate Bed</span>
                            </button>
                            <button
                              onClick={() => cancelAdmissionOrder(order.orderId, 'Discharged from clinic')}
                              className="px-2 py-1.5 text-slate-400 hover:text-rose-600 text-xs rounded transition-colors cursor-pointer"
                              title="Cancel Admission Order"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          order.assignedBedNumber && (
                            <button
                              onClick={() => {
                                const matchingAdm = ipdAdmissions.find((a) => a.bedNumber === order.assignedBedNumber && a.status === 'Active');
                                if (matchingAdm) setSelectedAdmissionForChart(matchingAdm);
                                else setActiveSubTab('ACTIVE_INPATIENTS');
                              }}
                              className="text-xs bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 cursor-pointer shadow-xs"
                            >
                              View Chart
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-PAGE 2: LIVE WARD BED CONTROL MATRIX */}
      {/* ======================================================== */}
      {activeSubTab === 'BED_MATRIX' && (
        <div className="space-y-4">
          {/* Ward Filter & Search */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedWard('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedWard === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Wards ({beds.length})
                </button>
                {wardsList.map((w) => (
                  <button
                    key={w.code}
                    onClick={() => setSelectedWard(w.code)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      selectedWard === w.code
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{w.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedWard === w.code ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {beds.filter((b) => b.wardCode === w.code).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Bed No, Patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Visual Bed Grid */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  Ward Bed Status Matrix
                </h2>
                <span className="text-xs text-slate-500 font-normal">
                  ({filteredBeds.length} beds shown)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available ({availableBeds})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-500" /> Occupied ({occupiedBeds})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Sanitizing ({cleaningBeds})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredBeds.map((bed) => {
                const isOccupied = bed.status === 'Occupied';
                const isCleaning = bed.status === 'Cleaning';
                const matchingAdmission = ipdAdmissions.find(
                  (a) => a.bedNumber === bed.bedNumber && a.status === 'Active'
                );
                const isPediatric = bed.wardCode === 'PEDIATRICS';

                return (
                  <div
                    key={bed.bedId}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                            {isPediatric && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.2 rounded border border-blue-200">
                                Child Cot
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{bed.wardName}</div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isOccupied
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : isCleaning
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {bed.status}
                        </span>
                      </div>

                      {isOccupied && bed.patientName ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{bed.patientName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            MRN: {bed.patientMrn}
                          </div>
                          {matchingAdmission && (
                            <div className="text-[11px] text-slate-600 line-clamp-1">
                              {matchingAdmission.diagnosis}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Admitted: {bed.admittedAt || 'Recent'}</span>
                          </div>
                        </div>
                      ) : isCleaning ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Undergoing Sanitization</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Disinfection in progress post-discharge.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Intake Ready</span>
                          </div>
                          {bed.oxygenPortAvailable && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              <Activity className="w-3 h-3 text-slate-500" />
                              Oxygen Port
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card footer action */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      {isOccupied && matchingAdmission ? (
                        <>
                          <button
                            onClick={() => setSelectedAdmissionForChart(matchingAdmission)}
                            className="text-[11px] font-semibold text-slate-800 hover:text-slate-950 underline cursor-pointer"
                          >
                            Clinical Chart →
                          </button>
                          <button
                            onClick={() => {
                              setActiveAdmissionForTransfer(matchingAdmission);
                              setTransferModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                            title="Transfer Ward"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : isCleaning ? (
                        <button
                          onClick={() => updateBedStatus(bed.bedId, 'Available')}
                          className="w-full text-center text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-medium py-1 rounded transition-colors cursor-pointer"
                        >
                          Mark Sanitized
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setAdmitWard(bed.wardCode);
                            setAdmitBed(bed.bedNumber);
                            setAdmitModalOpen(true);
                          }}
                          className="w-full text-center text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1 rounded transition-colors cursor-pointer"
                        >
                          + Admit to {bed.bedNumber}
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
      {/* SUB-PAGE 3: PEDIATRIC & CHILD INPATIENT UNIT (WARD 03) */}
      {/* ======================================================== */}
      {activeSubTab === 'PEDIATRICS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Pediatric & Child Inpatient Care Unit (Ward 03)</span>
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Child Inpatient
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specialized pediatric care with bedside guardian rooming-in records and IV fluid maintenance.
                </p>
              </div>

              <button
                onClick={() => {
                  setAdmitWard('PEDIATRICS');
                  const firstAvail = beds.find((b) => b.wardCode === 'PEDIATRICS' && b.status === 'Available');
                  if (firstAvail) setAdmitBed(firstAvail.bedNumber);
                  setAdmittingDoc('Dr. Hana Tadesse, MD (Consultant Pediatrician)');
                  setAdmitModalOpen(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Admit Child Patient</span>
              </button>
            </div>

            {/* Active Child Inpatients & Fluid Calculator */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ipdAdmissions
                .filter((a) => a.wardCode === 'PEDIATRICS' && a.status === 'Active')
                .map((adm) => {
                  const pt = getPatientByMrn(adm.mrn);
                  const ageStr = pt ? getPatientAge(pt.dob) : 'Child';
                  return (
                    <div
                      key={adm.admissionId}
                      onClick={() => setSelectedAdmissionForChart(adm)}
                      className="bg-slate-50 hover:bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {adm.patientName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ageStr} • <span className="font-mono font-semibold text-slate-800">{adm.bedNumber}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                          Active
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-slate-200 text-[11px] space-y-1">
                        <div className="text-slate-700 line-clamp-2">
                          <span className="font-medium text-slate-500">Diagnosis:</span> {adm.diagnosis}
                        </div>
                        <div className="text-slate-600 flex items-center gap-1 pt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Guardian: <strong>{pt?.emergencyContactName || 'Mother Present'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                        <span>Admitted by {adm.admittingClinician}</span>
                        <span className="font-semibold text-slate-900 hover:underline">Chart →</span>
                      </div>
                    </div>
                  );
                })}

              {/* Pediatric Fluid Rate Tool */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-slate-600" />
                    Pediatric IV Fluid Tool (Holliday-Segar)
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">Formula</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600 font-medium">Child Weight:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="50"
                    value={pedWeight}
                    onChange={(e) => setPedWeight(parseFloat(e.target.value) || 10)}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold text-slate-900 bg-white"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                </div>
                {(() => {
                  const { dailyMl, hourlyMl } = calculatePediatricFluids(pedWeight);
                  return (
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-900 flex items-center justify-between font-medium">
                      <span className="text-slate-600">Maintenance:</span>
                      <span className="font-bold font-mono text-slate-900">{hourlyMl} mL/hr ({dailyMl} mL/day)</span>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-slate-500">
                  Standard maintenance rate for pediatric fluid replenishment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-PAGE 4: ACTIVE INPATIENTS & DAILY CARE PLANS */}
      {/* ======================================================== */}
      {activeSubTab === 'ACTIVE_INPATIENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Active Inpatient Roster & Clinical Directives
                </h2>
                <p className="text-xs text-slate-500">
                  Patients currently admitted across hospital wards.
                </p>
              </div>
              <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                {ipdAdmissions.filter((a) => a.status === 'Active').length} Active Inpatients
              </span>
            </div>

            <div className="space-y-2.5">
              {ipdAdmissions.filter((a) => a.status === 'Active').length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No active inpatients currently admitted.
                </div>
              ) : (
                ipdAdmissions
                  .filter((a) => a.status === 'Active')
                  .map((adm) => {
                    const isChild = isChildPatient(adm);
                    const pt = getPatientByMrn(adm.mrn);

                    return (
                      <div
                        key={adm.admissionId}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white text-xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900">{adm.patientName}</span>
                              <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                                {adm.bedNumber} ({adm.wardName})
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">MRN: {adm.mrn}</span>
                              {isChild && (
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                                  Pediatric
                                </span>
                              )}
                            </div>
                            <div className="text-slate-800 text-xs mt-1">
                              <span className="font-medium text-slate-500">Diagnosis:</span> {adm.diagnosis}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              Admitted: {adm.admissionDateTime} by {adm.admittingClinician}
                            </div>
                            {isChild && pt?.emergencyContactName && (
                              <div className="text-slate-600 text-[11px] mt-0.5">
                                Guardian: {pt.emergencyContactName} • {pt.emergencyContactPhone || pt.phone}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedAdmissionForChart(adm)}
                              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
                            >
                              <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                              <span>Clinical Chart</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveAdmissionForTransfer(adm);
                                setTransferModalOpen(true);
                              }}
                              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                              <span>Transfer</span>
                            </button>
                          </div>
                        </div>

                        {/* Transfer Audit Logs */}
                        {adm.transferLogs.length > 0 && (
                          <div className="text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Transfer History:</span>
                            </div>
                            {adm.transferLogs.map((log) => (
                              <div key={log.transferId} className="text-slate-600">
                                • {log.timestamp}: Moved from <em>{log.fromWard} ({log.fromBed})</em> to <em>{log.toWard} ({log.toBed})</em>. Reason: {log.reason}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-PAGE 5: 4-DEPARTMENT DISCHARGE CLEARANCES */}
      {/* ======================================================== */}
      {activeSubTab === 'DISCHARGE_CLEARANCE' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  4-Department Discharge Clearance Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Clinical, pharmacy, billing settlement, and nursing sign-off before bed release.
                </p>
              </div>
              <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                {ipdAdmissions.filter((a) => a.status === 'Active').length} Active Inpatients
              </span>
            </div>

            <div className="space-y-3">
              {ipdAdmissions.filter((a) => a.status === 'Active').map((adm) => {
                const isClearedAll =
                  adm.dischargeChecklistStatus.clinicalClearance &&
                  adm.dischargeChecklistStatus.pharmacyClearance &&
                  adm.dischargeChecklistStatus.billingClearance &&
                  adm.dischargeChecklistStatus.nursingClearance;

                return (
                  <div
                    key={adm.admissionId}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white text-xs space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{adm.patientName}</span>
                          <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                            {adm.bedNumber} ({adm.wardName})
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">MRN: {adm.mrn}</span>
                        </div>
                        <div className="text-slate-700 text-xs mt-1">
                          <span className="font-medium text-slate-500">Diagnosis:</span> {adm.diagnosis}
                        </div>
                      </div>

                      <div>
                        {isClearedAll ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-xs">
                            ✓ Ready for Discharge
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded text-xs">
                            Pending Clearances
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4-Department Checklist */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={adm.dischargeChecklistStatus.clinicalClearance}
                            onChange={(e) =>
                              updateDischargeChecklist(adm.admissionId, { clinicalClearance: e.target.checked })
                            }
                            className="rounded text-slate-900 focus:ring-slate-500"
                          />
                          <span className="font-medium text-[11px]">1. Clinical Doctor</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={adm.dischargeChecklistStatus.pharmacyClearance}
                            onChange={(e) =>
                              updateDischargeChecklist(adm.admissionId, { pharmacyClearance: e.target.checked })
                            }
                            className="rounded text-slate-900 focus:ring-slate-500"
                          />
                          <span className="font-medium text-[11px]">2. Pharmacy Return</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={adm.dischargeChecklistStatus.billingClearance}
                            onChange={(e) =>
                              updateDischargeChecklist(adm.admissionId, { billingClearance: e.target.checked })
                            }
                            className="rounded text-slate-900 focus:ring-slate-500"
                          />
                          <span className="font-medium text-[11px]">3. Cashier Billing</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={adm.dischargeChecklistStatus.nursingClearance}
                            onChange={(e) =>
                              updateDischargeChecklist(adm.admissionId, { nursingClearance: e.target.checked })
                            }
                            className="rounded text-slate-900 focus:ring-slate-500"
                          />
                          <span className="font-medium text-[11px]">4. Nursing Sign-off</span>
                        </label>
                      </div>

                      {/* Finalize Action */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500">
                          Admitted: {adm.admissionDateTime} by {adm.admittingClinician}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            id={`disp-${adm.admissionId}`}
                            defaultValue="Recovered / Home"
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                          >
                            <option value="Recovered / Home">Recovered / Discharged Home</option>
                            <option value="Referred to Tertiary">Referred to Tertiary Hospital</option>
                            <option value="Against Medical Advice">Discharged Against Medical Advice</option>
                          </select>

                          <button
                            onClick={() => {
                              const sel = (document.getElementById(`disp-${adm.admissionId}`) as HTMLSelectElement)?.value as any;
                              finalizeDischarge(adm.admissionId, sel || 'Recovered / Home');
                            }}
                            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1 rounded transition-colors cursor-pointer text-xs"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Finalize Discharge</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ALLOCATE BED FOR DOCTOR ORDER */}
      {/* ======================================================== */}
      {allocateModalOpen && orderToAllocate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl border border-slate-200 text-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bed className="w-4 h-4 text-slate-700" />
                Allocate Inpatient Bed
              </h3>
              <button
                onClick={() => setAllocateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">{orderToAllocate.patientName} ({orderToAllocate.mrn})</div>
              <div className="text-slate-600 text-[11px]"><span className="font-medium text-slate-500">Diagnosis:</span> {orderToAllocate.diagnosis}</div>
              <div className="text-slate-500 text-[11px]">
                Ordered by {orderToAllocate.orderingDoctor} ({orderToAllocate.sourceLocation})
              </div>
            </div>

            <form onSubmit={handleConfirmBedAllocation} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Ward *</label>
                <select
                  value={allocWard}
                  onChange={(e) => {
                    const newWard = e.target.value as WardCode;
                    setAllocWard(newWard);
                    const av = beds.filter((b) => b.wardCode === newWard && b.status === 'Available');
                    if (av.length > 0) setAllocBed(av[0].bedNumber);
                    else setAllocBed('');
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  {wardsList.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name} ({beds.filter((b) => b.wardCode === w.code && b.status === 'Available').length} Free)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Available Bed Number *</label>
                <select
                  value={allocBed}
                  onChange={(e) => setAllocBed(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white"
                  required
                >
                  {beds.filter((b) => b.wardCode === allocWard && b.status === 'Available').length === 0 ? (
                    <option value="">No beds currently available in this ward</option>
                  ) : (
                    beds
                      .filter((b) => b.wardCode === allocWard && b.status === 'Available')
                      .map((b) => (
                        <option key={b.bedId} value={b.bedNumber}>
                          {b.bedNumber} {b.oxygenPortAvailable ? '(Oxygen Port Active)' : ''}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAllocateModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!allocBed}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded text-xs shadow-xs cursor-pointer"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PLACE DIRECT DOCTOR ADMISSION ORDER */}
      {/* ======================================================== */}
      {newDoctorOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-xl border border-slate-200 text-xs space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-slate-700" />
                New Doctor Bed Admission Order
              </h3>
              <button
                onClick={() => setNewDoctorOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoctorOrder} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={orderMrn}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setOrderMrn(chosen);
                    const pt = getPatientByMrn(chosen);
                    if (pt) {
                      const age = parseInt(getPatientAge(pt.dob), 10);
                      if (!isNaN(age) && age < 15) {
                        setOrderWard('PEDIATRICS');
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.mrn} value={p.mrn}>
                      {p.firstName} {p.lastName} ({p.mrn}) — {getPatientAge(p.dob)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Source Department *</label>
                  <select
                    value={orderSource}
                    onChange={(e) => setOrderSource(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="OPD Clinic">OPD Clinic</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Surgical OT">Surgical OT</option>
                    <option value="Specialist Clinic">Specialist Clinic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Source Location *</label>
                  <input
                    type="text"
                    value={orderSourceLoc}
                    onChange={(e) => setOrderSourceLoc(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Recommended Ward *</label>
                  <select
                    value={orderWard}
                    onChange={(e) => setOrderWard(e.target.value as WardCode)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    {wardsList.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Clinical Priority *</label>
                  <select
                    value={orderPriority}
                    onChange={(e) => setOrderPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency / Stat">Emergency / Stat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ordering Doctor *</label>
                <input
                  type="text"
                  value={orderDoctor}
                  onChange={(e) => setOrderDoctor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Admission Diagnosis & Directives *</label>
                <textarea
                  value={orderDiag}
                  onChange={(e) => setOrderDiag(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Doctor Notes & Instructions</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="orderO2"
                  checked={orderOxygen}
                  onChange={(e) => setOrderOxygen(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-500"
                />
                <label htmlFor="orderO2" className="text-slate-700 font-medium text-xs cursor-pointer">
                  Requires Active Bedside Oxygen Port
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewDoctorOrderModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs shadow-xs cursor-pointer"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: QUICK ADMIT MODAL */}
      {/* ======================================================== */}
      {admitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-xl border border-slate-200 text-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bed className="w-4 h-4 text-slate-700" />
                Direct Inpatient Admission
              </h3>
              <button onClick={() => setAdmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={admitMrn}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setAdmitMrn(chosen);
                    const pt = getPatientByMrn(chosen);
                    if (pt) {
                      const age = parseInt(getPatientAge(pt.dob), 10);
                      if (!isNaN(age) && age < 15) {
                        setAdmitWard('PEDIATRICS');
                        const pBed = beds.find((b) => b.wardCode === 'PEDIATRICS' && b.status === 'Available');
                        if (pBed) setAdmitBed(pBed.bedNumber);
                        setAdmittingDoc('Dr. Hana Tadesse, MD (Consultant Pediatrician)');
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.mrn} value={p.mrn}>
                      {p.firstName} {p.lastName} ({p.mrn}) — {getPatientAge(p.dob)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Ward *</label>
                  <select
                    value={admitWard}
                    onChange={(e) => {
                      const newWard = e.target.value as WardCode;
                      setAdmitWard(newWard);
                      const avail = beds.filter((b) => b.wardCode === newWard && b.status === 'Available');
                      if (avail.length > 0) setAdmitBed(avail[0].bedNumber);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    {wardsList.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Available Bed *</label>
                  <select
                    value={admitBed}
                    onChange={(e) => setAdmitBed(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white"
                    required
                  >
                    {beds.filter((b) => b.wardCode === admitWard && b.status === 'Available').length === 0 ? (
                      <option value="">No beds currently available in {admitWard}</option>
                    ) : (
                      beds
                        .filter((b) => b.wardCode === admitWard && b.status === 'Available')
                        .map((b) => (
                          <option key={b.bedId} value={b.bedNumber}>
                            {b.bedNumber} {b.oxygenPortAvailable ? '(O2 Port)' : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Admitting Clinician *</label>
                <input
                  type="text"
                  value={admittingDoc}
                  onChange={(e) => setAdmittingDoc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Diagnosis & Directive *</label>
                <textarea
                  value={admitDiagnosis}
                  onChange={(e) => setAdmitDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdmitModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!admitBed}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded text-xs cursor-pointer shadow-xs"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PATIENT CLINICAL CHART MODAL */}
      {/* ======================================================== */}
      {selectedAdmissionForChart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-xl w-full shadow-xl border border-slate-200 text-xs space-y-3.5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Inpatient Clinical Chart & Care Plan
                </h3>
                <div className="text-xs text-slate-500">
                  {selectedAdmissionForChart.patientName} • MRN: {selectedAdmissionForChart.mrn} • Bed: {selectedAdmissionForChart.bedNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedAdmissionForChart(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Demographics Summary */}
            {(() => {
              const pt = getPatientByMrn(selectedAdmissionForChart.mrn);
              const ageStr = pt ? getPatientAge(pt.dob) : 'Adult';
              const isPed = selectedAdmissionForChart.wardCode === 'PEDIATRICS';

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-slate-500 text-[11px]">Patient Details</div>
                    <div className="font-semibold text-slate-900 text-xs mt-0.5">{pt?.firstName} {pt?.lastName} ({ageStr}, {pt?.gender})</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">Payer: <span className="font-medium text-slate-800">{pt?.payerClass}</span></div>
                    <div className="text-slate-600 text-[11px]">Blood: <span className="font-semibold text-slate-800">{pt?.bloodGroup || 'O+'}</span></div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">{isPed ? 'Bedside Guardian' : 'Emergency Contact'}</div>
                    <div className="font-semibold text-slate-900 text-xs mt-0.5">{pt?.emergencyContactName || 'None Recorded'}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Phone: {pt?.emergencyContactPhone || pt?.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Clinical Diagnosis & Notes */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                <span>Primary Inpatient Diagnosis</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 font-medium">
                {selectedAdmissionForChart.diagnosis}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-800 text-[11px]">Physician Orders:</div>
                <p className="leading-relaxed">{selectedAdmissionForChart.notes || 'Routine ward monitoring, vitals Q4H, medications as charted.'}</p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Admitting Clinician: {selectedAdmissionForChart.admittingClinician}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAdmissionForTransfer(selectedAdmissionForChart);
                    setSelectedAdmissionForChart(null);
                    setTransferModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs cursor-pointer"
                >
                  Transfer Ward
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdmissionForChart(null)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: WARD TRANSFER MODAL */}
      {/* ======================================================== */}
      {transferModalOpen && activeAdmissionForTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-slate-700" />
                Inter-Ward Patient Bed Transfer
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-900">{activeAdmissionForTransfer.patientName}</div>
                <div className="text-slate-500 text-[11px]">
                  Current: {activeAdmissionForTransfer.wardName} - Bed {activeAdmissionForTransfer.bedNumber}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Ward *</label>
                <select
                  value={targetWard}
                  onChange={(e) => {
                    const newWard = e.target.value as WardCode;
                    setTargetWard(newWard);
                    const avail = beds.filter((b) => b.wardCode === newWard && b.status === 'Available');
                    if (avail.length > 0) setTargetBed(avail[0].bedNumber);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  {wardsList.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Available Bed *</label>
                <select
                  value={targetBed}
                  onChange={(e) => setTargetBed(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white"
                  required
                >
                  {beds.filter((b) => b.wardCode === targetWard && b.status === 'Available').length === 0 ? (
                    <option value="">No beds currently available in {targetWard}</option>
                  ) : (
                    beds
                      .filter((b) => b.wardCode === targetWard && b.status === 'Available')
                      .map((b) => (
                        <option key={b.bedId} value={b.bedNumber}>
                          {b.bedNumber} {b.oxygenPortAvailable ? '(Oxygen Port)' : ''}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Transfer Reason *</label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetBed}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded text-xs cursor-pointer shadow-xs"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: DOCTOR ADMISSION ORDER DETAIL PAGE / MODAL */}
      {/* ======================================================== */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-xl w-full shadow-xl border border-slate-200 text-xs space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Doctor Bed Admission Order Details
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      selectedOrderForDetail.clinicalPriority === 'Emergency / Stat'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : selectedOrderForDetail.clinicalPriority === 'Urgent'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Priority: {selectedOrderForDetail.clinicalPriority}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Order ID: <span className="font-mono font-medium text-slate-700">{selectedOrderForDetail.orderId}</span> • Placed at {selectedOrderForDetail.orderTime}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Demographics & Profile Summary */}
            {(() => {
              const pt = getPatientByMrn(selectedOrderForDetail.mrn);
              const ageStr = pt ? getPatientAge(pt.dob) : selectedOrderForDetail.ageGender || 'Adult';
              const isChild = selectedOrderForDetail.recommendedWard === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt.dob), 10) < 15);
              const wardObj = wardsList.find((w) => w.code === selectedOrderForDetail.recommendedWard);

              return (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Patient Information</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {selectedOrderForDetail.patientName}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        MRN: {selectedOrderForDetail.mrn} • {ageStr}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Payer: <strong className="text-slate-800">{pt?.payerClass || 'Standard Private'}</strong> • Blood: <strong className="text-slate-800">{pt?.bloodGroup || 'O+'}</strong>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {isChild ? 'Bedside Guardian (Rooming-in)' : 'Emergency Contact'}
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {selectedOrderForDetail.guardianPresent || pt?.emergencyContactName || 'Family Present'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{pt?.emergencyContactPhone || pt?.phone || 'Contact on file'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Status: <strong className={selectedOrderForDetail.status === 'Pending Bed Allocation' ? 'text-amber-700' : 'text-emerald-700'}>{selectedOrderForDetail.status}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                      <span>Primary Admission Diagnosis</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 font-medium leading-relaxed">
                      {selectedOrderForDetail.diagnosis}
                    </div>
                  </div>

                  {/* Doctor Clinical Directives & Admission Notes */}
                  {selectedOrderForDetail.notes && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Physician Directives & Treatment Instructions</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedOrderForDetail.notes}
                      </div>
                    </div>
                  )}

                  {/* Placement & Equipment Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500 font-medium">Recommended Ward</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {wardObj?.name || selectedOrderForDetail.recommendedWard}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Source: {selectedOrderForDetail.sourceLocation}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500 font-medium">Ordering Clinician & O2 Requirement</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {selectedOrderForDetail.orderingDoctor}
                      </div>
                      <div className="mt-0.5">
                        {selectedOrderForDetail.requiresOxygen ? (
                          <span className="text-blue-700 font-semibold">Active Bedside Oxygen Port Required</span>
                        ) : (
                          <span className="text-slate-500">Standard Bed (No Dedicated O2 line needed)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                {selectedOrderForDetail.status === 'Pending Bed Allocation' && (
                  <button
                    type="button"
                    onClick={() => {
                      cancelAdmissionOrder(selectedOrderForDetail.orderId, 'Cancelled from order details view');
                      setSelectedOrderForDetail(null);
                    }}
                    className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>

                {selectedOrderForDetail.status === 'Pending Bed Allocation' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const order = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleOpenAllocateModal(order);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>Allocate Bed Now</span>
                  </button>
                ) : selectedOrderForDetail.assignedBedNumber ? (
                  <button
                    type="button"
                    onClick={() => {
                      const matchingAdm = ipdAdmissions.find(
                        (a) => a.bedNumber === selectedOrderForDetail.assignedBedNumber && a.status === 'Active'
                      );
                      setSelectedOrderForDetail(null);
                      if (matchingAdm) setSelectedAdmissionForChart(matchingAdm);
                      else setActiveSubTab('ACTIVE_INPATIENTS');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Patient Chart</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
