import React, { useState, useEffect } from 'react';
import { LocationInput } from '../components/LocationInput';
import { RouteCard } from '../components/RouteCard';
import { StatCard } from '../components/StatCard';
import { MapView } from '../components/MapView';
import { HeavyRainToggle } from '../components/HeavyRainToggle';
import { SafetyAlert } from '../components/SafetyAlert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HazardMarker } from '../components/HazardMarker';
import {
  MOCK_LOCATIONS,
  MOCK_HAZARDS,
  MOCK_ROUTES,
  MOCK_QUICK_SAFETY,
  MOCK_STUDENT_LOCATION,
  MOCK_COLLEGE_LOCATION,
} from '../data/mockData';
import { RouteOption, Hazard } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Navigation2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { findRoutes, toggleHeavyRain, getHazards } from '../services/api';

export interface HomeProps {
  onNavigateToRoutes: () => void;
  onNavigateToReport: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateToRoutes,
  onNavigateToReport,
}) => {
  // Input states
  const [currentLocation, setCurrentLocation] = useState('South Campus Residence Halls');
  const [collegeDestination, setCollegeDestination] = useState('State University — Main Gate & Quad');

  // Heavy rain state
  const [heavyRain, setHeavyRain] = useState(false);
  const [rainAlertDismissed, setRainAlertDismissed] = useState(false);
  const [rainRecommendation, setRainRecommendation] = useState<string | null>(null);

  // Routes and selection
  const [routes, setRoutes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest');
  const [isSearching, setIsSearching] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Hazards list
  const [hazards, setHazards] = useState<Hazard[]>(MOCK_HAZARDS);
  const [isLoadingHazards, setIsLoadingHazards] = useState(false);

  // Load initial hazards from API
  useEffect(() => {
    setIsLoadingHazards(true);
    getHazards()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHazards(res.data);
        }
        if (res.error) {
          setConnectionError(res.error);
        } else {
          setConnectionError(null);
        }
      })
      .catch(() => {
        setConnectionError('Unable to connect to RouteSafe AI server.');
      })
      .finally(() => {
        setIsLoadingHazards(false);
      });
  }, []);

  // Handle Find Safe Route
  const handleFindSafeRoute = async () => {
    setIsSearching(true);
    setConnectionError(null);
    try {
      const res = await findRoutes({
        origin: currentLocation,
        destination: collegeDestination,
        heavyRain,
      });

      if (res.data && res.data.length > 0) {
        setRoutes(res.data);
      }
      if (res.error) {
        setConnectionError(res.error);
      }
      setFeedbackMessage('Route safety analysis updated successfully.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      setConnectionError('Unable to connect to RouteSafe AI server.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Heavy Rain toggle
  const handleToggleHeavyRain = async (enabled: boolean) => {
    setHeavyRain(enabled);
    setRainAlertDismissed(false);

    try {
      const res = await toggleHeavyRain(enabled);
      if (res.routes && res.routes.length > 0) {
        setRoutes(res.routes);
      } else {
        // Recalculate using findRoutes
        const routeRes = await findRoutes({
          origin: currentLocation,
          destination: collegeDestination,
          heavyRain: enabled,
        });
        if (routeRes.data) {
          setRoutes(routeRes.data);
        }
      }

      if (enabled) {
        setRainRecommendation(res.recommendedRoute || 'SAFEST');
      } else {
        setRainRecommendation(null);
      }
    } catch (e) {
      setConnectionError('Unable to connect to RouteSafe AI server.');
    }
  };

  const handleUseGPS = () => {
    setCurrentLocation('Current GPS: South Quad Annex (Lat: 37.8655)');
  };

  const originPresets = MOCK_LOCATIONS.filter((l) => l.type === 'origin');
  const destinationPresets = MOCK_LOCATIONS.filter((l) => l.type === 'destination');

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[1] || routes[0];

  // Check if current route has significant risk increase
  const isHighRisk = selectedRoute?.riskScore > 60;

  return (
    <div className="space-y-8 pb-12" id="home-page-container">
      {/* Backend Connection Notice if offline */}
      {connectionError && (
        <div
          id="server-connection-notice"
          className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Unable to connect to RouteSafe AI server. Operating with cached campus data.</span>
          </div>
          <button
            type="button"
            onClick={() => setConnectionError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification */}
      {feedbackMessage && (
        <div
          id="success-notification-banner"
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-xs animate-fade-in"
        >
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Heavy Rain Alert Banner & Safer Alternative Recommendation */}
      {heavyRain && !rainAlertDismissed && (
        <div
          id="heavy-rain-alert-box"
          className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 space-y-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900">
              <span className="text-lg">⚠️</span>
              <span>Heavy rain has increased risk on your current route.</span>
            </div>
            <button
              type="button"
              onClick={() => setRainAlertDismissed(true)}
              className="text-xs text-amber-800 hover:text-amber-950 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 p-3 rounded-xl border border-amber-200">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-amber-900">Recommended safer alternative: </span>
              <span className="font-extrabold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-1">
                SAFEST
              </span>
              <span className="text-slate-500 ml-2">
                (Elevated ridge path with storm drains & bright LED illumination)
              </span>
            </div>

            <Button
              size="sm"
              variant="primary"
              className="font-bold text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                const safest = routes.find((r) => r.category === 'Safest' || r.name.includes('SAFEST'));
                if (safest) {
                  setSelectedRouteId(safest.id);
                  setFeedbackMessage('Switched to SAFEST route alternative.');
                  setTimeout(() => setFeedbackMessage(null), 3000);
                }
              }}
            >
              Switch to SAFEST Route
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center sm:text-left pt-2 pb-1" id="hero-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Safety Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Travel Safer. Reach Smarter.
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal max-w-xl">
              AI-powered safety navigation designed for students.
            </p>
          </div>

          <div className="flex items-center sm:self-start justify-center sm:justify-end">
            <HeavyRainToggle
              id="home-heavy-rain-toggle"
              enabled={heavyRain}
              onToggle={handleToggleHeavyRain}
            />
          </div>
        </div>
      </section>

      {/* Input Cards & Route Search Section */}
      <section id="route-planner-section">
        <Card className="border border-slate-200/90 shadow-sm" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
            {/* Input 1: Current Location */}
            <LocationInput
              id="input-current-location"
              label="Current Location"
              value={currentLocation}
              onChange={setCurrentLocation}
              placeholder="Enter current location"
              iconType="origin"
              presets={originPresets}
              onSelectPreset={(p) => setCurrentLocation(p.name)}
              onUseCurrentLocation={handleUseGPS}
            />

            {/* Input 2: College */}
            <LocationInput
              id="input-college-destination"
              label="College Destination"
              value={collegeDestination}
              onChange={setCollegeDestination}
              placeholder="Enter college destination"
              iconType="destination"
              presets={destinationPresets}
              onSelectPreset={(p) => setCollegeDestination(p.name)}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-factor AI assessment: streetlights, flood zones, traffic & road slickness</span>
            </div>

            <Button
              id="btn-find-safe-route"
              variant="primary"
              size="lg"
              onClick={handleFindSafeRoute}
              isLoading={isSearching}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto font-bold tracking-wide shadow-md"
            >
              Find Safe Route
            </Button>
          </div>
        </Card>
      </section>

      {/* Quick Safety Status */}
      <section id="quick-safety-status-section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Quick Safety Status
          </h2>
          <span className="text-xs text-slate-400 font-medium">Campus Metro Area</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            id="stat-safe-zones"
            title="Safe Zones"
            value={`${MOCK_QUICK_SAFETY.safeZones} Corridors`}
            subtitle="Verified continuous lighting & emergency stations"
            tone="success"
            icon={<ShieldCheck className="w-5 h-5" />}
          />

          <StatCard
            id="stat-high-risk-zones"
            title="High-Risk Zones"
            value={`${MOCK_QUICK_SAFETY.highRiskZones + (heavyRain ? 2 : 0)} Caution Areas`}
            subtitle={heavyRain ? "Increased risk due to active flooding & slick roads" : "Oxford underpass & dark corridors"}
            tone={heavyRain ? 'danger' : 'warning'}
            icon={<AlertTriangle className="w-5 h-5" />}
          />

          <StatCard
            id="stat-active-reports"
            title="Active Reports"
            value={`${hazards.length} Community Reports`}
            subtitle="Potholes, broken lights & road alerts"
            tone="info"
            icon={<FileText className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Interactive Map & Route Recommendations Layout */}
      <section id="map-and-routes-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Interactive Safety Navigation
            </h2>
            <p className="text-xs text-slate-500">
              Select a route to highlight its safe path and active hazard pins.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active Selection:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              {selectedRoute?.name} ({selectedRoute?.travelTime} • {selectedRoute?.riskLabel})
            </span>
          </div>
        </div>

        {/* Leaflet Map Component */}
        <MapView
          id="home-safety-map"
          hazards={hazards}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          studentLocation={MOCK_STUDENT_LOCATION}
          collegeLocation={MOCK_COLLEGE_LOCATION}
          height="480px"
        />
      </section>

      {/* Route Cards: Exactly 3 routes (FASTEST, SAFEST, BALANCED) */}
      <section id="route-cards-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Recommended Route Options
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated with real-time risk scores from 0 (Safest) to 100 (Highest Risk)
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToRoutes}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Detailed View
          </Button>
        </div>

        {routes.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No routes found. Try adjusting origin and destination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {routes.slice(0, 3).map((route) => (
              <RouteCard
                key={route.id}
                id={`route-card-${route.id}`}
                route={route}
                isSelected={route.id === selectedRouteId}
                onSelect={(r) => setSelectedRouteId(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Nearby Hazards Feed & Community Action */}
      <section id="nearby-hazards-section" className="pt-2">
        <Card padding="md" className="border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Nearby Student Safety Reports
              </h3>
              <p className="text-xs text-slate-500">
                Live community crowdsourced hazards around campus transit paths
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToReport}
              className="text-xs font-semibold"
            >
              + Report New Hazard
            </Button>
          </div>

          {isLoadingHazards ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Loading active hazard reports...
            </div>
          ) : hazards.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No active hazard reports in this area.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hazards.slice(0, 3).map((hazard) => (
                <HazardMarker
                  key={hazard.id}
                  hazard={hazard}
                  className="hover:border-slate-300"
                />
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};
