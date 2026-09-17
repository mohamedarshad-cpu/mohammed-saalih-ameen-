export type HazardType =
  | 'Pothole'
  | 'Flooding'
  | 'Accident'
  | 'Poor Lighting'
  | 'Construction'
  | 'High Traffic';

export type HazardSeverity = 'Low' | 'Medium' | 'High';

export interface Hazard {
  id: string;
  type: HazardType;
  severity: HazardSeverity;
  description: string;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  reportedAt: string;
  imageUrl?: string;
  verifiedCount?: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskEvaluation {
  level: RiskLevel;
  label: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    progress: string;
    fillHex: string;
  };
}

export type RouteCategory = 'Fastest' | 'Safest' | 'Balanced';

export interface RouteOption {
  id: string;
  name: string; // "FASTEST", "SAFEST", "BALANCED"
  category: RouteCategory;
  travelTime: string;
  distance: string;
  baseRiskScore: number;
  rainRiskScore: number;
  riskScore: number; // dynamically computed based on heavy rain state
  riskLabel: string;
  safetyStatus: string;
  description: string;
  highlights: string[];
  coordinates: [number, number][];
}

export interface QuickSafetyStatus {
  safeZones: number;
  highRiskZones: number;
  activeReports: number;
}

export interface AdminDashboardStats {
  activeStudents: number;
  highRiskZones: number;
  totalReports: number;
  todayReports: number;
}

export interface LocationPreset {
  id: string;
  name: string;
  type: 'origin' | 'destination';
  coordinates: [number, number];
  address: string;
}

export interface NewHazardSubmission {
  location: string;
  hazardTypes: HazardType[];
  severity: HazardSeverity;
  description: string;
  photoUrl?: string;
  coordinates?: [number, number];
}
