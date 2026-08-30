import {
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
  CashierTransaction,
  TillSession,
  StaffEmployee,
  LeaveRequest,
  SurgicalProcedure,
  UserAccount,
  ICD10Code
} from '../types';

export interface OPDStationInfo {
  stationNumber: number;
  name: string;
  doctorName: string;
  roleTitle: string;
  specialty: string;
  room: string;
  departmentWing: string;
  targetDemographic: string;
  clinicalScope: string;
  specialFocusHint: string;
  status: 'Active' | 'On Break' | 'Offline';
}

export const OPD_STATIONS: OPDStationInfo[] = [
  {
    stationNumber: 1,
    name: 'OPD Room 1',
    doctorName: 'Dr. Almaz Bekele, MD',
    roleTitle: 'Consultant General Practitioner',
    specialty: 'General Outpatient & Adult Triage',
    room: 'Room 101',
    departmentWing: 'Ground Floor Main Wing',
    targetDemographic: 'General Adults (15+ yrs)',
    clinicalScope: 'Acute undifferentiated adult illness, fevers, routine health examinations, syndromic diagnosis & triage.',
    specialFocusHint: 'General adult primary care & syndromic triage',
    status: 'Active'
  },
  {
    stationNumber: 2,
    name: 'OPD Room 2',
    doctorName: 'Dr. Dawit Haile, MD',
    roleTitle: 'Consultant Internist / Physician',
    specialty: 'Internal Medicine & Chronic Care',
    room: 'Room 102',
    departmentWing: 'Ground Floor Medical Block',
    targetDemographic: 'Adults & Elderly (Chronic Disease, 50+ yrs)',
    clinicalScope: 'Hypertension, Type 1 & 2 Diabetes, Cardiovascular disease, Asthma/COPD, Chronic Kidney Disease, Peptic Ulcers.',
    specialFocusHint: 'Chronic NCD management, blood pressure & glycemic targets',
    status: 'Active'
  },
  {
    stationNumber: 3,
    name: 'OPD Room 3',
    doctorName: 'Dr. Hana Tadesse, MD',
    roleTitle: 'Consultant Pediatrician',
    specialty: 'Pediatrics & Child Health',
    room: 'Room 103',
    departmentWing: 'Pediatric & Child Health Wing',
    targetDemographic: 'Infants & Children (<15 yrs)',
    clinicalScope: 'Pediatric respiratory infections, childhood diarrhea, malnutrition (SAM/MAM), EPI vaccinations, neonatal follow-ups.',
    specialFocusHint: 'Weight-based pediatric dosing & IMNCI growth chart review',
    status: 'Active'
  },
  {
    stationNumber: 4,
    name: 'OPD Room 4',
    doctorName: 'Dr. Samuel Girma, MD',
    roleTitle: 'Consultant General Surgeon',
    specialty: 'General Surgery & Orthopedics',
    room: 'Room 104',
    departmentWing: 'Surgical Block & Dressing Wing',
    targetDemographic: 'Surgical & Trauma Candidates (All Ages)',
    clinicalScope: 'Pre-operative & post-operative assessments, fracture care, soft tissue lumps, hernia evaluations, wound care & minor procedures.',
    specialFocusHint: 'Surgical indications, wound classification & pre-op lab workup',
    status: 'Active'
  },
  {
    stationNumber: 5,
    name: 'OPD Room 5',
    doctorName: 'Dr. Helen Tesfaye, MD',
    roleTitle: 'Consultant Obstetrician & Gynecologist',
    specialty: 'Obstetrics & Gynecology (Maternal ANC)',
    room: 'Room 105',
    departmentWing: 'Maternal & Reproductive Wing',
    targetDemographic: 'Women of Childbearing Age & Pregnant Mothers (15–49 yrs)',
    clinicalScope: 'Antenatal care (ANC 1-8), high-risk pregnancy screening, post-partum checkups, family planning, pelvic pain & gynecological evaluations.',
    specialFocusHint: 'LMP, Gestational Age (Weeks), Fundal height & Fetal Heart Sounds',
    status: 'Active'
  },
  {
    stationNumber: 6,
    name: 'OPD Room 6',
    doctorName: 'Dr. Sarah Mengesha, MD',
    roleTitle: 'Senior Medical Officer - Fast Track',
    specialty: 'Fast-Track Walk-in & NCD Refills',
    room: 'Room 106',
    departmentWing: 'Fast-Track Rapid Clinic',
    targetDemographic: 'Stable Refills & Quick Consultations',
    clinicalScope: 'Routine chronic prescription refills, fit-for-work certificates, minor symptom checkups, rapid blood pressure / sugar checks.',
    specialFocusHint: 'Fast-track medication renewals & standard maintenance plans',
    status: 'Active'
  }
];

export const INITIAL_OPD_QUEUE: OPDQueueItem[] = [
  {
    queueId: 'Q-001',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    tokenNumber: 'A-01',
    assignedRoom: 2,
    assignedDoctorName: 'Dr. Dawit Haile, MD',
    priority: 'Routine',
    payerClass: 'CBHI (Community Health Insurance)',
    status: 'In Consultation',
    routedAt: '09:10 AM',
    dispatchedBy: 'Sister Selamawit (Reception)',
    vitals: {
      bpSystolic: 122,
      bpDiastolic: 78,
      heartRate: 104,
      respRate: 19,
      tempCelsius: 38.9,
      spO2: 98
    }
  },
  {
    queueId: 'Q-002',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    tokenNumber: 'A-02',
    assignedRoom: 1,
    assignedDoctorName: 'Dr. Almaz Bekele, MD',
    priority: 'Urgent',
    payerClass: 'Cash',
    status: 'Waiting',
    routedAt: '09:25 AM',
    dispatchedBy: 'Sister Selamawit (Reception)',
    vitals: {
      bpSystolic: 110,
      bpDiastolic: 70,
      heartRate: 88,
      respRate: 18,
      tempCelsius: 37.4,
      spO2: 99
    }
  },
  {
    queueId: 'Q-003',
    mrn: 'FPH-2025-0104',
    patientName: 'Tsehay Nigus Bekele',
    tokenNumber: 'A-03',
    assignedRoom: 5,
    assignedDoctorName: 'Dr. Helen Tesfaye, MD',
    priority: 'Routine',
    payerClass: 'Private Insurance',
    status: 'Waiting',
    routedAt: '09:40 AM',
    dispatchedBy: 'Sister Selamawit (Reception)'
  }
];

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    name: 'Sister Selamawit Bekele',
    username: 'selamawit',
    password: 'password123',
    pinCode: '1122',
    role: 'RECEPTIONIST',
    department: 'Reception & Registration',
    title: 'Chief Admissions Officer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-REC-8841',
    allowedModules: ['RECEPTION', 'CASHIER'],
    permissions: ['PATIENTS_CREATE', 'PATIENTS_EDIT', 'QUEUE_ASSIGN', 'CARDS_PRINT', 'PAYER_VERIFY']
  },
  {
    id: 'USR-02',
    name: 'Dr. Dawit Haile, MD',
    username: 'drdawit',
    password: 'password123',
    pinCode: '2233',
    role: 'OPD_DOCTOR',
    department: 'Outpatient Department',
    title: 'Consultant Physician (Station 2)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    stationNumber: 2,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-MD-44912',
    allowedModules: ['OPD', 'LAB_BLOOD', 'RADIOLOGY', 'PHARMACY', 'IPD'],
    permissions: ['EMR_WRITE', 'RX_PRESCRIBE', 'LAB_ORDER', 'RAD_ORDER', 'IPD_ADMIT', 'ICD10_DIAGNOSE']
  },
  {
    id: 'USR-03',
    name: 'Nurse Rahel Tadesse, BSN',
    username: 'rahel',
    password: 'password123',
    pinCode: '3344',
    role: 'IPD_NURSE',
    department: 'IPD & Bed Allocation',
    title: 'Charge Nurse & Bed Manager',
    avatar: 'https://images.unsplash.com/photo-1594824813579-224a13292410?w=150&auto=format&fit=crop&q=80',
    stationNumber: 3,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-RN-12093',
    allowedModules: ['IPD', 'PHARMACY', 'LAB_BLOOD'],
    permissions: ['BED_TRANSFER', 'VITALS_RECORD', 'NURSING_NOTES', 'MED_ADMINISTER', 'DISCHARGE_INIT']
  },
  {
    id: 'USR-04',
    name: 'Dr. Yonas Alemayehu, MD',
    username: 'dryonas',
    password: 'password123',
    pinCode: '4455',
    role: 'EMERGENCY_OFFICER',
    department: 'Emergency & Triage',
    title: 'Trauma & Emergency Specialist',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-EMR-7721',
    allowedModules: ['EMERGENCY', 'OPD', 'LAB_BLOOD', 'RADIOLOGY', 'OT'],
    permissions: ['TRIAGE_ASSIGN', 'TRAUMA_RESUSCITATE', 'EMR_STAT_ORDER', 'OT_EMERGENCY_BOOK']
  },
  {
    id: 'USR-05',
    name: 'Amanuel Kebede, MLS',
    username: 'amanuel',
    password: 'password123',
    pinCode: '5566',
    role: 'LAB_TECH',
    department: 'Laboratory & Blood Bank',
    title: 'Senior Medical Laboratory Scientist',
    avatar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-MLS-33190',
    allowedModules: ['LAB_BLOOD'],
    permissions: ['SPECIMEN_RECEIVE', 'TEST_PERFORM', 'RESULT_VERIFY', 'BLOOD_CROSSMATCH', 'REAGENTS_MANAGE']
  },
  {
    id: 'USR-06',
    name: 'Dr. Bethlehem Girma, MD',
    username: 'drbethlehem',
    password: 'password123',
    pinCode: '6677',
    role: 'RADIOLOGIST',
    department: 'Radiology & Imaging',
    title: 'Consultant Radiologist',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-RAD-9910',
    allowedModules: ['RADIOLOGY'],
    permissions: ['DICOM_VIEW', 'PACS_REPORT', 'SCAN_SCHEDULE', 'MODALITY_CONTROL']
  },
  {
    id: 'USR-07',
    name: 'Pharm. Henok Worku, BPharm',
    username: 'henok',
    password: 'password123',
    pinCode: '7788',
    role: 'PHARMACIST',
    department: 'Pharmacy Services',
    title: 'Lead Clinical Pharmacist',
    avatar: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-PHARM-6120',
    allowedModules: ['PHARMACY'],
    permissions: ['RX_DISPENSE', 'DRUG_STOCK_RECEIVE', 'BATCH_EXPIRY_MONITOR', 'POISON_REGISTER']
  },
  {
    id: 'USR-08',
    name: 'Tigist Mengistu',
    username: 'tigist',
    password: 'password123',
    pinCode: '8899',
    role: 'CASHIER',
    department: 'Finance & Billing',
    title: 'Senior Cashier & POS Operator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOF-FIN-9901',
    allowedModules: ['CASHIER', 'RECEPTION'],
    permissions: ['TILL_OPEN_CLOSE', 'PAYMENT_COLLECT', 'RECEIPT_ISSUE', 'TELEBIRR_RECONCILE', 'DEPOSIT_REPORT']
  },
  {
    id: 'USR-09',
    name: 'Ephrem Tesfaye, MHA',
    username: 'admin',
    password: 'password123',
    pinCode: '9900',
    role: 'ADMIN_HR',
    department: 'Hospital Administration & HR',
    title: 'Hospital Managing Director',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-DIR-0001',
    allowedModules: ['ADMIN', 'RECEPTION', 'OPD', 'IPD', 'EMERGENCY', 'LAB_BLOOD', 'RADIOLOGY', 'PHARMACY', 'CASHIER', 'OT'],
    permissions: ['ALL_PERMISSIONS', 'STAFF_MANAGE', 'LEAVE_APPROVE', 'AUDIT_INSPECT', 'SYSTEM_CONFIG', 'PRICING_EDIT']
  },
  {
    id: 'USR-10',
    name: 'Dr. Michael Assefa, FACS',
    username: 'drmichael',
    password: 'password123',
    pinCode: '1234',
    role: 'OT_COORDINATOR',
    department: 'Operation Theater',
    title: 'Chief of Surgery & OT Lead',
    avatar: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&auto=format&fit=crop&q=80',
    stationNumber: 1,
    shift: 'Morning Shift (08:00 - 16:00)',
    licenseNumber: 'ETH-MOH-SURG-5512',
    allowedModules: ['OT', 'IPD', 'EMERGENCY'],
    permissions: ['SURGERY_BOOK', 'WHO_SAFETY_SIGN', 'PACU_CLEAR', 'SURGICAL_NOTES_SIGN', 'OR_RESOURCE_ALLOCATE']
  }
];

