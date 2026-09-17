import {
  Hazard,
  RouteOption,
  AdminDashboardStats,
  NewHazardSubmission,
  HotspotItem,
  DashboardChartsData,
} from '../types';
import {
  MOCK_ROUTES,
  MOCK_HAZARDS,
  MOCK_ADMIN_STATS,
} from '../data/mockData';
import { getRiskLabel } from '../utils/riskUtils';

/**
 * RouteSafe AI - Universal API Client
 * Uses VITE_API_BASE_URL environment variable without hardcoded URLs.
 * Handles network failures gracefully and reports connection status.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/$/, '');
  }
  return '';
};

// In-memory hazard state for session persistence and offline fallback
let localHazards: Hazard[] = [...MOCK_HAZARDS];
let isHeavyRainActive = false;

export interface FindRoutesParams {
  origin: string;
  destination: string;
  heavyRain?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  source: 'api' | 'fallback';
  error?: string;
}

/**
 * Helper to execute fetch with timeout and standard JSON parsing
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1. findRoutes
 * Calls POST /api/routes/calculate (with origin, destination, and heavy_rain)
 * Returns exactly 3 routes: FASTEST, SAFEST, BALANCED.
 */
export async function findRoutes(params: FindRoutesParams): Promise<ApiResponse<RouteOption[]>> {
  const baseUrl = getApiBaseUrl();
  const rain = params.heavyRain ?? isHeavyRainActive;

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        heavy_rain: rain,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const routes: RouteOption[] = data.map((item: any) => {
        const cat = item.category || item.name;
        const upperName = (item.name || cat).toUpperCase();
        return {
          id: item.id,
          name: upperName,
          category: cat,
          distance: item.distance,
          travelTime: item.travel_time,
          baseRiskScore: item.risk_score,
          rainRiskScore: Math.min(100, item.risk_score + (cat === 'Fastest' ? 24 : cat === 'Balanced' ? 19 : 7)),
          riskScore: item.risk_score,
          riskLabel: getRiskLabel(item.risk_score),
          safetyStatus: item.risk_score <= 30 ? 'Safest Path • Recommended' : (item.risk_score <= 60 ? 'Caution Advised' : 'High Risk Area'),
          description: item.description,
          highlights: item.highlights || [],
          coordinates: item.coordinates || [],
          riskFactors: item.risk_factors ? {
            accident: item.risk_factors.accident,
            flood: item.risk_factors.flood,
            traffic: item.risk_factors.traffic,
            lighting: item.risk_factors.lighting,
            road_condition: item.risk_factors.road_condition,
          } : undefined,
        };
      });

      return { data: routes, source: 'api' };
    }
  } catch (err: any) {
    // Network or server unavailable
  }

  // Fallback data
  const fallbackRoutes: RouteOption[] = MOCK_ROUTES.map((r) => {
    const score = rain ? r.rainRiskScore : r.baseRiskScore;
    return {
      ...r,
      name: r.name.toUpperCase(),
      riskScore: score,
      riskLabel: getRiskLabel(score),
      riskFactors: {
        accident: r.category === 'Fastest' ? 65 : (r.category === 'Safest' ? 20 : 40),
        flood: rain ? (r.category === 'Fastest' ? 95 : 35) : (r.category === 'Fastest' ? 72 : 15),
        traffic: r.category === 'Fastest' ? 80 : (r.category === 'Safest' ? 25 : 45),
        lighting: r.category === 'Fastest' ? 55 : (r.category === 'Safest' ? 18 : 40),
        road_condition: r.category === 'Fastest' ? 68 : (r.category === 'Safest' ? 35 : 55),
      },
    };
  });

  return {
    data: fallbackRoutes,
    source: 'fallback',
    error: 'Unable to connect to RouteSafe AI server.',
  };
}

/**
 * 2. getHazards
 * Calls GET /api/hazards
 */
