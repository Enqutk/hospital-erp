export type UserRole =
  | 'RECEPTIONIST'
  | 'OPD_DOCTOR'
  | 'IPD_NURSE'
  | 'EMERGENCY_OFFICER'
  | 'LAB_TECH'
  | 'RADIOLOGIST'
  | 'PHARMACIST'
  | 'CASHIER'
  | 'ADMIN_HR'
  | 'OT_COORDINATOR';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password?: string;
  pinCode?: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
  stationNumber?: number;
  shift?: 'Morning Shift (08:00 - 16:00)' | 'Evening Shift (16:00 - 00:00)' | 'Night Shift (00:00 - 08:00)';
  licenseNumber?: string;
  allowedModules: string[];
  permissions: string[];
}

export type PayerClass = 'Cash' | 'CBHI (Community Health Insurance)' | 'Private Insurance' | 'Corporate Partner';

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  respRate: number;
  tempCelsius: number;
  spO2: number;
  gcsScore?: number; // Glasgow Coma Scale for ER
}

export interface Patient {
  mrn: string; // E.g. FPH-2025-0101
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  nationalId: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  payerClass: PayerClass;
  insuranceNumber?: string;
  photoUrl?: string;
  registeredAt: string;
  bloodGroup?: string;
  allergies: string[];
  activeStation?: string;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export interface OPDQueueItem {
  queueId: string;
  mrn: string;
  patientName: string;
  tokenNumber: string; // e.g. A-01, B-04
  assignedRoom: number; // 1 to 6
  assignedDoctorName: string;
  priority: 'Routine' | 'Urgent' | 'Elderly/Child';
  payerClass: PayerClass;
  status: 'Waiting' | 'In Consultation' | 'Awaiting Lab/Radiology' | 'Results Ready' | 'Completed' | 'Deferred';
  routedAt: string;
  dispatchedBy: string;
  vitals?: Vitals;
  awaitingDiagnosticsNotes?: string;
}

export interface OPDEncounter {
  encounterId: string;
  mrn: string;
  patientName: string;
  stationNumber: number; // 1 to 6
  doctorName: string;
  chiefComplaints: string;
  subjectiveSymptoms: string;
  objectiveObservations: string;
  icd10Codes: ICD10Code[];
  carePlan: string;
  referralDestination: 'IPD Admission' | 'Emergency' | 'Pharmacy' | 'Home / Follow-up' | 'Specialist Clinic';
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Referred';
  vitals: Vitals;
  createdAt: string;
}

export type WardCode = 'GW-MALE' | 'GW-FEMALE' | 'ICU' | 'PEDIATRICS' | 'MATERNITY' | 'SURGICAL';
export type BedStatus = 'Occupied' | 'Available' | 'Cleaning' | 'Maintenance';

export interface Bed {
  bedId: string;
  wardCode: WardCode;
  wardName: string;
  bedNumber: string;
  status: BedStatus;
  patientMrn?: string;
  patientName?: string;
  admissionId?: string;
  admittedAt?: string;
  oxygenPortAvailable: boolean;
}

export interface WardTransferLog {
  transferId: string;
  fromWard: string;
  fromBed: string;
  toWard: string;
  toBed: string;
  timestamp: string;
  reason: string;
  authorizedBy: string;
}

export interface IPDAdmission {
  admissionId: string;
  mrn: string;
  patientName: string;
  admittingClinician: string;
  wardCode: WardCode;
  wardName: string;
  bedNumber: string;
  admissionDateTime: string;
  diagnosis: string;
  dischargeChecklistStatus: {
    clinicalClearance: boolean;
    pharmacyClearance: boolean;
    billingClearance: boolean;
    nursingClearance: boolean;
  };
  dischargeDisposition: 'Recovered / Home' | 'Referred to Tertiary' | 'Against Medical Advice' | 'Expired' | 'Pending';
  status: 'Active' | 'Discharged';
  notes: string;
  transferLogs: WardTransferLog[];
}

export interface DoctorAdmissionOrder {
  orderId: string;
  mrn: string;
  patientName: string;
  ageGender?: string;
  sourceDepartment: 'OPD Clinic' | 'Emergency & Trauma' | 'Surgical OT' | 'Specialist Clinic';
  sourceLocation: string;
  orderingDoctor: string;
  recommendedWard: WardCode;
  diagnosis: string;
  clinicalPriority: 'Routine' | 'Urgent' | 'Emergency / Stat';
  requiresOxygen: boolean;
  requiresIsolation?: boolean;
  guardianPresent?: string;
  orderTime: string;
  status: 'Pending Bed Allocation' | 'Bed Allocated' | 'Cancelled';
  assignedBedNumber?: string;
  notes?: string;
}

export type TriageLevel = 'RED' | 'YELLOW' | 'GREEN' | 'BLUE';

export interface EmergencyRecord {
  emergencyId: string;
  mrn: string;
  patientName: string;
  triageLevel: TriageLevel;
  presentingComplaint: string;
  criticalVitals: Vitals;
  activeTraumaBay: 'Resus Bay 1' | 'Resus Bay 2' | 'Trauma Bay 1' | 'Trauma Bay 2' | 'Observation A' | 'Observation B';
  attendingStaff: string;
  triageScoreReason: string;
  status: 'Triaged' | 'In Trauma Bay' | 'Transferred to OT' | 'Admitted to ICU' | 'Discharged';
  arrivedAt: string;
}

export interface LabParameterResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isCritical: boolean;
}