export const ICD10_DATABASE: ICD10Code[] = [
  { code: 'A09.9', description: 'Gastroenteritis and colitis of unspecified origin', category: 'Infectious' },
  { code: 'B50.9', description: 'Plasmodium falciparum malaria, unspecified', category: 'Infectious' },
  { code: 'A01.0', description: 'Typhoid fever (Salmonella enterica)', category: 'Infectious' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  { code: 'J45.9', description: 'Bronchial asthma, unspecified', category: 'Respiratory' },
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'I20.9', description: 'Angina pectoris, unspecified', category: 'Cardiovascular' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'K29.7', description: 'Gastritis, unspecified with epigastric distress', category: 'Gastrointestinal' },
  { code: 'K35.8', description: 'Acute appendicitis, unspecified', category: 'Gastrointestinal' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Renal / Urological' },
  { code: 'O80.0', description: 'Spontaneous vertex delivery (Normal)', category: 'Obstetrics' },
  { code: 'O60.1', description: 'Preterm labor with preterm delivery', category: 'Obstetrics' },
  { code: 'S82.0', description: 'Fracture of patella / lower leg bone', category: 'Trauma / Orthopedics' },
  { code: 'R50.9', description: 'Fever of unknown origin', category: 'General Symptoms' },
  { code: 'D50.9', description: 'Iron deficiency anemia, unspecified', category: 'Hematology' }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    mrn: 'FPH-2025-0101',
    firstName: 'Abebe',
    middleName: 'Kebede',
    lastName: 'Wolde',
    dob: '1988-04-12',
    gender: 'Male',
    nationalId: 'ETH-99384721',
    phone: '+251 911 234 567',
    emergencyContactName: 'Almaz Wolde (Spouse)',
    emergencyContactPhone: '+251 922 765 432',
    payerClass: 'CBHI (Community Health Insurance)',
    insuranceNumber: 'CBHI-AA-04821',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-10 08:30',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    activeStation: 'OPD Station 2'
  },
  {
    mrn: 'FPH-2025-0102',
    firstName: 'Hiwot',
    middleName: 'Tadesse',
    lastName: 'Girma',
    dob: '1995-11-20',
    gender: 'Female',
    nationalId: 'ETH-88273619',
    phone: '+251 912 876 543',
    emergencyContactName: 'Tadesse Girma (Father)',
    emergencyContactPhone: '+251 911 345 678',
    payerClass: 'Cash',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-10 09:15',
    bloodGroup: 'A+',
    allergies: ['None Reported'],
    activeStation: 'Emergency Bay 1'
  },
  {
    mrn: 'FPH-2025-0103',
    firstName: 'Mulugeta',
    middleName: 'Tesfaye',
    lastName: 'Abate',
    dob: '1962-08-05',
    gender: 'Male',
    nationalId: 'ETH-77162534',
    phone: '+251 914 987 654',
    emergencyContactName: 'Hirut Mulugeta (Daughter)',
    emergencyContactPhone: '+251 930 112 233',
    payerClass: 'Corporate Partner',
    insuranceNumber: 'CORP-ETHIO-901',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-09 14:20',
    bloodGroup: 'B+',
    allergies: ['Aspirin'],
    activeStation: 'Surgical Ward Bed 03'
  },
  {
    mrn: 'FPH-2025-0104',
    firstName: 'Tsehay',
    middleName: 'Nigus',
    lastName: 'Bekele',
    dob: '1992-02-14',
    gender: 'Female',
    nationalId: 'ETH-66554433',
    phone: '+251 913 555 777',
    emergencyContactName: 'Berhanu Nigus (Brother)',
    emergencyContactPhone: '+251 920 444 888',
    payerClass: 'Private Insurance',
    insuranceNumber: 'MEDICARE-8871',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-10 10:00',
    bloodGroup: 'AB+',
    allergies: ['Latex'],
    activeStation: 'Maternity Ward Bed 01'
  },
  {
    mrn: 'FPH-2025-0105',
    firstName: 'Kaleb',
    middleName: 'Henok',
    lastName: 'Desta',
    dob: '2018-06-30',
    gender: 'Male',
    nationalId: 'ETH-55443322',
    phone: '+251 911 678 901',
    emergencyContactName: 'Marta Desta (Mother - Bedside Rooming-in)',
    emergencyContactPhone: '+251 911 678 901',
    payerClass: 'Cash',
    photoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-10 10:30',
    bloodGroup: 'O-',
    allergies: ['None Reported'],
    activeStation: 'Pediatrics Ward Bed 02'
  },
  {
    mrn: 'FPH-2025-0106',
    firstName: 'Bethlehem',
    middleName: 'Eyob',
    lastName: 'Teklu',
    dob: '2023-01-15',
    gender: 'Female',
    nationalId: 'ETH-44332211',
    phone: '+251 923 888 999',
    emergencyContactName: 'Hanna Teklu (Mother - Bedside Rooming-in)',
    emergencyContactPhone: '+251 923 888 999',
    payerClass: 'CBHI (Community Health Insurance)',
    insuranceNumber: 'CBHI-PED-1102',
    photoUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=150&auto=format&fit=crop&q=80',
    registeredAt: '2025-05-10 11:15',
    bloodGroup: 'B+',
    allergies: ['None Reported'],
    activeStation: 'Pediatrics Ward Bed 01'
  }
];

export const INITIAL_OPD_ENCOUNTERS: OPDEncounter[] = [
  {
    encounterId: 'ENC-2025-091',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    stationNumber: 2,
    doctorName: 'Dr. Dawit Haile, MD',
    chiefComplaints: 'High fever for 3 days, intermittent chills, severe frontal headache, and joint pain.',
    subjectiveSymptoms: 'Patient reports nausea, bitter mouth taste, profuse night sweating, and fatigue. No cough or shortness of breath.',
    objectiveObservations: 'Febrile (38.9°C), mild pallor, sclera non-icteric. Abdomen soft, mild splenomegaly palpable. Chest clear to auscultation.',
    icd10Codes: [
      { code: 'B50.9', description: 'Plasmodium falciparum malaria, unspecified', category: 'Infectious' },
      { code: 'R50.9', description: 'Fever of unknown origin', category: 'General Symptoms' }
    ],
    carePlan: 'Stat Malaria RDT & Blood Film, Complete Blood Count (CBC). Prescribe Artemether + Lumefantrine (Coartem) upon confirmation, Paracetamol 1g PO TID, Oral rehydration fluids.',
    referralDestination: 'Pharmacy',
    status: 'In Consultation',
    vitals: {
      bpSystolic: 122,
      bpDiastolic: 78,
      heartRate: 104,
      respRate: 19,
      tempCelsius: 38.9,
      spO2: 98
    },
    createdAt: '2025-05-10 09:30'
  },
  {
    encounterId: 'ENC-2025-090',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    stationNumber: 1,
    doctorName: 'Dr. Sarah Mengesha, MD',
    chiefComplaints: 'Persistent right lower abdominal pain radiating to groin for 24 hours.',
    subjectiveSymptoms: 'Anorexia, low grade fever, worsening pain on coughing or walking.',
    objectiveObservations: 'Positive McBurney sign, local guarding, Rovsing sign positive. Rebound tenderness present.',
    icd10Codes: [
      { code: 'K35.8', description: 'Acute appendicitis, unspecified', category: 'Gastrointestinal' }
    ],
    carePlan: 'Immediate surgical consult for Emergency Appendectomy. Fasting (NPO), IV Ceftriaxone + Metronidazole, IV Ringers Lactate. Bed admission to Surgical Ward.',
    referralDestination: 'IPD Admission',
    status: 'Referred',
    vitals: {
      bpSystolic: 135,
      bpDiastolic: 85,
      heartRate: 98,
      respRate: 20,
      tempCelsius: 38.2,
      spO2: 97
    },
    createdAt: '2025-05-09 15:00'
  }
];