export async function getHazards(): Promise<ApiResponse<Hazard[]>> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/hazards`);
    if (res.ok) {
      const data = await res.json();
      const list: Hazard[] = data.map((h: any) => ({
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
      localHazards = [...list];
      return { data: list, source: 'api' };
    }
  } catch (err) {
    // Network fallback
  }

  return {
    data: [...localHazards],
    source: 'fallback',
    error: 'Unable to connect to RouteSafe AI server.',
  };
}

/**
 * 3. submitHazard
 * Calls POST /api/hazards/report
 */
export async function submitHazard(submission: NewHazardSubmission): Promise<{
  hazard: Hazard;
  success: boolean;
  message: string;
  source: 'api' | 'fallback';
}> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/hazards/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: submission.location,
        hazard_types: submission.hazardTypes,
        severity: submission.severity,
        description: submission.description,
        photo_url: submission.photoUrl,
        latitude: submission.coordinates ? submission.coordinates[0] : 37.868 + (Math.random() - 0.5) * 0.008,
        longitude: submission.coordinates ? submission.coordinates[1] : -122.262 + (Math.random() - 0.5) * 0.008,
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
        coordinates: [report.latitude, report.longitude],
        reportedAt: 'Just now',
        verifiedCount: 1,
        imageUrl: submission.photoUrl,
      };
      localHazards = [createdHazard, ...localHazards];
      return {
        hazard: createdHazard,
        success: true,
        message: 'Hazard successfully registered with campus safety dispatch.',
        source: 'api',
      };
    }
  } catch (err) {
    // Fallback registration
  }

  const fallbackHazard: Hazard = {
    id: `haz-${Date.now()}`,
    type: submission.hazardTypes[0] || 'Poor Lighting',
    severity: submission.severity,
    description: submission.description,
    locationName: submission.location,
    coordinates: submission.coordinates || [
      37.8685 + (Math.random() - 0.5) * 0.006,
      -122.2625 + (Math.random() - 0.5) * 0.006,
    ],
    reportedAt: 'Just now',
    verifiedCount: 1,
    imageUrl: submission.photoUrl,
  };

  localHazards = [fallbackHazard, ...localHazards];
  return {
    hazard: fallbackHazard,
    success: true,
    message: 'Hazard report stored locally (offline demo mode).',
    source: 'fallback',
  };
}

/**
 * 4. getDashboardStats
 * Calls GET /api/dashboard/stats
 */
export async function getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/dashboard/stats`);
    if (res.ok) {
      const stats = await res.json();
      return {
        data: {
          activeStudents: stats.active_students,
          highRiskZones: stats.high_risk_zones,
          totalReports: stats.total_reports,
          todayReports: stats.today_reports,
          safeCorridors: stats.safe_corridors,
          weatherCondition: stats.weather_condition,
        },
        source: 'api',
      };
    }
  } catch (err) {
    // Network fallback
  }

  return {
    data: {
      ...MOCK_ADMIN_STATS,
      totalReports: MOCK_ADMIN_STATS.totalReports + (localHazards.length - MOCK_HAZARDS.length),
      todayReports: MOCK_ADMIN_STATS.todayReports + (localHazards.length - MOCK_HAZARDS.length),
    },
    source: 'fallback',
    error: 'Unable to connect to RouteSafe AI server.',
  };
}

/**
 * 5. getHotspots
 * Calls GET /api/dashboard/hotspots
 */