export interface LabOrder {
  labOrderId: string;
  sampleIdBarcode: string;
  mrn: string;
  patientName: string;
  testCode: string;
  testName: string;
  orderedBy: string;
  collectionDateTime: string;
  results: LabParameterResult[];
  verificationStatus: 'Pending Collection' | 'Sample Received' | 'Analyzing' | 'Verified' | 'Critical Alert';
  verifyingTechId: string;
  createdAt: string;
}

export interface BloodUnit {
  unitId: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  collectionDate: string;
  expiryDate: string;
  screeningClearance: {
    hiv: boolean;
    hbv: boolean;
    hcv: boolean;
    syphilis: boolean;
  };
  status: 'Available' | 'Reserved' | 'Expired' | 'Quarantined';
  donorCardId: string;
  volumeMl: number;
}

export interface BloodDonor {
  donorCardId: string;
  fullName: string;
  phone: string;
  bloodGroup: string;
  lastDonationDate: string;
  donationsCount: number;
  eligible: boolean;
}

export interface CrossmatchRecord {
  matchId: string;
  mrn: string;
  patientName: string;
  patientBloodGroup: string;
  requestedUnits: number;
  matchedUnitId: string;
  crossmatchingResult: 'Compatible (No Agglutination)' | 'Incompatible' | 'Pending';
  status: 'Cleared for Transfusion' | 'Testing' | 'Rejected';
  timestamp: string;
}

export type RadiologyModality = 'X-Ray' | 'Ultrasound' | 'CT' | 'MRI';

export interface RadiologyOrder {
  radiologyOrderId: string;
  mrn: string;
  patientName: string;
  modality: RadiologyModality;
  targetRegion: string;
  scanImageUrl: string;
  diagnosticFindings: string;
  radiologistSignature: string;
  status: 'Scheduled' | 'Scan Completed' | 'Report Verified' | 'Pending Scan';
  orderedBy: string;
  scheduledDateTime: string;
}

export type PharmacyStoreLocation = 'Main Pharmacy' | 'Emergency Pharmacy' | 'IPD Satellite';

export interface DrugItem {
  drugCode: string;
  genericName: string;
  brandName: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  stockOnHand: number;
  reorderTriggerLevel: number;
  supplierCode: string;
  unitSalePrice: number;
  storeLocation: PharmacyStoreLocation;
}

export interface PrescriptionItem {
  drugCode: string;
  genericName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  unitPrice: number;
  dispensedStatus: 'Dispensed' | 'Pending' | 'Out of Stock';
}

export interface Prescription {
  rxId: string;
  mrn: string;
  patientName: string;
  prescriberName: string;
  department: string;
  items: PrescriptionItem[];
  isSigned: boolean;
  status: 'Prescribed' | 'Dispensed' | 'Partially Dispensed';
  createdAt: string;
}

export interface BillItem {
  id: string;
  description: string;
  department: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  billId: string;
  invoiceId?: string;
  mrn: string;
  patientName: string;
  payerClass: PayerClass | string;
  items: BillItem[];
  subtotal: number;
  insuranceDiscount: number;
  amountPayable: number;
  totalAmount?: number;
  status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Pending' | 'Insurance Pending';
  paymentMethod?: string;
  transactionRef?: string;
  cashierName?: string;
  receiptNumber?: string;
  createdAt: string;
}

export type BillingInvoice = Bill;

export interface CashierTransaction {
  transactionId: string;
  billId: string;
  receiptNumber: string;
  mrn: string;
  patientName: string;
  paymentMethod: 'Cash' | 'Telebirr' | 'CBE Birr' | 'M-Pesa' | 'Credit/Debit Card' | 'Insurance Direct';
  amountReceived: number;
  cashierId: string;
  registerId: string;
  timestamp: string;
  closingBalance: number;
}