export const INITIAL_BEDS: Bed[] = [
  // General Ward Male
  { bedId: 'BED-GWM-01', wardCode: 'GW-MALE', wardName: 'Male General Ward', bedNumber: 'GWM-01', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-GWM-02', wardCode: 'GW-MALE', wardName: 'Male General Ward', bedNumber: 'GWM-02', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-GWM-03', wardCode: 'GW-MALE', wardName: 'Male General Ward', bedNumber: 'GWM-03', status: 'Cleaning', oxygenPortAvailable: false },
  // General Ward Female
  { bedId: 'BED-GWF-01', wardCode: 'GW-FEMALE', wardName: 'Female General Ward', bedNumber: 'GWF-01', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-GWF-02', wardCode: 'GW-FEMALE', wardName: 'Female General Ward', bedNumber: 'GWF-02', status: 'Available', oxygenPortAvailable: true },
  // ICU
  { bedId: 'BED-ICU-01', wardCode: 'ICU', wardName: 'Intensive Care Unit (ICU)', bedNumber: 'ICU-01', status: 'Occupied', patientMrn: 'FPH-2025-0102', patientName: 'Hiwot Tadesse Girma', admissionId: 'ADM-2025-040', admittedAt: '2025-05-10 10:15', oxygenPortAvailable: true },
  { bedId: 'BED-ICU-02', wardCode: 'ICU', wardName: 'Intensive Care Unit (ICU)', bedNumber: 'ICU-02', status: 'Available', oxygenPortAvailable: true },
  // Pediatrics (Child Inpatient Ward)
  { bedId: 'BED-PED-01', wardCode: 'PEDIATRICS', wardName: 'Pediatric & Child Inpatient Ward', bedNumber: 'PED-01', status: 'Occupied', patientMrn: 'FPH-2025-0106', patientName: 'Bethlehem Eyob Teklu (Child, 2 yrs)', admissionId: 'ADM-2025-044', admittedAt: '2025-05-10 11:30', oxygenPortAvailable: true },
  { bedId: 'BED-PED-02', wardCode: 'PEDIATRICS', wardName: 'Pediatric & Child Inpatient Ward', bedNumber: 'PED-02', status: 'Occupied', patientMrn: 'FPH-2025-0105', patientName: 'Kaleb Henok Desta (Child, 6 yrs)', admissionId: 'ADM-2025-042', admittedAt: '2025-05-10 11:00', oxygenPortAvailable: true },
  { bedId: 'BED-PED-03', wardCode: 'PEDIATRICS', wardName: 'Pediatric & Child Inpatient Ward', bedNumber: 'PED-03', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-PED-04', wardCode: 'PEDIATRICS', wardName: 'Pediatric & Child Inpatient Ward', bedNumber: 'PED-04', status: 'Available', oxygenPortAvailable: true },
  // Maternity & Labour Ward
  { bedId: 'BED-MAT-01', wardCode: 'MATERNITY', wardName: 'Maternity & Labour Ward', bedNumber: 'MAT-01', status: 'Occupied', patientMrn: 'FPH-2025-0104', patientName: 'Tsehay Nigus Bekele', admissionId: 'ADM-2025-043', admittedAt: '2025-05-10 10:45', oxygenPortAvailable: true },
  { bedId: 'BED-MAT-02', wardCode: 'MATERNITY', wardName: 'Maternity & Labour Ward', bedNumber: 'MAT-02', status: 'Available', oxygenPortAvailable: true },
  // Surgical Ward
  { bedId: 'BED-SURG-01', wardCode: 'SURGICAL', wardName: 'Surgical Inpatient Ward', bedNumber: 'SURG-01', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-SURG-02', wardCode: 'SURGICAL', wardName: 'Surgical Inpatient Ward', bedNumber: 'SURG-02', status: 'Available', oxygenPortAvailable: true },
  { bedId: 'BED-SURG-03', wardCode: 'SURGICAL', wardName: 'Surgical Inpatient Ward', bedNumber: 'SURG-03', status: 'Occupied', patientMrn: 'FPH-2025-0103', patientName: 'Mulugeta Tesfaye Abate', admissionId: 'ADM-2025-041', admittedAt: '2025-05-09 16:00', oxygenPortAvailable: true }
];

export const INITIAL_IPD_ADMISSIONS: IPDAdmission[] = [
  {
    admissionId: 'ADM-2025-042',
    mrn: 'FPH-2025-0105',
    patientName: 'Kaleb Henok Desta (Child, 6 yrs)',
    admittingClinician: 'Dr. Hana Tadesse, MD (Consultant Pediatrician)',
    wardCode: 'PEDIATRICS',
    wardName: 'Pediatric & Child Inpatient Ward',
    bedNumber: 'PED-02',
    admissionDateTime: '2025-05-10 11:00',
    diagnosis: 'Severe Acute Bronchopneumonia & Reactive Airway Wheezing with Moderate Dehydration',
    dischargeChecklistStatus: {
      clinicalClearance: false,
      pharmacyClearance: false,
      billingClearance: false,
      nursingClearance: false
    },
    dischargeDisposition: 'Pending',
    status: 'Active',
    notes: '6-year-old boy (Weight: 19.5 kg). Mother Marta Desta rooming-in bedside. Respiratory distress improved post-Salbutamol neb. On IV Ampicillin 500mg Q6H, IV Gentamicin 100mg OD, IV D5 ½ NS maintenance at 58 ml/hr. Monitor SpO2 and work of breathing Q2H.',
    transferLogs: [
      {
        transferId: 'TRF-003',
        fromWard: 'Emergency',
        fromBed: 'Trauma Bay 2',
        toWard: 'Pediatric & Child Inpatient Ward',
        toBed: 'PED-02',
        timestamp: '2025-05-10 11:00',
        reason: 'Stabilized in ER trauma bay; transferred for inpatient pediatric antibiotic and nebulization care',
        authorizedBy: 'Dr. Yonas Alemayehu / Dr. Hana Tadesse'
      }
    ]
  },
  {
    admissionId: 'ADM-2025-044',
    mrn: 'FPH-2025-0106',
    patientName: 'Bethlehem Eyob Teklu (Child, 2 yrs)',
    admittingClinician: 'Dr. Hana Tadesse, MD (Consultant Pediatrician)',
    wardCode: 'PEDIATRICS',
    wardName: 'Pediatric & Child Inpatient Ward',
    bedNumber: 'PED-01',
    admissionDateTime: '2025-05-10 11:30',
    diagnosis: 'Acute Viral Rotavirus Gastroenteritis with Dehydration & Low Grade Fever',
    dischargeChecklistStatus: {
      clinicalClearance: false,
      pharmacyClearance: false,
      billingClearance: false,
      nursingClearance: false
    },
    dischargeDisposition: 'Pending',
    status: 'Active',
    notes: '2-year-old toddler (Weight: 11.2 kg). Mother Hanna Teklu rooming-in bedside. Tolerating spoon-fed ORS + Zinc Sulfate 20mg OD. IV Ringers Lactate 350ml rehydration completed. Skin turgor improving, alert and active.',
    transferLogs: []
  },
  {
    admissionId: 'ADM-2025-040',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    admittingClinician: 'Dr. Yonas Alemayehu, MD (Trauma & ER Lead)',
    wardCode: 'ICU',
    wardName: 'Intensive Care Unit (ICU)',
    bedNumber: 'ICU-01',
    admissionDateTime: '2025-05-10 10:15',
    diagnosis: 'Severe Polytrauma - Blunt Chest Injury, Multiple Left Rib Fractures & Hemothorax',
    dischargeChecklistStatus: {
      clinicalClearance: false,
      pharmacyClearance: false,
      billingClearance: false,
      nursingClearance: false
    },
    dischargeDisposition: 'Pending',
    status: 'Active',
    notes: 'Intensive Care Unit Bed 01. Left underwater chest tube drain in situ draining serosanguinous fluid. High-flow oxygen via non-rebreather mask 10L/min. Continuous arterial BP and cardiac telemetry monitoring.',
    transferLogs: [
      {
        transferId: 'TRF-002',
        fromWard: 'Emergency',
        fromBed: 'Resus Bay 1',
        toWard: 'Intensive Care Unit (ICU)',
        toBed: 'ICU-01',
        timestamp: '2025-05-10 10:15',
        reason: 'Critical polytrauma resuscitation stabilization to ICU telemetry bed',
        authorizedBy: 'Dr. Yonas Alemayehu'
      }
    ]
  },
  {
    admissionId: 'ADM-2025-041',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    admittingClinician: 'Dr. Michael Assefa, FACS',
    wardCode: 'SURGICAL',
    wardName: 'Surgical Inpatient Ward',
    bedNumber: 'SURG-03',
    admissionDateTime: '2025-05-09 16:00',
    diagnosis: 'Acute Appendicitis - Post Emergency Laparoscopic Appendectomy',
    dischargeChecklistStatus: {
      clinicalClearance: true,
      pharmacyClearance: true,
      billingClearance: false,
      nursingClearance: true
    },
    dischargeDisposition: 'Pending',
    status: 'Active',
    notes: 'Post-op Day 1. Afebrile, surgical wounds clean and dressing intact. Oral fluids tolerated. Awaiting final cashier settlement before discharge.',
    transferLogs: [
      {
        transferId: 'TRF-001',
        fromWard: 'Emergency',
        fromBed: 'Trauma Bay 1',
        toWard: 'Surgical Inpatient Ward',
        toBed: 'SURG-03',
        timestamp: '2025-05-09 16:00',
        reason: 'Emergency pre-op admission & surgical bed allocation',
        authorizedBy: 'Dr. Michael Assefa'
      }
    ]
  },
  {
    admissionId: 'ADM-2025-043',
    mrn: 'FPH-2025-0104',
    patientName: 'Tsehay Nigus Bekele',
    admittingClinician: 'Dr. Dawit Haile, MD',
    wardCode: 'MATERNITY',
    wardName: 'Maternity & Labour Ward',
    bedNumber: 'MAT-01',
    admissionDateTime: '2025-05-10 10:45',
    diagnosis: 'G1P0 at 39 weeks gestational age in Active First Stage Labour',
    dischargeChecklistStatus: {
      clinicalClearance: false,
      pharmacyClearance: false,
      billingClearance: false,
      nursingClearance: false
    },
    dischargeDisposition: 'Pending',
    status: 'Active',
    notes: 'Cervix 5cm dilated, fetal heart rate 142 bpm reactive. Partograph initiated. IV Cannula inserted.',
    transferLogs: []
  }
];

export const INITIAL_ADMISSION_ORDERS: DoctorAdmissionOrder[] = [
  {
    orderId: 'ADO-2025-101',
    mrn: 'FPH-2025-0105',
    patientName: 'Kaleb Henok Desta',
    ageGender: '6 yrs (Child) • Male',
    sourceDepartment: 'OPD Clinic',
    sourceLocation: 'Station 2 - Pediatrics Consultation Room',
    orderingDoctor: 'Dr. Hana Tadesse, MD (Consultant Pediatrician)',
    recommendedWard: 'PEDIATRICS',
    diagnosis: 'Severe Acute Bronchopneumonia & Reactive Airway Wheezing with Moderate Dehydration',
    clinicalPriority: 'Urgent',
    requiresOxygen: true,
    requiresIsolation: false,
    guardianPresent: 'Marta Desta (Mother - Bedside Rooming-in)',
    orderTime: '2025-05-10 10:50',
    status: 'Bed Allocated',
    assignedBedNumber: 'PED-02',
    notes: 'Direct pediatric admission. Mother rooming-in bedside. Requires IV Ampicillin, Gentamicin, Salbutamol nebs, and close work-of-breathing monitoring.'
  },
  {
    orderId: 'ADO-2025-102',
    mrn: 'FPH-2025-0106',
    patientName: 'Bethlehem Eyob Teklu',
    ageGender: '2 yrs (Toddler) • Female',
    sourceDepartment: 'OPD Clinic',
    sourceLocation: 'Station 2 - Pediatrics Consultation Room',
    orderingDoctor: 'Dr. Hana Tadesse, MD (Consultant Pediatrician)',
    recommendedWard: 'PEDIATRICS',
    diagnosis: 'Acute Viral Rotavirus Gastroenteritis with Dehydration & Low Grade Fever',
    clinicalPriority: 'Urgent',
    requiresOxygen: false,
    requiresIsolation: false,
    guardianPresent: 'Hanna Teklu (Mother - Bedside Rooming-in)',
    orderTime: '2025-05-10 11:20',
    status: 'Bed Allocated',
    assignedBedNumber: 'PED-01',
    notes: 'Child rehydration protocol. Mother bedside. Tolerating oral rehydration salts (ORS) + Zinc. Monitor skin turgor.'
  },
  {
    orderId: 'ADO-2025-103',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Tola',
    ageGender: '46 yrs • Male',
    sourceDepartment: 'OPD Clinic',
    sourceLocation: 'Station 1 - General Medicine Clinic',
    orderingDoctor: 'Dr. Sarah Jenkins, MD (Chief Medical Officer)',
    recommendedWard: 'GW-MALE',
    diagnosis: 'Severe Acute Peptic Ulcer Disease with Gastric Mucosal Bleeding & Moderate Anemia',
    clinicalPriority: 'Urgent',
    requiresOxygen: false,
    requiresIsolation: false,
    guardianPresent: 'Family contacted',
    orderTime: '2025-05-10 11:45',
    status: 'Pending Bed Allocation',
    notes: 'Doctor ordered admission for continuous IV PPI infusion (Pantoprazole 80mg bolus then 8mg/hr), serial Hb monitoring, and endoscopic evaluation.'
  },
  {
    orderId: 'ADO-2025-104',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    ageGender: '28 yrs • Female',
    sourceDepartment: 'Emergency & Trauma',
    sourceLocation: 'Resus Bay 1 - Trauma & Resuscitation Center',
    orderingDoctor: 'Dr. Yonas Alemayehu, MD (Trauma & ER Lead)',
    recommendedWard: 'ICU',
    diagnosis: 'Severe Polytrauma - Hemothorax, Multiple Rib Fractures & Hypovolemic Shock',
    clinicalPriority: 'Emergency / Stat',
    requiresOxygen: true,
    requiresIsolation: false,
    orderTime: '2025-05-10 10:10',
    status: 'Bed Allocated',
    assignedBedNumber: 'ICU-01',
    notes: 'STAT ICU transfer post-chest tube insertion. Continuous arterial line and telemetry required.'
  }
];

export const INITIAL_EMERGENCY_RECORDS: EmergencyRecord[] = [
  {
    emergencyId: 'ER-2025-077',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    triageLevel: 'RED',
    presentingComplaint: 'High-speed motor vehicle accident, polytrauma, severe blunt chest trauma, altered level of consciousness.',
    criticalVitals: {
      bpSystolic: 84,
      bpDiastolic: 52,
      heartRate: 132,
      respRate: 28,
      tempCelsius: 36.4,
      spO2: 89,
      gcsScore: 9
    },
    activeTraumaBay: 'Resus Bay 1',
    attendingStaff: 'Dr. Yonas Alemayehu (ER Specialist)',
    triageScoreReason: 'GCS < 10, Hemodynamic instability (BP 84/52), Hypoxia SpO2 89%. Immediate resuscitation required.',
    status: 'In Trauma Bay',
    arrivedAt: '2025-05-10 09:50'
  },
  {
    emergencyId: 'ER-2025-076',
    mrn: 'FPH-2025-0105',
    patientName: 'Kaleb Henok Desta',
    triageLevel: 'YELLOW',
    presentingComplaint: 'Severe acute wheezing, subcostal retractions, fever 39.1°C, unable to complete sentences.',
    criticalVitals: {
      bpSystolic: 95,
      bpDiastolic: 60,
      heartRate: 140,
      respRate: 36,
      tempCelsius: 39.1,
      spO2: 92,
      gcsScore: 15
    },
    activeTraumaBay: 'Trauma Bay 2',
    attendingStaff: 'Nurse Rahel Tadesse & Dr. Yonas Alemayehu',
    triageScoreReason: 'Pediatric respiratory distress with SpO2 92% and marked tachypnea.',
    status: 'Admitted to ICU',
    arrivedAt: '2025-05-10 10:10'
  },
  {
    emergencyId: 'ER-2025-075',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    triageLevel: 'GREEN',
    presentingComplaint: 'High grade fever and rigors for 3 days.',
    criticalVitals: {
      bpSystolic: 122,
      bpDiastolic: 78,
      heartRate: 104,
      respRate: 19,
      tempCelsius: 38.9,
      spO2: 98,
      gcsScore: 15
    },
    activeTraumaBay: 'Observation A',
    attendingStaff: 'Triage Nurse Bethel',
    triageScoreReason: 'Stable vitals, ambulatory, oriented. Fast-tracked to OPD Station 2.',
    status: 'Triaged',
    arrivedAt: '2025-05-10 08:45'
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    labOrderId: 'LAB-2025-0312',
    sampleIdBarcode: 'SMP-8839210',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    testCode: 'MALARIA_RDT_BF',
    testName: 'Malaria Rapid Diagnostic Test & Blood Film Giemsa',
    orderedBy: 'Dr. Dawit Haile, MD',
    collectionDateTime: '2025-05-10 09:45',
    results: [
      { parameter: 'Malaria Pf/Pv RDT', value: 'Positive for P. falciparum (Pf+++)', unit: 'Qualitative', referenceRange: 'Negative', isAbnormal: true, isCritical: false },
      { parameter: 'Blood Film Parasitemia', value: '3,800 trophozoites / uL', unit: 'parasites/uL', referenceRange: '0 / uL', isAbnormal: true, isCritical: false },
      { parameter: 'Hemoglobin (Hb)', value: '11.8', unit: 'g/dL', referenceRange: '13.5 - 17.5', isAbnormal: true, isCritical: false }
    ],
    verificationStatus: 'Verified',
    verifyingTechId: 'Amanuel Kebede (MLS-901)',
    createdAt: '2025-05-10 09:35'
  },
  {
    labOrderId: 'LAB-2025-0313',
    sampleIdBarcode: 'SMP-8839211',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    testCode: 'STAT_TRAUMA_PANEL',
    testName: 'Stat Emergency Trauma Blood Panel (CBC + Blood Group + Crossmatch)',
    orderedBy: 'Dr. Yonas Alemayehu, MD',
    collectionDateTime: '2025-05-10 10:05',
    results: [
      { parameter: 'Hemoglobin (Hb)', value: '7.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', isAbnormal: true, isCritical: true },
      { parameter: 'Hematocrit (Hct)', value: '22.1', unit: '%', referenceRange: '36.0 - 46.0', isAbnormal: true, isCritical: true },
      { parameter: 'Platelet Count', value: '142,000', unit: '/uL', referenceRange: '150,000 - 450,000', isAbnormal: true, isCritical: false },
      { parameter: 'Blood Group & Rh', value: 'A Positive (A+)', unit: 'ABO/Rh', referenceRange: 'N/A', isAbnormal: false, isCritical: false }
    ],
    verificationStatus: 'Critical Alert',
    verifyingTechId: 'Amanuel Kebede (MLS-901)',
    createdAt: '2025-05-10 09:55'
  },
  {
    labOrderId: 'LAB-2025-0314',
    sampleIdBarcode: 'SMP-8839212',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    testCode: 'CBC_POSTOP',
    testName: 'Complete Blood Count (Post-Operative Monitoring)',
    orderedBy: 'Dr. Michael Assefa, FACS',
    collectionDateTime: '2025-05-10 07:30',
    results: [
      { parameter: 'White Blood Cell (WBC)', value: '10.4', unit: 'x10^3/uL', referenceRange: '4.0 - 11.0', isAbnormal: false, isCritical: false },
      { parameter: 'Hemoglobin (Hb)', value: '13.9', unit: 'g/dL', referenceRange: '13.5 - 17.5', isAbnormal: false, isCritical: false }
    ],
    verificationStatus: 'Verified',
    verifyingTechId: 'Amanuel Kebede (MLS-901)',
    createdAt: '2025-05-10 07:00'
  }
];

export const INITIAL_BLOOD_UNITS: BloodUnit[] = [
  { unitId: 'BLD-A-0101', bloodGroup: 'A+', collectionDate: '2025-05-01', expiryDate: '2025-06-05', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Reserved', donorCardId: 'DNR-8401', volumeMl: 450 },
  { unitId: 'BLD-A-0102', bloodGroup: 'A+', collectionDate: '2025-05-04', expiryDate: '2025-06-08', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8402', volumeMl: 450 },
  { unitId: 'BLD-O-0201', bloodGroup: 'O+', collectionDate: '2025-05-02', expiryDate: '2025-06-06', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8403', volumeMl: 450 },
  { unitId: 'BLD-O-0202', bloodGroup: 'O+', collectionDate: '2025-05-06', expiryDate: '2025-06-10', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8404', volumeMl: 450 },
  { unitId: 'BLD-O-0203', bloodGroup: 'O-', collectionDate: '2025-05-05', expiryDate: '2025-06-09', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8405', volumeMl: 450 },
  { unitId: 'BLD-B-0301', bloodGroup: 'B+', collectionDate: '2025-04-28', expiryDate: '2025-06-02', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8406', volumeMl: 450 },
  { unitId: 'BLD-AB-0401', bloodGroup: 'AB+', collectionDate: '2025-05-03', expiryDate: '2025-06-07', screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true }, status: 'Available', donorCardId: 'DNR-8407', volumeMl: 450 }
];

export const INITIAL_BLOOD_DONORS: BloodDonor[] = [
  { donorCardId: 'DNR-8401', fullName: 'Tariku Mengistu', phone: '+251 911 888 222', bloodGroup: 'A+', lastDonationDate: '2025-05-01', donationsCount: 6, eligible: false },
  { donorCardId: 'DNR-8403', fullName: 'Binyam Fikadu', phone: '+251 912 333 444', bloodGroup: 'O+', lastDonationDate: '2025-05-02', donationsCount: 4, eligible: false },
  { donorCardId: 'DNR-8410', fullName: 'Helen Shiferaw', phone: '+251 913 777 999', bloodGroup: 'O-', lastDonationDate: '2024-12-10', donationsCount: 8, eligible: true }
];

export const INITIAL_CROSSMATCH_RECORDS: CrossmatchRecord[] = [
  {
    matchId: 'XMT-2025-019',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    patientBloodGroup: 'A+',
    requestedUnits: 2,
    matchedUnitId: 'BLD-A-0101',
    crossmatchingResult: 'Compatible (No Agglutination)',
    status: 'Cleared for Transfusion',
    timestamp: '2025-05-10 10:20'
  }
];

export const INITIAL_RADIOLOGY_ORDERS: RadiologyOrder[] = [
  {
    radiologyOrderId: 'RAD-2025-0182',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    modality: 'CT',
    targetRegion: 'Whole Body Trauma CT (Head, Chest, Abdomen, Pelvis)',
    scanImageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    diagnosticFindings: 'Acute right sided hemopneumothorax with rib fractures 5th-7th. Liver laceration Grade II noted in segment VI. No active intracranial bleed.',
    radiologistSignature: 'Dr. Bethlehem Girma, MD (Consultant Radiologist)',
    status: 'Report Verified',
    orderedBy: 'Dr. Yonas Alemayehu (Emergency)',
    scheduledDateTime: '2025-05-10 10:15'
  },
  {
    radiologyOrderId: 'RAD-2025-0183',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    modality: 'X-Ray',
    targetRegion: 'Chest PA View',
    scanImageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
    diagnosticFindings: 'Lungs are clear bilaterally with no active consolidation or pleural effusion. Cardiothoracic ratio normal.',
    radiologistSignature: 'Dr. Bethlehem Girma, MD (Consultant Radiologist)',
    status: 'Report Verified',
    orderedBy: 'Dr. Dawit Haile, MD',
    scheduledDateTime: '2025-05-10 09:50'
  },
  {
    radiologyOrderId: 'RAD-2025-0184',
    mrn: 'FPH-2025-0104',
    patientName: 'Tsehay Nigus Bekele',
    modality: 'Ultrasound',
    targetRegion: 'Obstetric Ultrasound (Term Assessment)',
    scanImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    diagnosticFindings: 'Single live intrauterine pregnancy in cephalic presentation. Adequate amniotic fluid index (AFI 13cm). Placenta anterior, Grade III maturity.',
    radiologistSignature: 'Dr. Bethlehem Girma, MD',
    status: 'Report Verified',
    orderedBy: 'Dr. Dawit Haile, MD',
    scheduledDateTime: '2025-05-10 10:50'
  }
];

export const INITIAL_DRUG_INVENTORY: DrugItem[] = [
  {
    drugCode: 'DRG-COART-01',
    genericName: 'Artemether 20mg + Lumefantrine 120mg',
    brandName: 'Coartem 20/120',
    category: 'Antimalarial',
    batchNumber: 'BT-2025-089A',
    expiryDate: '2026-11-30',
    stockOnHand: 420,
    reorderTriggerLevel: 100,
    supplierCode: 'SUP-EPSS-001',
    unitSalePrice: 180,
    storeLocation: 'Main Pharmacy'
  },
  {
    drugCode: 'DRG-PARA-500',
    genericName: 'Paracetamol 500mg Tablets',
    brandName: 'Panadol / Generic Paracetamol',
    category: 'Analgesic & Antipyretic',
    batchNumber: 'BT-2025-104B',
    expiryDate: '2027-04-15',
    stockOnHand: 1850,
    reorderTriggerLevel: 300,
    supplierCode: 'SUP-CADILA-004',
    unitSalePrice: 15,
    storeLocation: 'Main Pharmacy'
  },
  {
    drugCode: 'DRG-CEFTR-1G',
    genericName: 'Ceftriaxone Sodium 1g Powder for Injection',
    brandName: 'Rocephin / Generic Ceftriaxone',
    category: 'Antibiotic (Cephalosporin)',
    batchNumber: 'BT-2025-062C',
    expiryDate: '2026-08-20',
    stockOnHand: 310,
    reorderTriggerLevel: 80,
    supplierCode: 'SUP-EPSS-001',
    unitSalePrice: 240,
    storeLocation: 'Main Pharmacy'
  },
  {
    drugCode: 'DRG-METRO-500',
    genericName: 'Metronidazole 500mg/100ml IV Infusion',
    brandName: 'Flagyl IV',
    category: 'Antibacterial & Antiprotozoal',
    batchNumber: 'BT-2025-033D',
    expiryDate: '2026-09-10',
    stockOnHand: 140,
    reorderTriggerLevel: 50,
    supplierCode: 'SUP-BROWN-008',
    unitSalePrice: 165,
    storeLocation: 'Emergency Pharmacy'
  },
  {
    drugCode: 'DRG-ADREN-1MG',
    genericName: 'Adrenaline (Epinephrine) 1mg/ml Ampoule',
    brandName: 'EpiPen / Adrenaline Inj',
    category: 'Emergency & Resuscitation',
    batchNumber: 'BT-2025-012E',
    expiryDate: '2026-01-31',
    stockOnHand: 45,
    reorderTriggerLevel: 30,
    supplierCode: 'SUP-EPSS-001',
    unitSalePrice: 85,
    storeLocation: 'Emergency Pharmacy'
  },
  {
    drugCode: 'DRG-RL-1000',
    genericName: 'Ringers Lactate 1000ml IV Infusion',
    brandName: 'Hartmanns Solution',
    category: 'IV Replacement Fluids',
    batchNumber: 'BT-2025-220F',
    expiryDate: '2027-12-31',
    stockOnHand: 280,
    reorderTriggerLevel: 75,
    supplierCode: 'SUP-SINO-003',
    unitSalePrice: 95,
    storeLocation: 'IPD Satellite'
  },
  {
    drugCode: 'DRG-AMOXI-500',
    genericName: 'Amoxicillin 500mg Capsules',
    brandName: 'Amoxil',
    category: 'Antibiotic (Penicillin)',
    batchNumber: 'BT-2024-991G',
    expiryDate: '2025-06-15', // Near expiry warning!
    stockOnHand: 65,
    reorderTriggerLevel: 150, // Low stock warning!
    supplierCode: 'SUP-CADILA-004',
    unitSalePrice: 28,
    storeLocation: 'Main Pharmacy'
  },
  {
    drugCode: 'DRG-OXYTOC-10',
    genericName: 'Oxytocin 10 IU/ml Injection',
    brandName: 'Pitocin',
    category: 'Obstetric & Uterotonic',
    batchNumber: 'BT-2025-045H',
    expiryDate: '2026-07-25',
    stockOnHand: 190,
    reorderTriggerLevel: 50,
    supplierCode: 'SUP-EPSS-001',
    unitSalePrice: 120,
    storeLocation: 'IPD Satellite'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    rxId: 'RX-2025-0541',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    prescriberName: 'Dr. Dawit Haile, MD',
    department: 'OPD Station 2',
    items: [
      {
        drugCode: 'DRG-COART-01',
        genericName: 'Artemether 20mg + Lumefantrine 120mg (Coartem)',
        dosage: '4 tabs',
        frequency: 'Stat then at 8h, 24h, 36h, 48h, 60h (Twice daily x 3 days)',
        durationDays: 3,
        quantity: 24,
        unitPrice: 180,
        dispensedStatus: 'Pending'
      },
      {
        drugCode: 'DRG-PARA-500',
        genericName: 'Paracetamol 500mg Tablets',
        dosage: '2 tabs (1000mg)',
        frequency: 'Three times daily after meals',
        durationDays: 3,
        quantity: 18,
        unitPrice: 15,
        dispensedStatus: 'Pending'
      }
    ],
    isSigned: true,
    status: 'Prescribed',
    createdAt: '2025-05-10 09:40'
  },
  {
    rxId: 'RX-2025-0540',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    prescriberName: 'Dr. Michael Assefa, FACS',
    department: 'Surgical Ward',
    items: [
      {
        drugCode: 'DRG-CEFTR-1G',
        genericName: 'Ceftriaxone Sodium 1g IV Inj',
        dosage: '1g IV',
        frequency: 'Once daily',
        durationDays: 3,
        quantity: 3,
        unitPrice: 240,
        dispensedStatus: 'Dispensed'
      },
      {
        drugCode: 'DRG-METRO-500',
        genericName: 'Metronidazole 500mg IV',
        dosage: '500mg IV',
        frequency: 'Every 8 hours',
        durationDays: 3,
        quantity: 9,
        unitPrice: 165,
        dispensedStatus: 'Dispensed'
      }
    ],
    isSigned: true,
    status: 'Dispensed',
    createdAt: '2025-05-09 16:30'
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    billId: 'BILL-2025-0810',
    invoiceId: 'BILL-2025-0810',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Kebede Wolde',
    payerClass: 'CBHI (Community Health Insurance)',
    items: [
      { id: '1', description: 'OPD Consultation Fee (Station 2)', department: 'OPD', quantity: 1, unitPrice: 150, total: 150 },
      { id: '2', description: 'Malaria RDT + Giemsa Blood Film', department: 'Laboratory', quantity: 1, unitPrice: 120, total: 120 },
      { id: '3', description: 'Complete Blood Count (CBC)', department: 'Laboratory', quantity: 1, unitPrice: 180, total: 180 },
      { id: '4', description: 'Coartem 20/120 (24 tablets)', department: 'Pharmacy', quantity: 1, unitPrice: 180, total: 180 },
      { id: '5', description: 'Paracetamol 500mg (18 tablets)', department: 'Pharmacy', quantity: 1, unitPrice: 30, total: 30 }
    ],
    subtotal: 660,
    insuranceDiscount: 561, // 85% CBHI government subsidy coverage
    amountPayable: 99, // 15% co-pay
    totalAmount: 99,
    status: 'Unpaid',
    createdAt: '2025-05-10 10:00'
  },
  {
    billId: 'BILL-2025-0809',
    invoiceId: 'BILL-2025-0809',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    payerClass: 'Corporate Partner',
    items: [
      { id: '1', description: 'Emergency Laparoscopic Appendectomy', department: 'Surgery', quantity: 1, unitPrice: 4800, total: 4800 },
      { id: '2', description: 'Operating Theater & Anesthesia Pack', department: 'Surgery', quantity: 1, unitPrice: 2200, total: 2200 },
      { id: '3', description: 'Surgical Ward Inpatient Bed (2 nights)', department: 'IPD', quantity: 2, unitPrice: 600, total: 1200 },
      { id: '4', description: 'IV Antibiotics & Fluids Pack', department: 'Pharmacy', quantity: 1, unitPrice: 1450, total: 1450 },
      { id: '5', description: 'Pre & Post-Op Laboratory Investigations', department: 'Laboratory', quantity: 1, unitPrice: 850, total: 850 }
    ],
    subtotal: 10500,
    insuranceDiscount: 9450, // 90% Corporate coverage
    amountPayable: 1050,
    totalAmount: 1050,
    status: 'Paid',
    paymentMethod: 'Telebirr',
    transactionRef: 'TLB-99882233',
    cashierName: 'Tigist Mengistu (Cashier 01)',
    receiptNumber: 'RCP-2025-00481',
    createdAt: '2025-05-10 08:00'
  },
  {
    billId: 'BILL-2025-0808',
    invoiceId: 'BILL-2025-0808',
    mrn: 'FPH-2025-0102',
    patientName: 'Fatuma Mohammed Ali',
    payerClass: 'Cash',
    items: [
      { id: '1', description: 'Emergency Triage & Trauma Resuscitation', department: 'Emergency', quantity: 1, unitPrice: 800, total: 800 },
      { id: '2', description: 'Chest X-Ray & FAST Ultrasound', department: 'Radiology', quantity: 1, unitPrice: 650, total: 650 },
      { id: '3', description: 'Emergency IV Fluids & Meds', department: 'Pharmacy', quantity: 1, unitPrice: 380, total: 380 }
    ],
    subtotal: 1830,
    insuranceDiscount: 0,
    amountPayable: 1830,
    totalAmount: 1830,
    status: 'Unpaid',
    createdAt: '2025-05-10 09:15'
  }
];

export const INITIAL_AUDIT_LOGS: Array<{
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  details: string;
}> = [
  {
    id: 'LOG-001',
    timestamp: '2025-05-10 10:35:12',
    userName: 'Dr. Dawit Haile',
    userRole: 'OPD_DOCTOR',
    module: 'OPD Consultation',
    action: 'Prescription Signed',
    details: 'Digital signature applied to Rx-2025-0541 (Coartem + Paracetamol) for Abebe Kebede'
  },
  {
    id: 'LOG-002',
    timestamp: '2025-05-10 10:20:04',
    userName: 'Abeba Teshome',
    userRole: 'RECEPTIONIST',
    module: 'Registration',
    action: 'Patient Registered',
    details: 'Created master record FPH-2025-0105 (Kaleb Desta) with CBHI eligibility check'
  },
  {
    id: 'LOG-003',
    timestamp: '2025-05-10 10:05:40',
    userName: 'Amanuel Kebede',
    userRole: 'LAB_TECH',
    module: 'Laboratory',
    action: 'Lab Results Verified',
    details: 'Verified Malaria RDT (Positive) & CBC parameters for Lab Order LAB-2025-011'
  },
  {
    id: 'LOG-004',
    timestamp: '2025-05-10 09:50:22',
    userName: 'Tigist Mengistu',
    userRole: 'CASHIER',
    module: 'Cashier & POS',
    action: 'Invoice Settled',
    details: 'Collected ETB 1,050.00 via Telebirr (Ref: TLB-99882233) for Invoice BILL-2025-0809'
  },
  {
    id: 'LOG-005',
    timestamp: '2025-05-10 09:15:10',
    userName: 'Nurse Rahel Tadesse',
    userRole: 'IPD_NURSE',
    module: 'IPD & Bed Control',
    action: 'Bed Allocation',
    details: 'Admitted Mulugeta Tesfaye to Surgical Ward Bed 03'
  },
  {
    id: 'LOG-006',
    timestamp: '2025-05-10 08:30:00',
    userName: 'Dr. Michael Assefa',
    userRole: 'OT_COORDINATOR',
    module: 'Operation Theatre',
    action: 'WHO Checklist Completed',
    details: 'Signed off Time Out and Sign Out for Emergency Appendectomy (SURG-2025-044)'
  }
];


export const INITIAL_TRANSACTIONS: CashierTransaction[] = [
  {
    transactionId: 'TXN-9021',
    billId: 'BILL-2025-0809',
    receiptNumber: 'RCP-2025-00481',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    paymentMethod: 'Telebirr',
    amountReceived: 1050,
    cashierId: 'Tigist Mengistu (Cashier 01)',
    registerId: 'REG-MAIN-01',
    timestamp: '2025-05-10 08:15',
    closingBalance: 18450
  }
];

export const INITIAL_TILL_SESSION: TillSession = {
  sessionId: 'SES-2025-0510-01',
  cashierId: 'USR-08',
  cashierName: 'Tigist Mengistu',
  registerId: 'REG-MAIN-01',
  openingTime: '2025-05-10 07:30',
  openingBalance: 5000,
  totalCashReceived: 3450,
  totalDigitalReceived: 14200,
  status: 'Open'
};

export const INITIAL_STAFF: StaffEmployee[] = [
  {
    employeeId: 'EMP-FPH-001',
    nationalIdNumber: 'ETH-11223344',
    fullName: 'Dr. Michael Assefa, FACS',
    jobTitle: 'Chief Surgeon & HOD Surgery',
    department: 'Surgery',
    dateOfHiring: '2019-02-15',
    academicQualifications: ['MD (Addis Ababa University)', 'Fellow of the American College of Surgeons (FACS)'],
    activeCertifications: [
      { name: 'Ethiopian Medical Licensure Board', expiryDate: '2026-12-31', valid: true },
      { name: 'Advanced Trauma Life Support (ATLS)', expiryDate: '2026-06-30', valid: true }
    ],
    leaveBalances: { annualLeave: 18, sickLeave: 12, maternityPaternity: 0, studyLeave: 5 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 911 112 233'
  },
  {
    employeeId: 'EMP-FPH-002',
    nationalIdNumber: 'ETH-22334455',
    fullName: 'Dr. Dawit Haile, MD',
    jobTitle: 'Senior Consultant Internist',
    department: 'OPD',
    dateOfHiring: '2020-08-01',
    academicQualifications: ['MD, Internal Medicine Residency (Jimma University)'],
    activeCertifications: [
      { name: 'Medical Practicing License (Federal MoH)', expiryDate: '2026-10-15', valid: true },
      { name: 'Basic Life Support (BLS)', expiryDate: '2026-04-20', valid: true }
    ],
    leaveBalances: { annualLeave: 14, sickLeave: 10, maternityPaternity: 0, studyLeave: 3 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 911 223 344'
  },
  {
    employeeId: 'EMP-FPH-003',
    nationalIdNumber: 'ETH-33445566',
    fullName: 'Nurse Rahel Tadesse, BSN',
    jobTitle: 'Charge Nurse & Bed Allocation Lead',
    department: 'IPD',
    dateOfHiring: '2021-03-10',
    academicQualifications: ['BSc in Nursing (Hawassa University)'],
    activeCertifications: [
      { name: 'Nursing Council Registration License', expiryDate: '2026-09-01', valid: true },
      { name: 'Infection Prevention & Patient Safety (IPPS)', expiryDate: '2025-12-31', valid: true }
    ],
    leaveBalances: { annualLeave: 12, sickLeave: 14, maternityPaternity: 0, studyLeave: 0 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 912 334 455'
  },
  {
    employeeId: 'EMP-FPH-004',
    nationalIdNumber: 'ETH-44556677',
    fullName: 'Pharm. Henok Worku, BPharm',
    jobTitle: 'Lead Clinical Pharmacist',
    department: 'Pharmacy',
    dateOfHiring: '2021-11-20',
    academicQualifications: ['BPharm (Gondar University)'],
    activeCertifications: [
      { name: 'Pharmacy Board Professional License', expiryDate: '2027-01-15', valid: true }
    ],
    leaveBalances: { annualLeave: 16, sickLeave: 15, maternityPaternity: 0, studyLeave: 2 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 913 445 566'
  },
  {
    employeeId: 'EMP-FPH-005',
    nationalIdNumber: 'ETH-55667788',
    fullName: 'Amanuel Kebede, MLS',
    jobTitle: 'Lead Laboratory Technologist',
    department: 'Laboratory',
    dateOfHiring: '2022-01-15',
    academicQualifications: ['BSc Medical Laboratory Sciences'],
    activeCertifications: [
      { name: 'EPHI Laboratory Quality Certification', expiryDate: '2026-05-18', valid: true }
    ],
    leaveBalances: { annualLeave: 10, sickLeave: 12, maternityPaternity: 0, studyLeave: 4 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 914 556 677'
  },
  {
    employeeId: 'EMP-FPH-006',
    nationalIdNumber: 'ETH-66778899',
    fullName: 'Dr. Hana Tadesse, MD',
    jobTitle: 'Consultant Pediatrician',
    department: 'OPD',
    dateOfHiring: '2021-05-12',
    academicQualifications: ['MD, Pediatrics Specialty (Addis Ababa University)'],
    activeCertifications: [
      { name: 'Pediatric Advanced Life Support (PALS)', expiryDate: '2026-11-30', valid: true },
      { name: 'Ethiopian Medical Association License', expiryDate: '2027-04-10', valid: true }
    ],
    leaveBalances: { annualLeave: 15, sickLeave: 10, maternityPaternity: 0, studyLeave: 2 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 915 667 788'
  },
  {
    employeeId: 'EMP-FPH-007',
    nationalIdNumber: 'ETH-77889900',
    fullName: 'Dr. Solomon Bekele, MD',
    jobTitle: 'Emergency Medicine Specialist & Resus Lead',
    department: 'Emergency',
    dateOfHiring: '2020-02-18',
    academicQualifications: ['MD, Emergency Medicine & Critical Care'],
    activeCertifications: [
      { name: 'Advanced Cardiac Life Support (ACLS)', expiryDate: '2026-08-14', valid: true },
      { name: 'Disaster Triage Command Certification', expiryDate: '2026-12-01', valid: true }
    ],
    leaveBalances: { annualLeave: 11, sickLeave: 14, maternityPaternity: 0, studyLeave: 3 },
    currentShift: 'Evening (15:00-23:00)',
    status: 'Active',
    phone: '+251 916 778 899'
  },
  {
    employeeId: 'EMP-FPH-008',
    nationalIdNumber: 'ETH-88990011',
    fullName: 'Dr. Bethlehem Desta, MD',
    jobTitle: 'Consultant Radiologist & PACS Director',
    department: 'Radiology',
    dateOfHiring: '2022-04-01',
    academicQualifications: ['MD, Diagnostic Radiology Specialist'],
    activeCertifications: [
      { name: 'Radiation Protection Board Certification', expiryDate: '2027-03-20', valid: true }
    ],
    leaveBalances: { annualLeave: 20, sickLeave: 15, maternityPaternity: 0, studyLeave: 0 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 917 889 900'
  },
  {
    employeeId: 'EMP-FPH-009',
    nationalIdNumber: 'ETH-99001122',
    fullName: 'Sister Tigist Mengistu, RN',
    jobTitle: 'Senior Operating Theater Scrub Nurse',
    department: 'Surgery',
    dateOfHiring: '2019-09-01',
    academicQualifications: ['BSc in Perioperative Nursing'],
    activeCertifications: [
      { name: 'Sterile Technique & Asepsis Master Certificate', expiryDate: '2026-07-22', valid: true }
    ],
    leaveBalances: { annualLeave: 8, sickLeave: 12, maternityPaternity: 0, studyLeave: 0 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 918 990 011'
  },
  {
    employeeId: 'EMP-FPH-010',
    nationalIdNumber: 'ETH-10293847',
    fullName: 'Ephrem Tesfaye, MBA',
    jobTitle: 'Hospital Administrator & HR Director',
    department: 'Administration',
    dateOfHiring: '2018-01-10',
    academicQualifications: ['MBA Healthcare Management', 'BA Public Administration'],
    activeCertifications: [
      { name: 'Certified Healthcare Executive (CHE)', expiryDate: '2027-12-31', valid: true }
    ],
    leaveBalances: { annualLeave: 22, sickLeave: 18, maternityPaternity: 0, studyLeave: 10 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 919 001 122'
  },
  {
    employeeId: 'EMP-FPH-011',
    nationalIdNumber: 'ETH-20394857',
    fullName: 'Tewodros Girma, BA',
    jobTitle: 'Head Cashier & Billing Supervisor',
    department: 'Cashier & Finance',
    dateOfHiring: '2021-07-15',
    academicQualifications: ['BA Accounting & Finance (Addis Ababa University)'],
    activeCertifications: [
      { name: 'National Electronic Billing & POS Compliance', expiryDate: '2026-11-15', valid: true }
    ],
    leaveBalances: { annualLeave: 14, sickLeave: 10, maternityPaternity: 0, studyLeave: 2 },
    currentShift: 'Morning (07:00-15:00)',
    status: 'Active',
    phone: '+251 920 112 233'
  },
  {
    employeeId: 'EMP-FPH-012',
    nationalIdNumber: 'ETH-30495867',
    fullName: 'Nurse Kidist Hailu, RN',
    jobTitle: 'Pediatric & Neonatal Inpatient Nurse',
    department: 'IPD',
    dateOfHiring: '2022-09-10',
    academicQualifications: ['Diploma in Clinical Nursing, BSc Neonatology Track'],
    activeCertifications: [
      { name: 'Neonatal Resuscitation Program (NRP)', expiryDate: '2026-05-30', valid: true }
    ],
    leaveBalances: { annualLeave: 16, sickLeave: 14, maternityPaternity: 0, studyLeave: 0 },
    currentShift: 'Evening (15:00-23:00)',
    status: 'Active',
    phone: '+251 921 223 344'
  },
  {
    employeeId: 'EMP-FPH-013',
    nationalIdNumber: 'ETH-40596877',
    fullName: 'Nurse Hana Kebede, RN',
    jobTitle: 'Night Shift Supervisor & Triage Nurse',
    department: 'Emergency',
    dateOfHiring: '2021-02-01',
    academicQualifications: ['BSc in Emergency & Critical Care Nursing'],
    activeCertifications: [
      { name: 'Trauma Nursing Core Course (TNCC)', expiryDate: '2026-08-30', valid: true }
    ],
    leaveBalances: { annualLeave: 12, sickLeave: 12, maternityPaternity: 0, studyLeave: 0 },
    currentShift: 'Night (23:00-07:00)',
    status: 'Active',
    phone: '+251 922 334 455'
  },
  {
    employeeId: 'EMP-FPH-014',
    nationalIdNumber: 'ETH-50697887',
    fullName: 'Kidus Wondwossen, MLS',
    jobTitle: 'Blood Bank Specialist & Serologist',
    department: 'Laboratory',
    dateOfHiring: '2023-01-20',
    academicQualifications: ['BSc Medical Laboratory Sciences, Immunohematology Cert.'],
    activeCertifications: [
      { name: 'Transfusion Medicine Quality Assurance', expiryDate: '2027-02-10', valid: true }
    ],
    leaveBalances: { annualLeave: 18, sickLeave: 15, maternityPaternity: 0, studyLeave: 1 },
    currentShift: 'Evening (15:00-23:00)',
    status: 'Active',
    phone: '+251 923 445 566'
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    requestId: 'LR-2025-024',
    employeeId: 'EMP-FPH-002',
    employeeName: 'Dr. Dawit Haile, MD',
    department: 'OPD',
    leaveType: 'Annual Leave',
    startDate: '2025-06-01',
    endDate: '2025-06-07',
    days: 6,
    reason: 'Family vacation & medical conference attendance',
    status: 'Approved'
  },
  {
    requestId: 'LR-2025-025',
    employeeId: 'EMP-FPH-005',
    employeeName: 'Amanuel Kebede, MLS',
    department: 'Laboratory',
    leaveType: 'Study / Training',
    startDate: '2025-06-15',
    endDate: '2025-06-18',
    days: 4,
    reason: 'Advanced Biosafety Level III Workshop at National Institute',
    status: 'Pending'
  },
  {
    requestId: 'LR-2025-026',
    employeeId: 'EMP-FPH-009',
    employeeName: 'Sister Tigist Mengistu, RN',
    department: 'Surgery',
    leaveType: 'Annual Leave',
    startDate: '2025-07-02',
    endDate: '2025-07-06',
    days: 5,
    reason: 'Annual personal leave',
    status: 'Pending'
  },
  {
    requestId: 'LR-2025-027',
    employeeId: 'EMP-FPH-007',
    employeeName: 'Dr. Solomon Bekele, MD',
    department: 'Emergency',
    leaveType: 'Study / Training',
    startDate: '2025-05-25',
    endDate: '2025-05-28',
    days: 3,
    reason: 'National Trauma & Disaster Preparedness Sim-Training',
    status: 'Approved'
  }
];

export const INITIAL_SURGICAL_PROCEDURES: SurgicalProcedure[] = [
  {
    surgeryId: 'SURG-2025-044',
    mrn: 'FPH-2025-0103',
    patientName: 'Mulugeta Tesfaye Abate',
    ageGender: '34 yrs, Male',
    bloodGroup: 'O+ (Rh Positive)',
    targetOperatingRoom: 'OR 1 (General & Ortho)',
    operatingTheatre: 'OR-1 (Main General & Orthopedic Suite)',
    leadSurgeon: 'Dr. Michael Assefa, MD, FACS (Consultant Surgeon)',
    assistantSurgeon: 'Dr. Nahom Zewdu, MD (Surgical Resident)',
    anesthetist: 'Dr. Yared Getachew, MD (Senior Anesthesiologist)',
    anaesthetist: 'Dr. Yared Getachew, MD (Senior Anesthesiologist)',
    scrubNurse: 'Sister Roman Alemu, RN',
    circulatingNurse: 'Nurse Tigist Mengistu, RN',
    surgicalProcedureName: 'Emergency Laparoscopic Appendectomy & Peritoneal Washout',
    procedureName: 'Emergency Laparoscopic Appendectomy & Peritoneal Washout',
    preOpDiagnosis: 'Acute Gangrenous Appendicitis with Localized Peritonitis',
    postOpDiagnosis: 'Suppurative Retrocecal Appendicitis with Seropurulent Exudate',
    anesthesiaType: 'General Anesthesia',
    asaGrade: 'ASA II',
    scheduleDateTime: '2025-05-09 18:30',
    scheduledDateTime: '2025-05-09 18:30',
    incisionTime: '18:45',
    closureTime: '19:40',
    estimatedBloodLossMl: 45,
    bloodUnitsTransfused: 0,
    ivFluidsMl: 1200,
    specimensCollected: 'Appendix specimen sent to Histopathology (Ref #HIST-2025-089)',
    implantsUsed: 'Polymer Ligating Hem-o-lok Clips (Medium-Large x 3)',
    spongeNeedleCountVerified: true,
    postOpCarePlan: 'Transfer to Surgical Ward Bed 03. IV Ceftriaxone 1g OD + Metronidazole 500mg TID. Maintain NPO for 8h then clear liquid diet. Monitor surgical drain output.',
    equipmentChecklist: [
      { item: 'Laparoscopic Tower & 10mm 30-deg Scope', checked: true },
      { item: 'Endo-GIA Vascular Stapler & Clips', checked: true },
      { item: 'Suction & Irrigation Cannula', checked: true },
      { item: 'Sterile Laparotomy & Laparoscopy Instrument Set', checked: true },
      { item: 'Electrocautery Unit (Bovie)', checked: true }
    ],
    whoChecklist: {
      signIn: true,
      timeOut: true,
      signOut: true
    },
    surgicalNotes: 'Under general endotracheal anesthesia, pneumoperitoneum achieved via Hasson open technique. 10mm umbilical port and two 5mm working ports placed. Inflamed retrocecal appendix dissected, base ligated with polymer clips, divided. Pelvis irrigated with 500ml warm normal saline. Hemostasis confirmed.',
    status: 'PACU Recovery'
  },
  {
    surgeryId: 'SURG-2025-045',
    mrn: 'FPH-2025-0104',
    patientName: 'Tsehay Nigus Bekele',
    ageGender: '28 yrs, Female',
    bloodGroup: 'B+ (Rh Positive)',
    targetOperatingRoom: 'OR 3 (Obstetrics & Emergency)',
    operatingTheatre: 'OR-3 (Maternity & Emergency Suite)',
    leadSurgeon: 'Dr. Alula Bekele, MD (Consultant Obstetrician & Gynecologist)',
    assistantSurgeon: 'Dr. Dawit Haile, MD',
    anesthetist: 'Dr. Solomon Bekele, MD (Consultant Anesthetist)',
    anaesthetist: 'Dr. Solomon Bekele, MD (Consultant Anesthetist)',
    scrubNurse: 'Nurse Kidist Hailu, RN',
    circulatingNurse: 'Nurse Hana Kebede, RN',
    surgicalProcedureName: 'Emergency Lower Segment Cesarean Section (Indication: Fetal Bradycardia)',
    procedureName: 'Emergency Lower Segment Cesarean Section (Indication: Fetal Bradycardia)',
    preOpDiagnosis: 'G2P1 at 39+2 WGA in active labor with persistent category III fetal heart decelerations',
    postOpDiagnosis: 'Live male infant delivered (Birth Weight: 3.4 kg, APGAR 8/1, 9/5). Intact placenta delivered complete.',
    anesthesiaType: 'Spinal Block',
    asaGrade: 'ASA E (Emergency)',
    scheduleDateTime: '2025-05-10 13:00',
    scheduledDateTime: '2025-05-10 13:00',
    incisionTime: '13:08',
    closureTime: '13:52',
    estimatedBloodLossMl: 450,
    bloodUnitsTransfused: 0,
    ivFluidsMl: 1500,
    specimensCollected: 'Placental cord blood sample for ABO/Rh and bilirubin screening',
    implantsUsed: 'None',
    spongeNeedleCountVerified: true,
    postOpCarePlan: 'Post-op monitoring in Maternity Recovery. Oxytocin infusion 20 IU in 1L RL at 125ml/h. Monitor lochia and uterine contraction. Initiate breastfeeding within 1h.',
    equipmentChecklist: [
      { item: 'Cesarean Delivery Instrument Tray', checked: true },
      { item: 'Neonatal Resuscitation Warmer & Bag-Valve-Mask', checked: true },
      { item: 'Cord Clamps & Suction Catheters', checked: true },
      { item: 'Spinal Needle 25G & Bupivacaine Heavy 0.5%', checked: true }
    ],
    whoChecklist: {
      signIn: true,
      timeOut: true,
      signOut: true
    },
    surgicalNotes: 'Spinal anesthesia with 2.2ml hyperbaric Bupivacaine at L3-L4. Pfannenstiel incision. Lower uterine segment opened transversally. Healthy vigorous male infant delivered with cephalic presentation. Uterus closed in double layers with continuous Vicryl 1. Excellent uterine tone post-oxytocin.',
    status: 'Completed'
  },
  {
    surgeryId: 'SURG-2025-046',
    mrn: 'FPH-2025-0102',
    patientName: 'Hiwot Tadesse Girma',
    ageGender: '42 yrs, Female',
    bloodGroup: 'A- (Rh Negative)',
    targetOperatingRoom: 'OR 1 (General & Ortho)',
    operatingTheatre: 'OR-1 (Main General & Orthopedic Suite)',
    leadSurgeon: 'Dr. Michael Assefa, MD, FACS (Consultant Surgeon)',
    assistantSurgeon: 'Dr. Nahom Zewdu, MD',
    anesthetist: 'Dr. Yared Getachew, MD',
    anaesthetist: 'Dr. Yared Getachew, MD',
    scrubNurse: 'Sister Roman Alemu, RN',
    circulatingNurse: 'Sister Tigist Mengistu, RN',
    surgicalProcedureName: 'Thoracoscopy & Chest Tube Revision for Traumatic Hemothorax',
    procedureName: 'Thoracoscopy & Chest Tube Revision for Traumatic Hemothorax',
    preOpDiagnosis: 'Persistent Left Hemothorax secondary to polytrauma and multiple rib fractures',
    postOpDiagnosis: 'Evacuated 450ml clotted hemothorax; 28Fr chest drain placed with underwater seal',
    anesthesiaType: 'General Anesthesia',
    asaGrade: 'ASA III',
    scheduleDateTime: '2025-05-10 15:30',
    scheduledDateTime: '2025-05-10 15:30',
    incisionTime: '15:40',
    closureTime: '',
    estimatedBloodLossMl: 200,
    bloodUnitsTransfused: 1,
    ivFluidsMl: 1000,
    specimensCollected: 'Pleural fluid cytology and Gram stain sent to Clinical Lab',
    implantsUsed: 'Thoracic Catheter 28Fr with trocar (Medtronic)',
    spongeNeedleCountVerified: true,
    postOpCarePlan: 'Transfer directly to ICU Bed 01. Keep chest tube on -20 cmH2O continuous wall suction. Arterial blood gas analysis at 1h post-op.',
    equipmentChecklist: [
      { item: 'VATS Thoracoscopy Set & 5mm Scope', checked: true },
      { item: 'Dual-Chamber Underwater Seal Chest Drainage Unit', checked: true },
      { item: 'High-Volume Thoracic Suction Line', checked: true },
      { item: 'Crossmatched PRBC Blood Unit on Standby in OR Cooler', checked: true }
    ],
    whoChecklist: {
      signIn: true,
      timeOut: true,
      signOut: false
    },
    surgicalNotes: 'Patient positioned in right lateral decubitus. Double-lumen tube intubation. Video-assisted thoracic evacuation of clotted hemothorax. Intercostal hemostasis secured with bipolar electrocautery.',
    status: 'In Progress'
  },
  {
    surgeryId: 'SURG-2025-047',
    mrn: 'FPH-2025-0101',
    patientName: 'Abebe Bikila Mengistu',
    ageGender: '58 yrs, Male',
    bloodGroup: 'O+ (Rh Positive)',
    targetOperatingRoom: 'OR 2 (Laparoscopic / Minor)',
    operatingTheatre: 'OR-2 (Laparoscopic & Minor Suite)',
    leadSurgeon: 'Dr. Dawit Haile, MD (Consultant Surgeon)',
    assistantSurgeon: 'Dr. Nahom Zewdu, MD',
    anesthetist: 'Dr. Solomon Bekele, MD',
    anaesthetist: 'Dr. Solomon Bekele, MD',
    scrubNurse: 'Nurse Kidist Hailu, RN',
    circulatingNurse: 'Nurse Hana Kebede, RN',
    surgicalProcedureName: 'Elective Right Inguinal Hernia Lichtenstein Mesh Repair',
    procedureName: 'Elective Right Inguinal Hernia Lichtenstein Mesh Repair',
    preOpDiagnosis: 'Symptomatic Reducible Indirect Right Inguinal Hernia',
    postOpDiagnosis: 'Right Indirect Inguinal Hernia successfully repaired with Prolene mesh',
    anesthesiaType: 'Spinal Block',
    asaGrade: 'ASA I',
    scheduleDateTime: '2025-05-11 08:30',
    scheduledDateTime: '2025-05-11 08:30',
    estimatedBloodLossMl: 20,
    bloodUnitsTransfused: 0,
    ivFluidsMl: 800,
    specimensCollected: 'None',
    implantsUsed: 'Prolene Polypropylene Hernia Mesh 7.5cm x 15cm (Ethicon, Lot #PM-88219)',
    spongeNeedleCountVerified: false,
    postOpCarePlan: 'Post-op observation in Day Surgery Recovery for 4 hours. Oral analgesia (Paracetamol + Tramadol). Early ambulation encouraged. Discharge same day if voiding normal.',
    equipmentChecklist: [
      { item: 'Minor Surgical Hernia Instrument Set', checked: true },
      { item: 'Sterile Polypropylene Mesh 7.5x15cm', checked: true },
      { item: '2-0 and 3-0 Prolene Non-Absorbable Sutures', checked: true },
      { item: 'Local Infiltration 0.5% Bupivacaine for field block', checked: true }
    ],
    whoChecklist: {
      signIn: false,
      timeOut: false,
      signOut: false
    },
    surgicalNotes: 'Elective repair scheduled for tomorrow morning. Pre-op surgical consent signed, coagulation profile within normal limits.',
    status: 'Scheduled'
  },
  {
    surgeryId: 'SURG-2025-048',
    mrn: 'FPH-2025-0107',
    patientName: 'Genet Wolde Yohannes',
    ageGender: '46 yrs, Female',
    bloodGroup: 'AB+ (Rh Positive)',
    targetOperatingRoom: 'OR 2 (Laparoscopic / Minor)',
    operatingTheatre: 'OR-2 (Laparoscopic & Minor Suite)',
    leadSurgeon: 'Dr. Michael Assefa, MD, FACS (Consultant Surgeon)',
    assistantSurgeon: 'Dr. Dawit Haile, MD',
    anesthetist: 'Dr. Yared Getachew, MD',
    anaesthetist: 'Dr. Yared Getachew, MD',
    scrubNurse: 'Sister Roman Alemu, RN',
    circulatingNurse: 'Sister Tigist Mengistu, RN',
    surgicalProcedureName: 'Elective Laparoscopic Cholecystectomy (Symptomatic Cholelithiasis)',
    procedureName: 'Elective Laparoscopic Cholecystectomy (Symptomatic Cholelithiasis)',
    preOpDiagnosis: 'Recurrent Biliary Colic with Multiple Gallbladder Calculi on Ultrasound',
    postOpDiagnosis: 'Chronic Calculous Cholecystitis; intact gallbladder specimen retrieved',
    anesthesiaType: 'General Anesthesia',
    asaGrade: 'ASA II',
    scheduleDateTime: '2025-05-11 11:00',
    scheduledDateTime: '2025-05-11 11:00',
    estimatedBloodLossMl: 30,
    bloodUnitsTransfused: 0,
    ivFluidsMl: 1000,
    specimensCollected: 'Gallbladder sent for Routine Histopathology examination',
    implantsUsed: 'Titanium Hemostatic Endoclips (Medium x 6)',
    spongeNeedleCountVerified: false,
    postOpCarePlan: 'Transfer to Surgical Inpatient Ward Bed 02. IV Ketorolac 30mg Q8H, clear fluids at 6h post-op. Monitor vital signs and port site dressings.',
    equipmentChecklist: [
      { item: 'Full 4-Port Laparoscopy Instrument Set & 30-deg Camera', checked: true },
      { item: 'Endo-Catch Tissue Retrieval Pouch', checked: true },
      { item: 'Titanium Clip Applier with sterile clip cartridges', checked: true },
      { item: 'Harmonic Scalpel / Ultrasonic Dissector', checked: true }
    ],
    whoChecklist: {
      signIn: false,
      timeOut: false,
      signOut: false
    },
    surgicalNotes: 'Patient consented for 4-port laparoscopic cholecystectomy. Pre-operative liver function tests and ultrasound reviewed.',
    status: 'Scheduled'
  }
];

export const REQUIREMENTS_ANALYSIS_DATA = [
  {
    department: 'Reception & Patient Registration',
    stations: 2,
    purpose: 'Handles initial patient intake, identity verification, and medical record assignment.',
    features: [
      'Duplicate patient detection based on full name, date of birth, and national ID',
      'Instant MRN generation and searchable patient records',
      'Configurable payer classification: Cash, CBHI, and Private Insurance',
      'Barcode label printing for patient ID cards and wristbands'
    ],
    coreFields: ['MRN', 'First/Middle/Last Name', 'DOB & Gender', 'National ID', 'Phone', 'Payer Class']
  },
  {
    department: 'Outpatient Department (OPD)',
    stations: 6,
    purpose: 'Supports outpatient evaluations, clinical charting, and medical orders across 6 doctor stations.',
    features: [
      'Single-screen summary of clinical history, allergies, and current medications',
      'Standardized entry for chief complaints, subjective HPI, and objective findings',
      'Integrated ICD-10 search tool for rapid diagnostic coding',
      'Electronic order submission for laboratory tests, radiology scans, and prescriptions'
    ],
    coreFields: ['Encounter ID', 'MRN', 'Chief Complaints', 'Subjective Symptoms', 'Objective Observations', 'ICD-10 Codes', 'Care Plan']
  },
  {
    department: 'Inpatient Department (IPD) & Bed Control',
    stations: 1,
    purpose: 'Tracks patient admissions, ward transfers, clinical monitoring, and discharge workflows.',
    features: [
      'Visual map showing active bed occupancy across Male, Female, ICU, Pediatric, Maternity, and Surgical wards',
      'Automated room and bed allocation based on patient clinical needs',
      'Ward transfer audit logs with complete timestamp histories',
      '4-department discharge clearance checklist (Clinical, Pharmacy, Cashier Billing, Nursing)'
    ],
    coreFields: ['Admission ID', 'MRN', 'Admitting Clinician', 'Ward Code', 'Bed Number', 'Admission Date/Time', 'Discharge Checklist']
  },
  {
    department: 'Emergency & Triage Room',
    stations: 1,
    purpose: 'Supports high-priority admissions, automated triage scoring, and trauma bay tracking.',
    features: [
      'Rapid trauma intake form to prioritize critical medical care',
      'Automated triage scoring based on GCS, BP, HR, SpO2, and respiratory rate (Red, Yellow, Green)',
      'Real-time tracking of active trauma bay assignments (Resus 1-2, Trauma 1-2, Obs A-B)',
      'Direct integration with core clinical database and fast escalation to OT / ICU'
    ],
    coreFields: ['Emergency ID', 'Triage Level (Red/Yellow/Green)', 'Presenting Complaint', 'Critical Vitals', 'Trauma Bay', 'Attending Staff']
  },
  {
    department: 'Clinical Laboratory',
    stations: 1,
    purpose: 'Manages diagnostic laboratory orders, sample barcodes, and verified results.',
    features: [
      'Electronic receipt of laboratory orders from OPD and IPD clinical offices',
      'Unique barcode labels for collected specimen tracking',
      'Automated panic/critical alert triggers for abnormal laboratory parameters',
      'Single-screen patient lab history, reference ranges, and verified tech sign-off'
    ],
    coreFields: ['Lab Order ID', 'Sample ID Barcode', 'Test Code', 'Collection Date/Time', 'Parametric Results', 'Verification Status']
  },
  {
    department: 'Transfusion Blood Bank',
    stations: 1,
    purpose: 'Tracks blood donor records, ABO/Rh inventory levels, and transfusion safety.',
    features: [
      'Blood donor registration, donor card IDs, and donation history logs',
      'Perpetual blood group and Rh factor inventory matrix (A+, A-, B+, B-, AB+, AB-, O+, O-)',
      '4-pathogen screening clearance verification (HIV, HBV, HCV, Syphilis)',
      'Major/minor crossmatching records with compatibility clearance certification'
    ],
    coreFields: ['Donor Card ID', 'Blood Group & Rh', 'Collection Date', 'Expiry Date', 'Screening Clearance', 'Crossmatch Result']
  },
  {
    department: 'Radiology & Digital Imaging (PACS)',
    stations: 1,
    purpose: 'Coordinates imaging orders, scan schedules, and digital diagnostic reports.',
    features: [
      'Coordinates imaging requests across modalities: X-Ray, Ultrasound, CT, MRI',
      'PACS digital viewer controls: Zoom, Brightness, Contrast, and Invert Grayscale',
      'Structured radiologist diagnostic finding reports with verified signatures',
      'Direct attachment of diagnostic image files to the patient clinical EMR'
    ],
    coreFields: ['Radiology Order ID', 'Modality (CT/X-Ray/US/MRI)', 'Target Region', 'Scan Image', 'Diagnostic Findings', 'Radiologist Signature']
  },
  {
    department: 'Pharmacy & Multi-Store Inventory',
    stations: 1,
    purpose: 'Manages pharmacy dispensing, purchase ordering, and perpetual multi-store stock levels.',
    features: [
      'Automated validation of physician prescription requests against live perpetual stock',
      'Automated near-expiry (<= 90 days) and low-stock batch threshold warnings',
      'Multi-store tracking: Main Pharmacy, Emergency Pharmacy, and IPD Satellite',
      'Restricts medication dispensing strictly to verified, digitally signed doctor prescriptions'
    ],
    coreFields: ['Drug Code', 'Generic Name', 'Batch Number', 'Expiry Date', 'Stock on Hand', 'Reorder Trigger', 'Store Location']
  },
  {
    department: 'Cashier, POS & CBHI Insurance',
    stations: 1,
    purpose: 'Handles fee collection, receipt generation, and insurer claim reconciliation.',
    features: [
      'Aggregated itemized billing directly from clinical orders (OPD, IPD, Lab, Rad, Rx)',
      'Multiple payment channels: Cash, Mobile POS (Telebirr, CBE Birr), and CBHI Insurance',
      'Community Based Health Insurance (CBHI) coverage verification and automated copay calculation',
      'Daily shift revenue reconciliation by payment method with drawer tracking'
    ],
    coreFields: ['Invoice ID', 'MRN', 'Itemized Charge Items', 'Payer Class', 'Amount Paid', 'Transaction Ref', 'Shift Revenue']
  },
  {
    department: 'Operation Theatre (OT) & Administration',
    stations: 1,
    purpose: 'Coordinates surgical scheduling, WHO safety checklists, role security, and audit logs.',
    features: [
      'Surgical suite scheduling (OR-1 Major Theatre, OR-2 Minor Theatre)',
      'Multidisciplinary surgical team allocation (Surgeon, Anaesthetist, Scrub Nurse, Circulator)',
      'WHO Surgical Safety Checklist protocol implementation (Sign In, Time Out, Sign Out)',
      'Role-Based Access Control (RBAC) and tamper-evident audit logging for all clinical transactions'
    ],
    coreFields: ['Surgery ID', 'MRN', 'Procedure Name', 'Operating Theatre', 'Lead Surgeon', 'WHO Checklist', 'Audit Action Logs']
  }
];

