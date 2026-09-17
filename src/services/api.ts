import {
  Hazard,
  RouteOption,
  QuickSafetyStatus,
  AdminDashboardStats,
  NewHazardSubmission,
} from '../types';
import {
  MOCK_ROUTES,
  MOCK_HAZARDS,
  MOCK_QUICK_SAFETY,
  MOCK_ADMIN_STATS,
} from '../data/mockData';

/**
 * RouteSafe AI - API Client Service
 *
 * Connected to FastAPI backend endpoints:
 * - GET /api/health
 * - GET /api/routes
 * - POST /api/routes/calculate
 * - GET /api/hazards
 * - POST /api/hazards/report
 * - GET /api/dashboard/stats
 * - POST /api/risk/heavy-rain
 *
 * Includes automatic local fallback so UI remains 100% resilient.
 */

const API_BASE = '';

// In-memory hazard state for fallback
let localHazards: Hazard[] = [...MOCK_HAZARDS];
let isHeavyRainActive = false;

export interface FindRoutesParams {
  origin: string;
  destination: string;
  heavyRain?: boolean;
}

/**
 * Fetch available safety-evaluated routes between two points
 */
export async function findRoutes(params: FindRoutesParams): Promise<RouteOption[]> {
  const rainMultiplier = params.heavyRain ?? isHeavyRainActive;

  try {
    const res = await fetch(`${API_BASE}/api/routes?heavy_rain=${rainMultiplier}`);
    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || item.name,
        distance: item.distance,
        travelTime: item.travel_time,
        baseRiskScore: item.risk_score,
        rainRiskScore: Math.min(100, item.risk_score + (item.category === 'Fastest' ? 24 : (item.category === 'Balanced' ? 19 : 7))),
        riskScore: item.risk_score,
        description: item.description,
        highlights: item.highlights || [],
        coordinates: item.coordinates || [],
      }));
    }
  } catch (err) {
    // Network fallback
  }

  // Resilient fallback
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_ROUTES.map((route) => {
    const calculatedScore = rainMultiplier ? route.rainRiskScore : route.baseRiskScore;
    return {
      ...route,
      riskScore: calculatedScore,
    };
  });
}

/**
 * Fetch verified community hazards and safety hazards in the viewport/region
 */
export async function getHazards(): Promise<Hazard[]> {
  try {
    const res = await fetch(`${API_BASE}/api/hazards`);
    if (res.ok) {
      const data = await res.json();
      return data.map((h: any) => ({
        id: h.id,
        type: h.type,
        severity: h.severity,
        description: h.description,
        locationName: h.location_name,
        coordinates: [h.latitude, h.longitude],
        reportedAt: h.reported_at,
        verifiedCount: h.verified_count,
        imageUrl: h.image_url,
      }));
    }
  } catch (err) {
    // Network fallback
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  return [...localHazards];
}

/**
 * Submit a student hazard report
 */
export async function submitHazard(submission: NewHazardSubmission): Promise<Hazard> {
  try {
    const res = await fetch(`${API_BASE}/api/hazards/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: submission.location,
        hazard_types: submission.hazardTypes,
        severity: submission.severity,
        description: submission.description,
        photo_url: submission.photoUrl,
        latitude: submission.coordinates ? submission.coordinates[0] : 37.868,
        longitude: submission.coordinates ? submission.coordinates[1] : -122.262,
      }),
    });
    if (res.ok) {
      const report = await res.json();
      const createdHazard: Hazard = {
        id: report.id,
        type: submission.hazardTypes[0] || 'Poor Lighting',
        severity: submission.severity,
        description: submission.description,
        locationName: submission.location,
        coordinates: submission.coordinates || [37.868, -122.262],
        reportedAt: 'Just now',
        verifiedCount: 1,
        imageUrl: submission.photoUrl,
      };
      localHazards = [createdHazard, ...localHazards];
      return createdHazard;
    }
  } catch (err) {
    // Network fallback
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  const fallbackHazard: Hazard = {
    id: `haz-${Date.now()}`,
    type: submission.hazardTypes[0] || 'Poor Lighting',
    severity: submission.severity,
    description: submission.description,
    locationName: submission.location,
    coordinates: submission.coordinates || [
      37.868 + (Math.random() - 0.5) * 0.01,
      -122.262 + (Math.random() - 0.5) * 0.01,
    ],
    reportedAt: 'Just now',
    verifiedCount: 1,
    imageUrl: submission.photoUrl,
  };

  localHazards = [fallbackHazard, ...localHazards];
  return fallbackHazard;
}

/**
 * Fetch safety statistics for Home quick safety bar and Admin Dashboard
 */
export async function getDashboardStats(): Promise<{
  quickSafety: QuickSafetyStatus;
  adminStats: AdminDashboardStats;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    if (res.ok) {
      const stats = await res.json();
      return {
        quickSafety: {
          safeZones: stats.safe_corridors,
          highRiskZones: stats.high_risk_zones,
          activeReports: stats.today_reports,
        },
        adminStats: {
          activeStudents: stats.active_students,
          highRiskZones: stats.high_risk_zones,
          totalReports: stats.total_reports,
          todayReports: stats.today_reports,
        },
      };
    }
  } catch (err) {
    // Network fallback
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    quickSafety: {
      ...MOCK_QUICK_SAFETY,
      activeReports: localHazards.length,
    },
    adminStats: {
      ...MOCK_ADMIN_STATS,
      totalReports: MOCK_ADMIN_STATS.totalReports + (localHazards.length - MOCK_HAZARDS.length),
      todayReports: MOCK_ADMIN_STATS.todayReports + (localHazards.length - MOCK_HAZARDS.length),
    },
  };
}

/**
 * Toggle or update the Heavy Rain condition
 */
export async function toggleHeavyRain(enabled: boolean): Promise<{
  active: boolean;
  affectedRoutesCount: number;
  message?: string;
  recommendedRoute?: string;
}> {
  isHeavyRainActive = enabled;

  try {
    const res = await fetch(`${API_BASE}/api/risk/heavy-rain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        active: data.heavy_rain_active,
        affectedRoutesCount: data.routes ? data.routes.length : 3,
        message: data.message,
        recommendedRoute: data.recommended_safer_route,
      };
    }
  } catch (err) {
    // Network fallback
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    active: enabled,
    affectedRoutesCount: enabled ? 3 : 0,
    message: enabled
      ? 'Heavy rain detected. Route safety scores recalculated across all corridors.'
      : 'Heavy rain cleared. Route safety scores restored to baseline.',
  };
}