export interface TillSession {
  sessionId: string;
  cashierId: string;
  cashierName: string;
  registerId: string;
  openingTime: string;
  closingTime?: string;
  openingBalance: number;
  totalCashReceived: number;
  totalDigitalReceived: number;
  status: 'Open' | 'Audited & Closed';
}

export interface StaffEmployee {
  employeeId: string;
  nationalIdNumber: string;
  fullName: string;
  jobTitle: string;
  department: string;
  dateOfHiring: string;
  academicQualifications: string[];
  activeCertifications: Array<{
    name: string;
    expiryDate: string;
    valid: boolean;
  }>;
  leaveBalances: {
    annualLeave: number;
    sickLeave: number;
    maternityPaternity: number;
    studyLeave: number;
  };
  currentShift: 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night (23:00-07:00)' | 'Off Duty';
  status: 'Active' | 'On Leave' | 'Suspended';
  phone: string;
}

export interface LeaveRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual Leave' | 'Sick Leave' | 'Maternity / Paternity' | 'Study / Training';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface SurgicalProcedure {
  surgeryId: string;
  mrn: string;
  patientName: string;
  ageGender?: string;
  bloodGroup?: string;
  targetOperatingRoom?: 'OR 1 (General & Ortho)' | 'OR 2 (Laparoscopic / Minor)' | 'OR 3 (Obstetrics & Emergency)' | string;
  operatingTheatre?: string;
  leadSurgeon: string;
  assistantSurgeon?: string;
  anesthetist?: string;
  anaesthetist?: string;
  scrubNurse: string;
  circulatingNurse?: string;
  surgicalProcedureName?: string;
  procedureName?: string;
  preOpDiagnosis?: string;
  postOpDiagnosis?: string;
  anesthesiaType?: 'General Anesthesia' | 'Spinal Block' | 'Epidural' | 'Local with Sedation' | 'Regional Nerve Block';
  asaGrade?: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA E (Emergency)';
  scheduleDateTime?: string;
  scheduledDateTime?: string;
  incisionTime?: string;
  closureTime?: string;
  estimatedBloodLossMl?: number;
  bloodUnitsTransfused?: number;
  ivFluidsMl?: number;
  specimensCollected?: string;
  implantsUsed?: string;
  spongeNeedleCountVerified?: boolean;
  postOpCarePlan?: string;
  equipmentChecklist?: Array<{ item: string; checked: boolean }>;
  whoChecklist?: {
    signIn: boolean;
    timeOut: boolean;
    signOut: boolean;
  };
  surgicalNotes?: string;
  status: 'Scheduled' | 'In Progress' | 'PACU Recovery' | 'Completed' | 'Postponed' | 'Cancelled' | 'Recovery / PACU';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  details: string;
}

export type PaymentMethod = 'Cash' | 'Telebirr' | 'CBE Birr' | 'M-Pesa' | 'Credit/Debit Card' | 'Insurance Direct' | 'CBHI Insurance';

export interface SurgerySchedule {
  surgeryId: string;
  mrn: string;
  patientName: string;
  ageGender?: string;
  bloodGroup?: string;
  procedureName?: string;
  surgicalProcedureName?: string;
  operatingTheatre?: string;
  targetOperatingRoom?: 'OR 1 (General & Ortho)' | 'OR 2 (Laparoscopic / Minor)' | 'OR 3 (Obstetrics & Emergency)' | string;
  leadSurgeon: string;
  assistantSurgeon?: string;
  anaesthetist?: string;
  anesthetist?: string;
  scrubNurse: string;
  circulatingNurse?: string;
  preOpDiagnosis?: string;
  postOpDiagnosis?: string;
  surgicalProcedureName_alias?: string;
  anesthesiaType?: 'General Anesthesia' | 'Spinal Block' | 'Epidural' | 'Local with Sedation' | 'Regional Nerve Block';
  asaGrade?: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA E (Emergency)';
  scheduleDateTime?: string;
  scheduledDateTime?: string;
  incisionTime?: string;
  closureTime?: string;
  estimatedBloodLossMl?: number;
  bloodUnitsTransfused?: number;
  ivFluidsMl?: number;
  specimensCollected?: string;
  implantsUsed?: string;
  spongeNeedleCountVerified?: boolean;
  postOpCarePlan?: string;
  equipmentChecklist?: Array<{ item: string; checked: boolean }>;
  whoChecklist?: {
    signIn: boolean;
    timeOut: boolean;
    signOut: boolean;
  };
  surgicalNotes?: string;
  status: 'Scheduled' | 'In Progress' | 'PACU Recovery' | 'Completed' | 'Postponed' | 'Cancelled' | 'Recovery / PACU';
}