export async function getHotspots(): Promise<ApiResponse<HotspotItem[]>> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/dashboard/hotspots`);
    if (res.ok) {
      const data = await res.json();
      const hotspots: HotspotItem[] = data.hotspots.map((h: any) => ({
        id: h.id,
        type: h.type,
        severity: h.severity,
        locationName: h.location_name,
        coordinates: [h.coordinates[0], h.coordinates[1]],
        description: h.description,
        riskContribution: h.risk_contribution,
      }));
      return { data: hotspots, source: 'api' };
    }
  } catch (err) {
    // Network fallback
  }

  const fallbackHotspots: HotspotItem[] = localHazards.map((h) => ({
    id: h.id,
    type: h.type,
    severity: h.severity,
    locationName: h.locationName,
    coordinates: h.coordinates,
    description: h.description,
    riskContribution: h.severity === 'High' ? 85 : (h.severity === 'Medium' ? 55 : 25),
  }));

  return {
    data: fallbackHotspots,
    source: 'fallback',
    error: 'Unable to connect to RouteSafe AI server.',
  };
}

/**
 * 6. getCharts
 * Calls GET /api/dashboard/charts
 */
export async function getCharts(): Promise<ApiResponse<DashboardChartsData>> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/dashboard/charts`);
    if (res.ok) {
      const data = await res.json();
      return {
        data: {
          hazardsByType: data.hazards_by_type,
          riskDistribution: data.risk_distribution,
          reportsOverTime: data.reports_over_time,
        },
        source: 'api',
      };
    }
  } catch (err) {
    // Network fallback
  }

  // Fallback structured data for Recharts
  return {
    data: {
      hazardsByType: [
        { type: 'Pothole', count: 16, color: '#b45309' },
        { type: 'Flooding', count: 11, color: '#0284c7' },
        { type: 'Accident', count: 7, color: '#e11d48' },
        { type: 'Poor Lighting', count: 23, color: '#6366f1' },
        { type: 'Construction', count: 9, color: '#ea580c' },
        { type: 'High Traffic', count: 17, color: '#d97706' },
      ],
      riskDistribution: [
        { range: '0–30 Low Risk', level: 'LOW', percentage: 58, color: '#10b981' },
        { range: '31–60 Medium Risk', level: 'MEDIUM', percentage: 28, color: '#f59e0b' },
        { range: '61–100 High Risk', level: 'HIGH', percentage: 14, color: '#ef4444' },
      ],
      reportsOverTime: [
        { day: 'Mon', reports: 18, verified: 16 },
        { day: 'Tue', reports: 24, verified: 22 },
        { day: 'Wed', reports: 31, verified: 29 },
        { day: 'Thu', reports: 22, verified: 20 },
        { day: 'Fri', reports: 45, verified: 41 },
        { day: 'Sat', reports: 38, verified: 35 },
        { day: 'Sun', reports: 19, verified: 17 },
      ],
    },
    source: 'fallback',
    error: 'Unable to connect to RouteSafe AI server.',
  };
}

/**
 * 7. updateRiskSettings
 * Calls POST /api/risk/settings
 */
export async function updateRiskSettings(settings: {
  accident_weight?: number;
  flood_weight?: number;
  traffic_weight?: number;
  lighting_weight?: number;
  road_weight?: number;
  heavy_rain_active?: boolean;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/risk/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
  } catch (err: any) {
    return { success: false, error: 'Unable to connect to RouteSafe AI server.' };
  }

  return { success: true, data: settings };
}

/**
 * 8. toggleHeavyRain
 * Calls POST /api/risk/heavy-rain
 */
export async function toggleHeavyRain(enabled: boolean): Promise<{
  active: boolean;
  message: string;
  previousRisk?: number;
  newRisk?: number;
  riskChange?: number;
  recommendedRoute?: string;
  affectedFactors?: string[];
  routes?: RouteOption[];
  source: 'api' | 'fallback';
}> {
  isHeavyRainActive = enabled;
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/risk/heavy-rain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });

    if (res.ok) {
      const data = await res.json();
      const mappedRoutes: RouteOption[] = data.routes ? data.routes.map((item: any) => ({
        id: item.id,
        name: (item.name || item.category).toUpperCase(),
        category: item.category || item.name,
        distance: item.distance,
        travelTime: item.travel_time,
        baseRiskScore: item.risk_score,
        rainRiskScore: item.risk_score,
        riskScore: item.risk_score,
        riskLabel: getRiskLabel(item.risk_score),
        safetyStatus: item.risk_score <= 30 ? 'Safest Path • Recommended' : (item.risk_score <= 60 ? 'Caution Advised' : 'High Risk Area'),
        description: item.description,
        highlights: item.highlights || [],
        coordinates: item.coordinates || [],
        riskFactors: item.risk_factors,
      })) : [];

      return {
        active: data.heavy_rain_active,
        message: data.message,
        previousRisk: data.previous_risk,
        newRisk: data.new_risk,
        riskChange: data.risk_change,
        recommendedRoute: data.recommended_safer_route,
        affectedFactors: data.affected_factors,
        routes: mappedRoutes,
        source: 'api',
      };
    }
  } catch (err) {
    // Network fallback
  }

  return {
    active: enabled,
    message: enabled
      ? 'Heavy rain detected. Route safety scores recalculated across all corridors.'
      : 'Heavy rain cleared. Route safety scores restored to baseline.',
    previousRisk: enabled ? 45.0 : 61.2,
    newRisk: enabled ? 61.2 : 45.0,
    riskChange: enabled ? 16.2 : -16.2,
    recommendedRoute: 'SAFEST',
    affectedFactors: enabled
      ? ['flood risk (+120%)', 'traffic congestion (+30%)', 'road slickness (+35%)']
      : ['Restored to baseline dry conditions'],
    source: 'fallback',
  };
}
