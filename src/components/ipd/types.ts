import { WardCode } from '../../types';

export type IPDSubTab = 'BED_MATRIX' | 'DOCTOR_ORDERS' | 'PEDIATRICS' | 'ACTIVE_INPATIENTS' | 'DISCHARGE_CLEARANCE' | 'ANALYTICS';

export interface WardInfo {
  code: WardCode;
  name: string;
  category: string;
  capacity: number;
}

export const WARDS_LIST: WardInfo[] = [
  { code: 'PEDIATRICS', name: 'Pediatric & Child Inpatient', category: 'Pediatric Care (<15 yrs)', capacity: 4 },
  { code: 'ICU', name: 'Intensive Care Unit (ICU)', category: 'Critical Care & Telemetry', capacity: 2 },
  { code: 'MATERNITY', name: 'Maternity & Labour Ward', category: 'Maternal & Obstetric Care', capacity: 2 },
  { code: 'SURGICAL', name: 'Surgical Inpatient Ward', category: 'Post-Operative Recovery', capacity: 3 },
  { code: 'GW-MALE', name: 'Male General Ward', category: 'Adult Medical Inpatient', capacity: 3 },
  { code: 'GW-FEMALE', name: 'Female General Ward', category: 'Adult Medical Inpatient', capacity: 2 }
];

export const getPatientAge = (dobString?: string): string => {
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

export const calculatePediatricFluids = (weightKg: number) => {
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
