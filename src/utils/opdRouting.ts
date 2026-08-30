import { OPD_STATIONS, OPDStationInfo } from '../data/mockData';

export interface RoomRecommendation {
  roomNumber: number;
  station: OPDStationInfo;
  reason: string;
  badge: string;
  suggestedPriority: 'Routine' | 'Urgent' | 'Elderly/Child';
  categoryKey: 'PEDIATRIC' | 'MATERNAL' | 'GERIATRIC' | 'SURGICAL' | 'CHRONIC' | 'GENERAL' | 'FAST_TRACK';
}

export const calculateAge = (dob: string): number => {
  if (!dob) return 25;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

export const getRecommendedOPDRoom = (
  dob: string,
  gender: 'Male' | 'Female' | 'Other' | string,
  reasonOrCategory?: string
): RoomRecommendation => {
  const age = calculateAge(dob);

  // 1. Pediatric check (<15 years old)
  if (age < 15) {
    const station = OPD_STATIONS.find((s) => s.stationNumber === 3) || OPD_STATIONS[2];
    return {
      roomNumber: 3,
      station,
      reason: `Child patient (Age ${age} yrs) → Auto-recommended to ${station.doctorName} (${station.specialty})`,
      badge: `👶 Child / Pediatric (Age ${age})`,
      suggestedPriority: 'Elderly/Child',
      categoryKey: 'PEDIATRIC'
    };
  }

  // 2. Maternal / OB-GYN check (Female 15-49)
  if (gender === 'Female' && age >= 15 && age <= 49 && reasonOrCategory?.toLowerCase().includes('anc')) {
    const station = OPD_STATIONS.find((s) => s.stationNumber === 5) || OPD_STATIONS[4];
    return {
      roomNumber: 5,
      station,
      reason: `Maternal / Antenatal patient → Recommended to ${station.doctorName} (${station.specialty})`,
      badge: '🤰 Maternal / ANC',
      suggestedPriority: 'Routine',
      categoryKey: 'MATERNAL'
    };
  }

  // 3. Geriatric / Senior check (>= 60 years old)
  if (age >= 60) {
    const station = OPD_STATIONS.find((s) => s.stationNumber === 2) || OPD_STATIONS[1];
    return {
      roomNumber: 2,
      station,
      reason: `Senior patient (Age ${age} yrs) → Recommended to ${station.doctorName} (${station.specialty}) for comprehensive internal care`,
      badge: `👴 Senior / Chronic Care (Age ${age})`,
      suggestedPriority: 'Elderly/Child',
      categoryKey: 'GERIATRIC'
    };
  }

  // 4. Default Adult General Triage
  const station = OPD_STATIONS.find((s) => s.stationNumber === 1) || OPD_STATIONS[0];
  return {
    roomNumber: 1,
    station,
    reason: `Adult patient (Age ${age} yrs) → Standard triage with ${station.doctorName} (${station.specialty})`,
    badge: `🩺 Adult General (Age ${age})`,
    suggestedPriority: 'Routine',
    categoryKey: 'GENERAL'
  };
};
