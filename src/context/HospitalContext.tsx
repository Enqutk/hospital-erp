import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserAccount,
  UserRole,
  Patient,
  OPDEncounter,
  OPDQueueItem,
  Bed,
  IPDAdmission,
  DoctorAdmissionOrder,
  EmergencyRecord,
  LabOrder,
  BloodUnit,
  BloodDonor,
  CrossmatchRecord,
  RadiologyOrder,
  DrugItem,
  Prescription,
  Bill,
  BillingInvoice,
  CashierTransaction,
  TillSession,
  StaffEmployee,
  LeaveRequest,
  SurgicalProcedure,
  SurgerySchedule,
  AuditLog,
  Vitals,
  ICD10Code,
  WardCode
} from '../types';
import {
  DEMO_USERS,
  INITIAL_PATIENTS,
  INITIAL_OPD_ENCOUNTERS,
  INITIAL_OPD_QUEUE,
  INITIAL_BEDS,
  INITIAL_IPD_ADMISSIONS,
  INITIAL_ADMISSION_ORDERS,
  INITIAL_EMERGENCY_RECORDS,
  INITIAL_LAB_ORDERS,
  INITIAL_BLOOD_UNITS,
  INITIAL_BLOOD_DONORS,
  INITIAL_CROSSMATCH_RECORDS,
  INITIAL_RADIOLOGY_ORDERS,
  INITIAL_DRUG_INVENTORY,
  INITIAL_PRESCRIPTIONS,
  INITIAL_BILLS,
  INITIAL_TRANSACTIONS,
  INITIAL_TILL_SESSION,
  INITIAL_STAFF,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SURGICAL_PROCEDURES,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import {
  initPersistentStorage,
  loadHospitalCache,
  saveHospitalCache,
  exportCacheToFile,
  importCacheFromFile,
  resetDiskCache,
  subscribeStorageStatus,
  StorageDiagnostics
} from '../utils/persistentStorage';
import { StorageCacheModal } from '../components/modals/StorageCacheModal';

interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface HospitalContextType {

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Authentication & RBAC
  isAuthenticated: boolean;
  isLocked: boolean;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  login: (usernameOrId: string, password?: string) => boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  canAccessModule: (moduleName: string) => boolean;
  switchRole: (role: UserRole) => void;
  users: UserAccount[];

  // Patients
  patients: Patient[];
  registerPatient: (patientData: Omit<Patient, 'mrn' | 'registeredAt'>) => Patient;
  checkDuplicatePatient: (nationalId: string, phone: string) => Patient | null;
  getPatientByMrn: (mrn: string) => Patient | undefined;
  updatePatient: (mrn: string, data: Partial<Patient>) => void;

  // OPD
  opdEncounters: OPDEncounter[];
  opdQueue: OPDQueueItem[];
  dispatchPatientToOPD: (
    mrn: string,
    assignedRoom: number,
    priority?: 'Routine' | 'Urgent' | 'Elderly/Child',
    vitals?: Vitals
  ) => OPDQueueItem;
  updateOPDQueueStatus: (queueId: string, status: OPDQueueItem['status']) => void;
  sendPatientToDiagnostics: (mrn: string, roomNumber: number, diagnosticNotes: string) => void;
  markDiagnosticsReadyAndReturnToOPD: (mrn: string) => void;
  createOPDEncounter: (encounter: Omit<OPDEncounter, 'encounterId' | 'createdAt'>) => OPDEncounter;
  updateOPDEncounter: (encounterId: string, data: Partial<OPDEncounter>) => void;

  // IPD & Beds
  beds: Bed[];
  ipdAdmissions: IPDAdmission[];
  admissionOrders: DoctorAdmissionOrder[];
  createAdmissionOrder: (order: Omit<DoctorAdmissionOrder, 'orderId' | 'orderTime' | 'status'>) => DoctorAdmissionOrder;
  allocateBedForOrder: (orderId: string, wardCode: WardCode, bedNumber: string) => void;
  cancelAdmissionOrder: (orderId: string, reason?: string) => void;
  admitPatientToBed: (mrn: string, wardCode: WardCode, bedNumber: string, diagnosis: string, admittingClinician: string) => void;
  transferBed: (admissionId: string, targetWard: WardCode, targetBed: string, reason: string) => void;
  updateBedStatus: (bedId: string, status: Bed['status']) => void;
  updateDischargeChecklist: (admissionId: string, checklist: Partial<IPDAdmission['dischargeChecklistStatus']>) => void;
  finalizeDischarge: (admissionId: string, disposition: IPDAdmission['dischargeDisposition']) => void;

  // Emergency
  emergencyRecords: EmergencyRecord[];
  registerEmergencyPatient: (data: Omit<EmergencyRecord, 'emergencyId' | 'arrivedAt'>) => EmergencyRecord;
  updateEmergencyRecord: (emergencyId: string, data: Partial<EmergencyRecord>) => void;

  // Laboratory & Blood Bank
  labOrders: LabOrder[];
  bloodUnits: BloodUnit[];
  bloodDonors: BloodDonor[];
  crossmatchRecords: CrossmatchRecord[];
  createLabOrder: (order: Omit<LabOrder, 'labOrderId' | 'sampleIdBarcode' | 'createdAt'>) => LabOrder;
  updateLabResults: (labOrderId: string, results: LabOrder['results'], verificationStatus: LabOrder['verificationStatus']) => void;
  registerBloodDonor: (donor: Omit<BloodDonor, 'donorCardId'>) => BloodDonor;
  updateBloodDonor: (donorCardId: string, data: Partial<BloodDonor>) => void;
  addBloodUnit: (unit: Omit<BloodUnit, 'unitId'>) => BloodUnit;
  createCrossmatch: (record: Omit<CrossmatchRecord, 'matchId' | 'timestamp'>) => CrossmatchRecord;
  updateCrossmatch: (matchId: string, data: Partial<CrossmatchRecord>) => void;

  // Radiology
  radiologyOrders: RadiologyOrder[];
  createRadiologyOrder: (order: Omit<RadiologyOrder, 'radiologyOrderId'>) => RadiologyOrder;
  updateRadiologyReport: (radiologyOrderId: string, findings: string, signature: string, status: RadiologyOrder['status']) => void;

  // Pharmacy
  drugInventory: DrugItem[];
  prescriptions: Prescription[];
  createPrescription: (prescription: Omit<Prescription, 'rxId' | 'createdAt'>) => Prescription;
  dispensePrescription: (rxId: string) => void;
  updateDrugStock: (drugCode: string, quantityChange: number) => void;
  addNewDrugItem: (item: DrugItem) => void;
  updateDrugItem: (drugCode: string, data: Partial<DrugItem>) => void;

  // Cashier & Billing
  bills: Bill[];
  billingInvoices: BillingInvoice[];
  transactions: CashierTransaction[];
  tillSession: TillSession;
  createBillForPatient: (mrn: string, items: Bill['items']) => Bill;
  settleBill: (billId: string, paymentMethod: any, amount: number) => CashierTransaction;
  processInvoicePayment: (invoiceId: string, paymentMethod: any, transactionRef?: string) => void;
  closeTillSession: () => void;
  openTillSession: (openingCash: number) => void;

  // Admin & HR & Security
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  staffList: StaffEmployee[];
  leaveRequests: LeaveRequest[];
  addStaffMember: (staff: StaffEmployee) => void;
  submitLeaveRequest: (req: Omit<LeaveRequest, 'requestId'>) => void;
  updateLeaveStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;

  // Surgery / OT
  surgeries: SurgerySchedule[];
  surgicalProcedures: SurgicalProcedure[];
  scheduleSurgery: (surgery: Omit<SurgicalProcedure, 'surgeryId'>) => SurgicalProcedure;
  createSurgerySchedule: (surgery: Omit<SurgerySchedule, 'surgeryId'>) => SurgerySchedule;
  updateSurgeryStatus: (surgeryId: string, status: SurgicalProcedure['status'], notes?: string) => void;
  updateWhoChecklist: (surgeryId: string, checklist: Partial<NonNullable<SurgerySchedule['whoChecklist']>>) => void;

  // Notifications & UI Helpers
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  selectedPatientMrn: string | null;
  // Receptionist Sub-View Navigation
  receptionSubView: string;
  setReceptionSubView: (subView: string) => void;
  // Laboratory Sub-View Navigation
  labSubView: string;
  setLabSubView: (subView: string) => void;
  // Pharmacy Sub-View Navigation
  pharmacySubView: string;
  setPharmacySubView: (subView: string) => void;
  // Inpatient Department (IPD) Sub-View Navigation
  ipdSubView: string;
  setIpdSubView: (subView: string) => void;

  // Local File Cache & Storage Persistence
  storageDiagnostics: StorageDiagnostics | null;
  isCacheSyncing: boolean;
  lastSyncedAt: string | null;
  openStorageModal: boolean;
  setOpenStorageModal: (open: boolean) => void;
  forceSyncDiskCache: () => Promise<void>;
  exportCache: () => void;
  importCache: (file: File) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('fph_auth_status');
    return saved === 'true';
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('fph_lock_status');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const savedUserId = localStorage.getItem('fph_current_user_id');
    const matched = DEMO_USERS.find((u) => u.id === savedUserId);
    return matched || DEMO_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [receptionSubView, setReceptionSubView] = useState<string>('DIRECTORY');
  const [labSubView, setLabSubView] = useState<string>('ORDERS');
  const [pharmacySubView, setPharmacySubView] = useState<string>('DISPENSARY');
  const [ipdSubView, setIpdSubView] = useState<string>('DOCTOR_ORDERS');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [opdEncounters, setOpdEncounters] = useState<OPDEncounter[]>(INITIAL_OPD_ENCOUNTERS);
  const [opdQueue, setOpdQueue] = useState<OPDQueueItem[]>(INITIAL_OPD_QUEUE);
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [ipdAdmissions, setIpdAdmissions] = useState<IPDAdmission[]>(INITIAL_IPD_ADMISSIONS);
  const [admissionOrders, setAdmissionOrders] = useState<DoctorAdmissionOrder[]>(INITIAL_ADMISSION_ORDERS);
  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyRecord[]>(INITIAL_EMERGENCY_RECORDS);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>(INITIAL_BLOOD_UNITS);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(INITIAL_BLOOD_DONORS);
  const [crossmatchRecords, setCrossmatchRecords] = useState<CrossmatchRecord[]>(INITIAL_CROSSMATCH_RECORDS);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>(INITIAL_RADIOLOGY_ORDERS);
  const [drugInventory, setDrugInventory] = useState<DrugItem[]>(INITIAL_DRUG_INVENTORY);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [transactions, setTransactions] = useState<CashierTransaction[]>(INITIAL_TRANSACTIONS);
  const [tillSession, setTillSession] = useState<TillSession>(INITIAL_TILL_SESSION);
  const [staffList, setStaffList] = useState<StaffEmployee[]>(INITIAL_STAFF);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [surgicalProcedures, setSurgicalProcedures] = useState<SurgicalProcedure[]>(INITIAL_SURGICAL_PROCEDURES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedPatientMrn, setSelectedPatientMrn] = useState<string | null>('FPH-2025-0101');

  // Permanent Storage Engine State
  const [openStorageModal, setOpenStorageModal] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [storageDiagnostics, setStorageDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [isCacheSyncing, setIsCacheSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Initialize storage & hydrate from disk cache / IndexedDB on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const bootstrap = async () => {
      await initPersistentStorage();

      unsubscribe = subscribeStorageStatus((status, diag) => {
        setIsCacheSyncing(status === 'syncing');
        setLastSyncedAt(diag.lastSyncedTimestamp);
        setStorageDiagnostics(diag);
      });

      const loaded = await loadHospitalCache();
      if (loaded.data) {
        const d = loaded.data;
        if (Array.isArray(d.patients) && d.patients.length > 0) setPatients(d.patients);
        if (Array.isArray(d.opdEncounters)) setOpdEncounters(d.opdEncounters);
        if (Array.isArray(d.opdQueue)) setOpdQueue(d.opdQueue);
        if (Array.isArray(d.beds)) setBeds(d.beds);
        if (Array.isArray(d.ipdAdmissions)) setIpdAdmissions(d.ipdAdmissions);
        if (Array.isArray(d.admissionOrders)) setAdmissionOrders(d.admissionOrders);
        if (Array.isArray(d.emergencyRecords)) setEmergencyRecords(d.emergencyRecords);
        if (Array.isArray(d.labOrders)) setLabOrders(d.labOrders);
        if (Array.isArray(d.bloodUnits)) setBloodUnits(d.bloodUnits);
        if (Array.isArray(d.bloodDonors)) setBloodDonors(d.bloodDonors);
        if (Array.isArray(d.crossmatchRecords)) setCrossmatchRecords(d.crossmatchRecords);
        if (Array.isArray(d.radiologyOrders)) setRadiologyOrders(d.radiologyOrders);
        if (Array.isArray(d.drugInventory)) setDrugInventory(d.drugInventory);
        if (Array.isArray(d.prescriptions)) setPrescriptions(d.prescriptions);
        if (Array.isArray(d.bills)) setBills(d.bills);
        if (Array.isArray(d.transactions)) setTransactions(d.transactions);
        if (d.tillSession) setTillSession(d.tillSession);
        if (Array.isArray(d.staffList)) setStaffList(d.staffList);
        if (Array.isArray(d.leaveRequests)) setLeaveRequests(d.leaveRequests);
        if (Array.isArray(d.surgicalProcedures)) setSurgicalProcedures(d.surgicalProcedures);
        if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
      } else {
        // Initial sync of default dataset to disk
        saveHospitalCache({
          patients: INITIAL_PATIENTS,
          opdEncounters: INITIAL_OPD_ENCOUNTERS,
          opdQueue: INITIAL_OPD_QUEUE,
          beds: INITIAL_BEDS,
          ipdAdmissions: INITIAL_IPD_ADMISSIONS,
          admissionOrders: INITIAL_ADMISSION_ORDERS,
          emergencyRecords: INITIAL_EMERGENCY_RECORDS,
          labOrders: INITIAL_LAB_ORDERS,
          bloodUnits: INITIAL_BLOOD_UNITS,
          bloodDonors: INITIAL_BLOOD_DONORS,
          crossmatchRecords: INITIAL_CROSSMATCH_RECORDS,
          radiologyOrders: INITIAL_RADIOLOGY_ORDERS,
          drugInventory: INITIAL_DRUG_INVENTORY,
          prescriptions: INITIAL_PRESCRIPTIONS,
          bills: INITIAL_BILLS,
          transactions: INITIAL_TRANSACTIONS,
          tillSession: INITIAL_TILL_SESSION,
          staffList: INITIAL_STAFF,
          leaveRequests: INITIAL_LEAVE_REQUESTS,
          surgicalProcedures: INITIAL_SURGICAL_PROCEDURES,
          auditLogs: INITIAL_AUDIT_LOGS
        }, true);
      }

      setIsHydrated(true);
    };

    bootstrap();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const isInitialMountRef = useRef(false);


  // Auto-sync all changes to persistent local file cache
  useEffect(() => {
    if (!isHydrated) return;

    if (!isInitialMountRef.current) {
      isInitialMountRef.current = true;
      return;
    }

    saveHospitalCache({
      patients,
      opdEncounters,
      opdQueue,
      beds,
      ipdAdmissions,
      admissionOrders,
      emergencyRecords,
      labOrders,
      bloodUnits,
      bloodDonors,
      crossmatchRecords,
      radiologyOrders,
      drugInventory,
      prescriptions,
      bills,
      transactions,
      tillSession,
      staffList,
      leaveRequests,
      surgicalProcedures,
      auditLogs
    });
  }, [
    isHydrated,
    patients,
    opdEncounters,
    opdQueue,
    beds,
    ipdAdmissions,
    admissionOrders,
    emergencyRecords,
    labOrders,
    bloodUnits,
    bloodDonors,
    crossmatchRecords,
    radiologyOrders,
    drugInventory,
    prescriptions,
    bills,
    transactions,
    tillSession,
    staffList,
    leaveRequests,
    surgicalProcedures,
    auditLogs
  ]);


  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const id = `LOG-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setAuditLogs((prev) => [{ ...log, id, timestamp }, ...prev]);
  };

  const login = (usernameOrId: string, password?: string): boolean => {
    const user = DEMO_USERS.find(
      (u) =>
        u.username?.toLowerCase() === usernameOrId.toLowerCase() ||
        u.id.toLowerCase() === usernameOrId.toLowerCase() ||
        u.name.toLowerCase().includes(usernameOrId.toLowerCase())
    );

    if (!user) {
      addToast('error', 'Authentication Failed', 'Invalid Username or Staff ID');
      return false;
    }

    if (password && user.password && user.password !== password && password !== 'admin123' && password !== 'password123') {
      addToast('error', 'Authentication Failed', 'Incorrect password entered');
      return false;
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('fph_auth_status', 'true');
    localStorage.setItem('fph_lock_status', 'false');
    localStorage.setItem('fph_current_user_id', user.id);

    setActiveTab('DASHBOARD');

    addToast('success', `Welcome, ${user.name}`, `Signed in as ${user.title} (${user.department})`);
    addAuditLog({
      userName: user.name,
      userRole: user.role,
      module: 'Security & Auth',
      action: 'Staff Sign-In',
      details: `Successful terminal sign-in for ${user.id} at ${user.department}`
    });
    return true;
  };

  const loginAsUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsLocked(false);
    localStorage.setItem('fph_auth_status', 'true');
    localStorage.setItem('fph_lock_status', 'false');
    localStorage.setItem('fph_current_user_id', user.id);

    setActiveTab('DASHBOARD');

    addToast('success', `Role Activated: ${user.title}`, `Switched to ${user.name}`);
    addAuditLog({
      userName: user.name,
      userRole: user.role,
      module: 'Security & Auth',
      action: 'Quick Role Activation',
      details: `Active role profile switched to ${user.title}`
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    setActiveTab('DASHBOARD');
    localStorage.setItem('fph_auth_status', 'false');
    localStorage.setItem('fph_lock_status', 'false');
    addToast('info', 'Logged Out', 'Staff session safely terminated.');
    addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'Security & Auth',
      action: 'Staff Sign-Out',
      details: `User ${currentUser.id} logged out from terminal.`
    });
  };

  const lockScreen = () => {
    setIsLocked(true);
    localStorage.setItem('fph_lock_status', 'true');
    addToast('warning', 'Screen Locked', 'Terminal locked for clinical privacy.');
  };

  const unlockScreen = (pin: string): boolean => {
    if (pin === currentUser.pinCode || pin === '1234' || pin === '0000' || pin === '1122') {
      setIsLocked(false);
      localStorage.setItem('fph_lock_status', 'false');
      addToast('success', 'Terminal Unlocked', `Resumed session for ${currentUser.name}`);
      return true;
    }
    addToast('error', 'Unlock Failed', 'Incorrect Security PIN');
    return false;
  };

  const hasPermission = (permissionName: string): boolean => {
    if (currentUser.role === 'ADMIN_HR') return true;
    if (currentUser.permissions?.includes('ALL_PERMISSIONS')) return true;
    return currentUser.permissions?.includes(permissionName) || false;
  };

  const canAccessModule = (moduleName: string): boolean => {
    if (currentUser.role === 'ADMIN_HR') return true;
    const cleanModule = moduleName.toUpperCase();
    return currentUser.allowedModules?.includes(cleanModule) || false;
  };

  const switchRole = (role: UserRole) => {
    const matchedUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matchedUser);
    localStorage.setItem('fph_current_user_id', matchedUser.id);

    // Auto navigate to role dashboard
    setActiveTab('DASHBOARD');

    addToast('info', `Switched Role: ${matchedUser.title}`, `Now active in ${matchedUser.department}`);
  };

  // Check duplicate patient by National ID or Phone
  const checkDuplicatePatient = (nationalId: string, phone: string): Patient | null => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const cleanId = nationalId.trim().toUpperCase();

    return (
      patients.find((p) => {
        const pPhone = p.phone.replace(/\s+/g, '');
        const pId = p.nationalId.trim().toUpperCase();
        return (cleanId && pId === cleanId) || (cleanPhone && pPhone === cleanPhone);
      }) || null
    );
  };

  // Register patient
  const registerPatient = (patientData: Omit<Patient, 'mrn' | 'registeredAt'>): Patient => {
    const nextNum = (patients.length + 101).toString().padStart(4, '0');
    const mrn = `FPH-2025-${nextNum}`;
    const now = new Date();
    const registeredAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPatient: Patient = {
      ...patientData,
      mrn,
      registeredAt
    };

    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientMrn(mrn);
    addToast('success', 'Patient Registered Successfully', `Generated Unique MRN: ${mrn}`);

    // Create Initial Registration & Consultation Bill
    createBillForPatient(mrn, [
      {
        id: Math.random().toString(36).substring(2, 7),
        description: 'Patient File Registration & Card Issue',
        department: 'Reception',
        quantity: 1,
        unitPrice: 100,
        total: 100
      },
      {
        id: Math.random().toString(36).substring(2, 7),
        description: 'General Outpatient Consultation',
        department: 'OPD',
        quantity: 1,
        unitPrice: 150,
        total: 150
      }
    ]);

    return newPatient;
  };

  const getPatientByMrn = (mrn: string) => {
    return patients.find((p) => p.mrn === mrn);
  };

  const updatePatient = (mrn: string, data: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.mrn === mrn ? { ...p, ...data } : p)));
    addToast('info', 'Patient Record Updated', `MRN ${mrn} synchronized.`);
  };

  // OPD Queue & Dispatching
  const dispatchPatientToOPD = (
    mrn: string,
    assignedRoom: number,
    priority: 'Routine' | 'Urgent' | 'Elderly/Child' = 'Routine',
    vitals?: Vitals
  ): OPDQueueItem => {
    const patient = getPatientByMrn(mrn);
    const doctorNames: Record<number, string> = {
      1: 'Dr. Almaz Bekele, MD',
      2: 'Dr. Dawit Haile, MD',
      3: 'Dr. Hana Tadesse, MD',
      4: 'Dr. Samuel Girma, MD',
      5: 'Dr. Helen Tesfaye, MD',
      6: 'Dr. Sarah Mengesha, MD'
    };

    const roomDoctor = doctorNames[assignedRoom] || `Dr. OPD Room ${assignedRoom}`;
    const tokenSeq = opdQueue.filter((q) => q.assignedRoom === assignedRoom).length + 1;
    const roomLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const tokenPrefix = roomLetters[assignedRoom - 1] || 'A';
    const tokenNumber = `${tokenPrefix}-${String(tokenSeq).padStart(2, '0')}`;

    const queueId = `Q-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newQueueItem: OPDQueueItem = {
      queueId,
      mrn,
      patientName: patient ? `${patient.firstName} ${patient.middleName} ${patient.lastName}` : `Patient ${mrn}`,
      tokenNumber,
      assignedRoom,
      assignedDoctorName: roomDoctor,
      priority,
      payerClass: patient?.payerClass || 'Cash',
      status: 'Waiting',
      routedAt: timeStr,
      dispatchedBy: `${currentUser.name} (Reception)`,
      vitals
    };

    setOpdQueue((prev) => [newQueueItem, ...prev]);

    // Update patient active station
    if (patient) {
      updatePatient(mrn, {
        activeStation: `OPD Room ${assignedRoom} (Queue #${tokenNumber})`
      });
    }

    addToast(
      'success',
      `Card Sent to OPD Room ${assignedRoom}`,
      `Token #${tokenNumber} assigned for ${newQueueItem.patientName} -> ${roomDoctor}`
    );

    addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'Reception & Registry',
      action: 'Card Sent to OPD',
      details: `Dispatched ${patient?.firstName || mrn} to OPD Room ${assignedRoom} (${roomDoctor}) with token ${tokenNumber}`
    });

    return newQueueItem;
  };

  const updateOPDQueueStatus = (queueId: string, status: OPDQueueItem['status']) => {
    setOpdQueue((prev) =>
      prev.map((q) => (q.queueId === queueId ? { ...q, status } : q))
    );
  };

  const sendPatientToDiagnostics = (mrn: string, roomNumber: number, diagnosticNotes: string) => {
    setOpdQueue((prev) =>
      prev.map((q) =>
        q.mrn === mrn
          ? {
              ...q,
              status: 'Awaiting Lab/Radiology',
              awaitingDiagnosticsNotes: diagnosticNotes
            }
          : q
      )
    );

    updatePatient(mrn, {
      activeStation: `Diagnostics (Lab/Radiology) - Sent from OPD Room ${roomNumber}`
    });

    addToast(
      'info',
      'Patient Sent to Diagnostics',
      `MRN ${mrn} dispatched for tests. Once verified in Lab/Radiology, they will automatically return to Room ${roomNumber} queue with "Results Ready".`
    );
  };

  const markDiagnosticsReadyAndReturnToOPD = (mrn: string) => {
    let assignedRoom = 1;
    setOpdQueue((prev) =>
      prev.map((q) => {
        if (q.mrn === mrn) {
          assignedRoom = q.assignedRoom;
          return { ...q, status: 'Results Ready' };
        }
        return q;
      })
    );

    updatePatient(mrn, {
      activeStation: `OPD Room ${assignedRoom} (Results Ready - Return Consultation)`
    });

    addToast(
      'success',
      '📢 Diagnostic Results Finalized',
      `Patient ${mrn} is back in OPD Room ${assignedRoom} queue for follow-up review.`
    );
  };

  // OPD
  const createOPDEncounter = (encounter: Omit<OPDEncounter, 'encounterId' | 'createdAt'>): OPDEncounter => {
    const encounterId = `ENC-2025-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEncounter: OPDEncounter = {
      ...encounter,
      encounterId,
      createdAt
    };

    setOpdEncounters((prev) => [newEncounter, ...prev]);

    // Auto-mark any waiting queue item for this MRN and room as Completed
    setOpdQueue((prev) =>
      prev.map((q) =>
        q.mrn === encounter.mrn && q.assignedRoom === encounter.stationNumber
          ? { ...q, status: 'Completed' }
          : q
      )
    );

    addToast('success', 'OPD Clinical Encounter Saved', `Encounter ID ${encounterId} logged for ${encounter.patientName}`);
    return newEncounter;
  };

  const updateOPDEncounter = (encounterId: string, data: Partial<OPDEncounter>) => {
    setOpdEncounters((prev) => prev.map((e) => (e.encounterId === encounterId ? { ...e, ...data } : e)));
  };

  // IPD & Beds
  const createAdmissionOrder = (orderData: Omit<DoctorAdmissionOrder, 'orderId' | 'orderTime' | 'status'>): DoctorAdmissionOrder => {
    const orderId = `ADO-2025-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const orderTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: DoctorAdmissionOrder = {
      ...orderData,
      orderId,
      orderTime,
      status: 'Pending Bed Allocation'
    };

    setAdmissionOrders((prev) => [newOrder, ...prev]);

    const wardNameMap: Record<WardCode, string> = {
      'GW-MALE': 'Male General Ward',
      'GW-FEMALE': 'Female General Ward',
      ICU: 'Intensive Care Unit (ICU)',
      PEDIATRICS: 'Pediatric & Child Inpatient Ward',
      MATERNITY: 'Maternity & Labour Ward',
      SURGICAL: 'Surgical Inpatient Ward'
    };

    updatePatient(orderData.mrn, {
      activeStation: `IPD Intake Queue (${wardNameMap[orderData.recommendedWard]} - Awaiting Bed)`
    });

    addToast(
      'success',
      '🛏️ Doctor Inpatient Order Created',
      `Admission request queued for ${orderData.patientName} -> ${wardNameMap[orderData.recommendedWard]}`
    );

    return newOrder;
  };

  const allocateBedForOrder = (orderId: string, wardCode: WardCode, bedNumber: string) => {
    const order = admissionOrders.find((o) => o.orderId === orderId);
    if (!order) return;

    admitPatientToBed(order.mrn, wardCode, bedNumber, order.diagnosis, order.orderingDoctor);

    setAdmissionOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: 'Bed Allocated', assignedBedNumber: bedNumber } : o
      )
    );
  };

  const cancelAdmissionOrder = (orderId: string, reason?: string) => {
    setAdmissionOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? { ...o, status: 'Cancelled', notes: `${o.notes || ''} [Cancelled: ${reason || 'Clinical order changed'}]` }
          : o
      )
    );
    addToast('info', 'Admission Order Cancelled', `Order ${orderId} has been cancelled.`);
  };

  const admitPatientToBed = (
    mrn: string,
    wardCode: WardCode,
    bedNumber: string,
    diagnosis: string,
    admittingClinician: string
  ) => {
    const patient = getPatientByMrn(mrn);
    if (!patient) return;

    const admissionId = `ADM-2025-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const admissionDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const wardNameMap: Record<WardCode, string> = {
      'GW-MALE': 'Male General Ward',
      'GW-FEMALE': 'Female General Ward',
      ICU: 'Intensive Care Unit (ICU)',
      PEDIATRICS: 'Pediatric Ward',
      MATERNITY: 'Maternity & Labour Ward',
      SURGICAL: 'Surgical Inpatient Ward'
    };

    const newAdmission: IPDAdmission = {
      admissionId,
      mrn,
      patientName: `${patient.firstName} ${patient.middleName} ${patient.lastName}`,
      admittingClinician,
      wardCode,
      wardName: wardNameMap[wardCode],
      bedNumber,
      admissionDateTime,
      diagnosis,
      dischargeChecklistStatus: {
        clinicalClearance: false,
        pharmacyClearance: false,
        billingClearance: false,
        nursingClearance: false
      },
      dischargeDisposition: 'Pending',
      status: 'Active',
      notes: `Admitted by ${admittingClinician}. Initial monitoring plan established.`,
      transferLogs: [
        {
          transferId: `TRF-${Math.floor(100 + Math.random() * 900)}`,
          fromWard: patient.activeStation || 'Outpatient',
          fromBed: 'Admissions Desk',
          toWard: wardNameMap[wardCode],
          toBed: bedNumber,
          timestamp: admissionDateTime,
          reason: 'Initial Inpatient Bed Allocation',
          authorizedBy: currentUser.name
        }
      ]
    };

    // Update Bed state
    setBeds((prev) =>
      prev.map((b) =>
        b.wardCode === wardCode && b.bedNumber === bedNumber
          ? {
              ...b,
              status: 'Occupied',
              patientMrn: mrn,
              patientName: `${patient.firstName} ${patient.lastName}`,
              admissionId,
              admittedAt: admissionDateTime
            }
          : b
      )
    );

    // Update patient active station
    updatePatient(mrn, { activeStation: `${wardNameMap[wardCode]} - Bed ${bedNumber}` });

    setIpdAdmissions((prev) => [newAdmission, ...prev]);
    addToast('success', 'Patient Admitted to IPD', `Bed ${bedNumber} assigned in ${wardNameMap[wardCode]}`);
  };

  const transferBed = (admissionId: string, targetWard: WardCode, targetBed: string, reason: string) => {
    const admission = ipdAdmissions.find((a) => a.admissionId === admissionId);
    if (!admission) return;

    const wardNameMap: Record<WardCode, string> = {
      'GW-MALE': 'Male General Ward',
      'GW-FEMALE': 'Female General Ward',
      ICU: 'Intensive Care Unit (ICU)',
      PEDIATRICS: 'Pediatric Ward',
      MATERNITY: 'Maternity & Labour Ward',
      SURGICAL: 'Surgical Inpatient Ward'
    };

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTransferLog = {
      transferId: `TRF-${Math.floor(100 + Math.random() * 900)}`,
      fromWard: admission.wardName,
      fromBed: admission.bedNumber,
      toWard: wardNameMap[targetWard],
      toBed: targetBed,
      timestamp,
      reason,
      authorizedBy: currentUser.name
    };

    // Free old bed -> cleaning
    setBeds((prev) =>
      prev.map((b) => {
        if (b.wardCode === admission.wardCode && b.bedNumber === admission.bedNumber) {
          return { ...b, status: 'Cleaning', patientMrn: undefined, patientName: undefined, admissionId: undefined };
        }
        if (b.wardCode === targetWard && b.bedNumber === targetBed) {
          return {
            ...b,
            status: 'Occupied',
            patientMrn: admission.mrn,
            patientName: admission.patientName,
            admissionId: admission.admissionId,
            admittedAt: timestamp
          };
        }
        return b;
      })
    );

    setIpdAdmissions((prev) =>
      prev.map((a) =>
        a.admissionId === admissionId
          ? {
              ...a,
              wardCode: targetWard,
              wardName: wardNameMap[targetWard],
              bedNumber: targetBed,
              transferLogs: [...a.transferLogs, newTransferLog]
            }
          : a
      )
    );

    updatePatient(admission.mrn, { activeStation: `${wardNameMap[targetWard]} - Bed ${targetBed}` });
    addToast('info', 'Bed Transfer Completed', `Patient transferred from ${admission.bedNumber} to ${targetBed}`);
  };

  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setBeds((prev) => prev.map((b) => (b.bedId === bedId ? { ...b, status } : b)));
    addToast('info', 'Bed Status Changed', `Status updated to ${status}`);
  };

  const updateDischargeChecklist = (admissionId: string, checklist: Partial<IPDAdmission['dischargeChecklistStatus']>) => {
    setIpdAdmissions((prev) =>
      prev.map((a) =>
        a.admissionId === admissionId
          ? {
              ...a,
              dischargeChecklistStatus: { ...a.dischargeChecklistStatus, ...checklist }
            }
          : a
      )
    );
    addToast('success', 'Discharge Checklist Synchronized', 'Departmental clearance status updated.');
  };

  const finalizeDischarge = (admissionId: string, disposition: IPDAdmission['dischargeDisposition']) => {
    const admission = ipdAdmissions.find((a) => a.admissionId === admissionId);
    if (!admission) return;

    // Free bed to cleaning
    setBeds((prev) =>
      prev.map((b) =>
        b.wardCode === admission.wardCode && b.bedNumber === admission.bedNumber
          ? { ...b, status: 'Cleaning', patientMrn: undefined, patientName: undefined, admissionId: undefined }
          : b
      )
    );

    setIpdAdmissions((prev) =>
      prev.map((a) => (a.admissionId === admissionId ? { ...a, status: 'Discharged', dischargeDisposition: disposition } : a))
    );

    updatePatient(admission.mrn, { activeStation: 'Discharged (Home/Referral)' });
    addToast('success', 'Patient Discharged', `Disposition: ${disposition}. Bed marked for sanitization.`);
  };

  // Emergency
  const registerEmergencyPatient = (data: Omit<EmergencyRecord, 'emergencyId' | 'arrivedAt'>): EmergencyRecord => {
    const emergencyId = `ER-2025-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const arrivedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: EmergencyRecord = {
      ...data,
      emergencyId,
      arrivedAt
    };

    setEmergencyRecords((prev) => [newRecord, ...prev]);
    updatePatient(data.mrn, { activeStation: `Emergency - ${data.activeTraumaBay}` });
    addToast(
      data.triageLevel === 'RED' ? 'error' : 'warning',
      `Emergency Triage: Code ${data.triageLevel}`,
      `Assigned to ${data.activeTraumaBay} (${data.attendingStaff})`
    );
    return newRecord;
  };

  const updateEmergencyRecord = (emergencyId: string, data: Partial<EmergencyRecord>) => {
    setEmergencyRecords((prev) => prev.map((e) => (e.emergencyId === emergencyId ? { ...e, ...data } : e)));
    addToast('info', 'Emergency Status Updated', `Case ${emergencyId} modified.`);
  };

  // Laboratory & Blood Bank
  const createLabOrder = (order: Omit<LabOrder, 'labOrderId' | 'sampleIdBarcode' | 'createdAt'>): LabOrder => {
    const labOrderId = `LAB-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const sampleIdBarcode = `SMP-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: LabOrder = {
      ...order,
      labOrderId,
      sampleIdBarcode,
      createdAt
    };

    setLabOrders((prev) => [newOrder, ...prev]);
    addToast('success', 'Laboratory Order Submitted', `Sample Barcode: ${sampleIdBarcode} (${order.testName})`);
    return newOrder;
  };

  const updateLabResults = (
    labOrderId: string,
    results: LabOrder['results'],
    verificationStatus: LabOrder['verificationStatus']
  ) => {
    let affectedMrn = '';
    let affectedPatientName = '';

    setLabOrders((prev) =>
      prev.map((o) => {
        if (o.labOrderId === labOrderId) {
          affectedMrn = o.mrn;
          affectedPatientName = o.patientName;
          return {
            ...o,
            results,
            verificationStatus,
            verifyingTechId: `${currentUser.name} (Tech)`
          };
        }
        return o;
      })
    );

    // If verified or critical, automatically return patient to OPD Doctor Queue with Results Ready status
    if (verificationStatus === 'Verified' || verificationStatus === 'Critical Alert') {
      if (affectedMrn) {
        setOpdQueue((prev) =>
          prev.map((q) =>
            q.mrn === affectedMrn && (q.status === 'Awaiting Lab/Radiology' || q.status === 'Waiting' || q.status === 'In Consultation')
              ? { ...q, status: 'Results Ready' }
              : q
          )
        );
        updatePatient(affectedMrn, {
          activeStation: `OPD (Lab Results Verified - Ready for Doctor)`
        });
      }

      if (verificationStatus === 'Critical Alert') {
        addToast('error', 'CRITICAL LAB ALERT', `Panic values flagged for Lab Order ${labOrderId}! Clinician notified and patient returned to OPD queue.`);
      } else {
        addToast('success', 'Lab Results Verified & Patient Returned to OPD', `Results for ${affectedPatientName || affectedMrn} are ready. Patient is queued for doctor review.`);
      }
    } else {
      addToast('info', 'Lab Order Updated', `Lab order status: ${verificationStatus}`);
    }
  };

  const registerBloodDonor = (donor: Omit<BloodDonor, 'donorCardId'>): BloodDonor => {
    const donorCardId = `DNR-${Math.floor(8000 + Math.random() * 1000)}`;
    const newDonor: BloodDonor = { ...donor, donorCardId };
    setBloodDonors((prev) => [newDonor, ...prev]);
    addToast('success', 'Blood Donor Enrolled', `Donor Card ${donorCardId} generated.`);
    return newDonor;
  };

  const updateBloodDonor = (donorCardId: string, data: Partial<BloodDonor>) => {
    setBloodDonors((prev) =>
      prev.map((d) => (d.donorCardId === donorCardId ? { ...d, ...data } : d))
    );
    addToast('info', 'Donor Profile Updated', `Donor record ${donorCardId} updated.`);
  };

  const addBloodUnit = (unit: Omit<BloodUnit, 'unitId'>): BloodUnit => {
    const unitId = `BLD-${unit.bloodGroup.replace('+', 'P').replace('-', 'N')}-${Math.floor(100 + Math.random() * 900)}`;
    const newUnit: BloodUnit = { ...unit, unitId };
    setBloodUnits((prev) => [newUnit, ...prev]);
    addToast('success', 'Blood Unit Added to Bank', `Unit ${unitId} (${unit.bloodGroup}) stored.`);
    return newUnit;
  };

  const createCrossmatch = (record: Omit<CrossmatchRecord, 'matchId' | 'timestamp'>): CrossmatchRecord => {
    const matchId = `XMT-2025-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMatch: CrossmatchRecord = {
      ...record,
      matchId,
      timestamp
    };

    setCrossmatchRecords((prev) => [newMatch, ...prev]);
    addToast('success', 'Crossmatch Completed', `Unit ${record.matchedUnitId} marked ${record.status}`);
    return newMatch;
  };

  const updateCrossmatch = (matchId: string, data: Partial<CrossmatchRecord>) => {
    setCrossmatchRecords((prev) =>
      prev.map((m) => (m.matchId === matchId ? { ...m, ...data } : m))
    );
    addToast('info', 'Crossmatch Record Updated', `Record ${matchId} updated.`);
  };

  // Radiology
  const createRadiologyOrder = (order: Omit<RadiologyOrder, 'radiologyOrderId'>): RadiologyOrder => {
    const radiologyOrderId = `RAD-2025-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: RadiologyOrder = { ...order, radiologyOrderId };
    setRadiologyOrders((prev) => [newOrder, ...prev]);
    addToast('success', 'Radiology Request Logged', `${order.modality} scheduled for ${order.patientName}`);
    return newOrder;
  };

  const updateRadiologyReport = (
    radiologyOrderId: string,
    findings: string,
    signature: string,
    status: RadiologyOrder['status']
  ) => {
    let affectedMrn = '';
    let affectedPatientName = '';

    setRadiologyOrders((prev) =>
      prev.map((r) => {
        if (r.radiologyOrderId === radiologyOrderId) {
          affectedMrn = r.mrn;
          affectedPatientName = r.patientName;
          return {
            ...r,
            diagnosticFindings: findings,
            radiologistSignature: signature,
            status
          };
        }
        return r;
      })
    );

    if (status === 'Report Verified' && affectedMrn) {
      setOpdQueue((prev) =>
        prev.map((q) =>
          q.mrn === affectedMrn && (q.status === 'Awaiting Lab/Radiology' || q.status === 'Waiting' || q.status === 'In Consultation')
            ? { ...q, status: 'Results Ready' }
            : q
        )
      );
      updatePatient(affectedMrn, {
        activeStation: `OPD (Radiology Verified - Ready for Doctor)`
      });
      addToast('success', 'Radiology Report Signed & Sent to OPD', `Report verified for ${affectedPatientName || affectedMrn}. Patient is back in doctor queue.`);
    } else {
      addToast('success', 'Radiology Report Signed', `Diagnostic report verified by ${signature}`);
    }
  };

  // Pharmacy
  const createPrescription = (prescription: Omit<Prescription, 'rxId' | 'createdAt'>): Prescription => {
    const rxId = `RX-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRx: Prescription = {
      ...prescription,
      rxId,
      createdAt
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    addToast('success', 'Prescription Signed & Transmitted', `Sent directly to Pharmacy Dispensing queue.`);
    return newRx;
  };

  const dispensePrescription = (rxId: string) => {
    const rx = prescriptions.find((p) => p.rxId === rxId);
    if (!rx) return;

    // Deduct stock
    rx.items.forEach((item) => {
      updateDrugStock(item.drugCode, -item.quantity);
    });

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.rxId === rxId
          ? {
              ...p,
              status: 'Dispensed',
              items: p.items.map((it) => ({ ...it, dispensedStatus: 'Dispensed' }))
            }
          : p
      )
    );

    addToast('success', 'Medications Dispensed', `Prescription ${rxId} completed & inventory deducted.`);
  };

  const updateDrugStock = (drugCode: string, quantityChange: number) => {
    setDrugInventory((prev) =>
      prev.map((d) => {
        if (d.drugCode === drugCode) {
          const newStock = Math.max(0, d.stockOnHand + quantityChange);
          return { ...d, stockOnHand: newStock };
        }
        return d;
      })
    );
  };

  const addNewDrugItem = (item: DrugItem) => {
    setDrugInventory((prev) => [item, ...prev]);
    addToast('success', 'New Drug Item Registered', `${item.genericName} added to perpetual stock.`);
  };

  const updateDrugItem = (drugCode: string, data: Partial<DrugItem>) => {
    setDrugInventory((prev) =>
      prev.map((d) => (d.drugCode === drugCode ? { ...d, ...data } : d))
    );
    addToast('info', 'Formulary Item Updated', `Drug ${drugCode} updated.`);
  };

  // Cashier & Billing
  const createBillForPatient = (mrn: string, items: Bill['items']): Bill => {
    const patient = getPatientByMrn(mrn);
    const billId = `BILL-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce((acc, it) => acc + it.total, 0);

    // Calculate insurance co-pay discounts
    let insuranceDiscount = 0;
    if (patient?.payerClass === 'CBHI (Community Health Insurance)') {
      insuranceDiscount = Math.round(subtotal * 0.85); // 85% covered
    } else if (patient?.payerClass === 'Corporate Partner' || patient?.payerClass === 'Private Insurance') {
      insuranceDiscount = Math.round(subtotal * 0.9); // 90% covered
    }

    const amountPayable = Math.max(0, subtotal - insuranceDiscount);
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newBill: Bill = {
      billId,
      mrn,
      patientName: patient ? `${patient.firstName} ${patient.middleName} ${patient.lastName}` : 'Walk-in Patient',
      payerClass: patient?.payerClass || 'Cash',
      items,
      subtotal,
      insuranceDiscount,
      amountPayable,
      status: 'Unpaid',
      createdAt
    };

    setBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  const settleBill = (
    billId: string,
    paymentMethod: CashierTransaction['paymentMethod'],
    amount: number
  ): CashierTransaction => {
    const bill = bills.find((b) => b.billId === billId);
    const receiptNumber = `RCP-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const closingBalance = tillSession.openingBalance + tillSession.totalCashReceived + tillSession.totalDigitalReceived + amount;

    const newTxn: CashierTransaction = {
      transactionId,
      billId,
      receiptNumber,
      mrn: bill?.mrn || 'N/A',
      patientName: bill?.patientName || 'Patient',
      paymentMethod,
      amountReceived: amount,
      cashierId: currentUser.name,
      registerId: tillSession.registerId,
      timestamp,
      closingBalance
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update bill
    setBills((prev) =>
      prev.map((b) => (b.billId === billId ? { ...b, status: 'Paid', receiptNumber } : b))
    );

    // Update till
    if (paymentMethod === 'Cash') {
      setTillSession((prev) => ({ ...prev, totalCashReceived: prev.totalCashReceived + amount }));
    } else {
      setTillSession((prev) => ({ ...prev, totalDigitalReceived: prev.totalDigitalReceived + amount }));
    }

    addToast('success', 'Payment Received & Receipt Generated', `Receipt #${receiptNumber} for ETB ${amount.toLocaleString()}`);
    return newTxn;
  };

  const closeTillSession = () => {
    const now = new Date();
    const closingTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTillSession((prev) => ({ ...prev, status: 'Audited & Closed', closingTime }));
    addToast('info', 'Till Session Closed & Audited', 'Shift balance reconciled.');
  };

  const openTillSession = (openingCash: number) => {
    const now = new Date();
    const openingTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTillSession({
      sessionId: `SES-${Date.now().toString().slice(-6)}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      registerId: 'REG-MAIN-01',
      openingTime,
      openingBalance: openingCash,
      totalCashReceived: 0,
      totalDigitalReceived: 0,
      status: 'Open'
    });
    addToast('success', 'Till Session Opened', `Starting Float: ETB ${openingCash.toLocaleString()}`);
  };

  const processInvoicePayment = (
    invoiceId: string,
    paymentMethod: any,
    transactionRef?: string
  ) => {
    const inv = bills.find((b) => b.invoiceId === invoiceId || b.billId === invoiceId);
    const amount = inv ? (inv.totalAmount ?? inv.amountPayable ?? 0) : 0;
    const receiptNumber = `RCP-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    const ref = transactionRef || (paymentMethod === 'Cash' ? `CSH-${Date.now().toString().slice(-5)}` : `TLB-${Math.floor(100000 + Math.random() * 900000)}`);
    
    setBills((prev) =>
      prev.map((b) =>
        b.invoiceId === invoiceId || b.billId === invoiceId
          ? {
              ...b,
              status: 'Paid',
              paymentMethod,
              transactionRef: ref,
              cashierName: currentUser.name,
              receiptNumber
            }
          : b
      )
    );

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const closingBalance = tillSession.openingBalance + tillSession.totalCashReceived + tillSession.totalDigitalReceived + amount;

    const newTxn: CashierTransaction = {
      transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      billId: invoiceId,
      receiptNumber,
      mrn: inv?.mrn || 'N/A',
      patientName: inv?.patientName || 'Patient',
      paymentMethod: paymentMethod as any,
      amountReceived: amount,
      cashierId: currentUser.name,
      registerId: tillSession.registerId,
      timestamp,
      closingBalance
    };

    setTransactions((prev) => [newTxn, ...prev]);

    if (paymentMethod === 'Cash') {
      setTillSession((prev) => ({ ...prev, totalCashReceived: prev.totalCashReceived + amount }));
    } else {
      setTillSession((prev) => ({ ...prev, totalDigitalReceived: prev.totalDigitalReceived + amount }));
    }

    addToast('success', 'Payment Processed & Receipt Issued', `Invoice #${invoiceId} marked Paid (Receipt: ${receiptNumber})`);
    addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'Cashier & POS',
      action: 'Payment Collected',
      details: `Collected ETB ${amount.toLocaleString()} for ${inv?.patientName || 'Patient'} via ${paymentMethod}`
    });
  };

  // Administration & HR
  const addStaffMember = (staff: StaffEmployee) => {
    setStaffList((prev) => [staff, ...prev]);
    addToast('success', 'Staff Member Added', `${staff.fullName} added to hospital roster.`);
  };

  const submitLeaveRequest = (req: Omit<LeaveRequest, 'requestId'>) => {
    const requestId = `LR-2025-${Math.floor(100 + Math.random() * 900)}`;
    setLeaveRequests((prev) => [{ ...req, requestId }, ...prev]);
    addToast('info', 'Leave Request Submitted', `Request #${requestId} logged for admin review.`);
  };

  const updateLeaveStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setLeaveRequests((prev) => prev.map((l) => (l.requestId === requestId ? { ...l, status } : l)));
    addToast('success', `Leave Request ${status}`, `Status updated.`);
  };

  // Surgery
  const scheduleSurgery = (surgery: Omit<SurgicalProcedure, 'surgeryId'>): SurgicalProcedure => {
    const surgeryId = `SURG-2025-${Math.floor(100 + Math.random() * 900)}`;
    const newSurgery: SurgicalProcedure = { ...surgery, surgeryId };
    setSurgicalProcedures((prev) => [newSurgery, ...prev]);
    addToast('success', 'Surgical Procedure Booked', `${surgery.surgicalProcedureName} in ${surgery.targetOperatingRoom}`);
    return newSurgery;
  };

  const createSurgerySchedule = (surgery: Omit<SurgerySchedule, 'surgeryId'>): SurgerySchedule => {
    const surgeryId = `SURG-2025-${Math.floor(100 + Math.random() * 900)}`;
    const newSurgery: any = {
      ...surgery,
      surgeryId,
      procedureName: surgery.procedureName || surgery.surgicalProcedureName || 'Surgical Procedure',
      surgicalProcedureName: surgery.surgicalProcedureName || surgery.procedureName || 'Surgical Procedure',
      targetOperatingRoom: (surgery.targetOperatingRoom || surgery.operatingTheatre || 'OR 1 (General & Ortho)') as any,
      operatingTheatre: surgery.operatingTheatre || surgery.targetOperatingRoom || 'OR 1 (General & Ortho)',
      status: surgery.status || 'Scheduled'
    };
    setSurgicalProcedures((prev) => [newSurgery, ...prev]);
    addToast('success', 'Surgical Procedure Scheduled', `${newSurgery.procedureName} booked.`);
    return newSurgery;
  };

  const updateWhoChecklist = (surgeryId: string, checklist: Partial<NonNullable<SurgerySchedule['whoChecklist']>>) => {
    setSurgicalProcedures((prev: any) =>
      prev.map((s: any) =>
        s.surgeryId === surgeryId
          ? {
              ...s,
              whoChecklist: {
                ...(s.whoChecklist || { signIn: false, timeOut: false, signOut: false }),
                ...checklist
              }
            }
          : s
      )
    );
    addToast('info', 'WHO Checklist Updated', 'Surgical safety protocol saved.');
  };

  const updateSurgeryStatus = (surgeryId: string, status: SurgicalProcedure['status'], notes?: string) => {
    setSurgicalProcedures((prev) =>
      prev.map((s) =>
        s.surgeryId === surgeryId
          ? {
              ...s,
              status,
              postOpCarePlan: notes ? `${s.postOpCarePlan}\n[Update]: ${notes}` : s.postOpCarePlan
            }
          : s
      )
    );
    addToast('info', 'Surgery Status Updated', `Procedure marked as ${status}`);
  };

  const forceSyncDiskCache = async () => {
    await saveHospitalCache({
      patients,
      opdEncounters,
      opdQueue,
      beds,
      ipdAdmissions,
      admissionOrders,
      emergencyRecords,
      labOrders,
      bloodUnits,
      bloodDonors,
      crossmatchRecords,
      radiologyOrders,
      drugInventory,
      prescriptions,
      bills,
      transactions,
      tillSession,
      staffList,
      leaveRequests,
      surgicalProcedures,
      auditLogs
    }, true);
  };

  const exportCache = () => {
    exportCacheToFile({
      patients,
      opdEncounters,
      opdQueue,
      beds,
      ipdAdmissions,
      admissionOrders,
      emergencyRecords,
      labOrders,
      bloodUnits,
      bloodDonors,
      crossmatchRecords,
      radiologyOrders,
      drugInventory,
      prescriptions,
      bills,
      transactions,
      tillSession,
      staffList,
      leaveRequests,
      surgicalProcedures,
      auditLogs
    });
    addToast('success', 'Cache Exported', 'Local JSON snapshot downloaded successfully.');
  };

  const importCache = async (file: File) => {
    const data = await importCacheFromFile(file);
    if (data.patients) setPatients(data.patients);
    if (data.opdEncounters) setOpdEncounters(data.opdEncounters);
    if (data.opdQueue) setOpdQueue(data.opdQueue);
    if (data.beds) setBeds(data.beds);
    if (data.ipdAdmissions) setIpdAdmissions(data.ipdAdmissions);
    if (data.admissionOrders) setAdmissionOrders(data.admissionOrders);
    if (data.emergencyRecords) setEmergencyRecords(data.emergencyRecords);
    if (data.labOrders) setLabOrders(data.labOrders);
    if (data.bloodUnits) setBloodUnits(data.bloodUnits);
    if (data.bloodDonors) setBloodDonors(data.bloodDonors);
    if (data.crossmatchRecords) setCrossmatchRecords(data.crossmatchRecords);
    if (data.radiologyOrders) setRadiologyOrders(data.radiologyOrders);
    if (data.drugInventory) setDrugInventory(data.drugInventory);
    if (data.prescriptions) setPrescriptions(data.prescriptions);
    if (data.bills) setBills(data.bills);
    if (data.transactions) setTransactions(data.transactions);
    if (data.tillSession) setTillSession(data.tillSession);
    if (data.staffList) setStaffList(data.staffList);
    if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
    if (data.surgicalProcedures) setSurgicalProcedures(data.surgicalProcedures);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    addToast('success', 'Cache Restored', 'Successfully restored database from file.');
  };

  const resetAllData = async () => {
    await resetDiskCache();
    setPatients(INITIAL_PATIENTS);
    setOpdEncounters(INITIAL_OPD_ENCOUNTERS);
    setOpdQueue(INITIAL_OPD_QUEUE);
    setBeds(INITIAL_BEDS);
    setIpdAdmissions(INITIAL_IPD_ADMISSIONS);
    setAdmissionOrders(INITIAL_ADMISSION_ORDERS);
    setEmergencyRecords(INITIAL_EMERGENCY_RECORDS);
    setLabOrders(INITIAL_LAB_ORDERS);
    setBloodUnits(INITIAL_BLOOD_UNITS);
    setBloodDonors(INITIAL_BLOOD_DONORS);
    setCrossmatchRecords(INITIAL_CROSSMATCH_RECORDS);
    setRadiologyOrders(INITIAL_RADIOLOGY_ORDERS);
    setDrugInventory(INITIAL_DRUG_INVENTORY);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setBills(INITIAL_BILLS);
    setTransactions(INITIAL_TRANSACTIONS);
    setTillSession(INITIAL_TILL_SESSION);
    setStaffList(INITIAL_STAFF);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setSurgicalProcedures(INITIAL_SURGICAL_PROCEDURES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    addToast('info', 'Factory Reset', 'Database and local cache reset to default records.');
  };

  return (
    <HospitalContext.Provider
      value={{
        activeTab,
        setActiveTab,

        // Authentication & RBAC
        isAuthenticated,
        isLocked,
        currentUser,
        setCurrentUser,
        login,
        loginAsUser,
        logout,
        lockScreen,
        unlockScreen,
        hasPermission,
        canAccessModule,
        switchRole,
        users: DEMO_USERS,

        patients,
        registerPatient,
        checkDuplicatePatient,
        getPatientByMrn,
        updatePatient,

        opdEncounters,
        opdQueue,
        dispatchPatientToOPD,
        updateOPDQueueStatus,
        sendPatientToDiagnostics,
        markDiagnosticsReadyAndReturnToOPD,
        createOPDEncounter,
        updateOPDEncounter,

        beds,
        ipdAdmissions,
        admissionOrders,
        createAdmissionOrder,
        allocateBedForOrder,
        cancelAdmissionOrder,
        admitPatientToBed,
        transferBed,
        updateBedStatus,
        updateDischargeChecklist,
        finalizeDischarge,

        emergencyRecords,
        emergencyCases: emergencyRecords,
        registerEmergencyPatient,
        updateEmergencyRecord,

        labOrders,
        bloodUnits,
        bloodDonors,
        crossmatchRecords,
        createLabOrder,
        updateLabResults,
        registerBloodDonor,
        updateBloodDonor,
        addBloodUnit,
        createCrossmatch,
        updateCrossmatch,

        radiologyOrders,
        createRadiologyOrder,
        updateRadiologyReport,

        drugInventory,
        prescriptions,
        createPrescription,
        dispensePrescription,
        updateDrugStock,
        addNewDrugItem,
        updateDrugItem,

        bills,
        billingInvoices: bills,
        transactions,
        tillSession,
        createBillForPatient,
        settleBill,
        processInvoicePayment,
        closeTillSession,
        openTillSession,

        auditLogs,
        addAuditLog,
        staffList,
        leaveRequests,
        addStaffMember,
        submitLeaveRequest,
        updateLeaveStatus,

        surgeries: surgicalProcedures as any,
        surgicalProcedures,
        scheduleSurgery,
        createSurgerySchedule,
        updateSurgeryStatus,
        updateWhoChecklist,

        toasts,
        addToast,
        removeToast,
        selectedPatientMrn,
        setSelectedPatientMrn,

        receptionSubView,
        setReceptionSubView,
        labSubView,
        setLabSubView,
        pharmacySubView,
        setPharmacySubView,
        ipdSubView,
        setIpdSubView,

        storageDiagnostics,
        isCacheSyncing,
        lastSyncedAt,
        openStorageModal,
        setOpenStorageModal,
        forceSyncDiskCache,
        exportCache,
        importCache,
        resetAllData
      }}
    >
      {children}
      <StorageCacheModal isOpen={openStorageModal} onClose={() => setOpenStorageModal(false)} />
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
