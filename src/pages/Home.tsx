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
import { RouteOption, Hazard, LocationPreset } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Navigation2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Compass,
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

  // Routes and selection
  const [routes, setRoutes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest');
  const [isSearching, setIsSearching] = useState(false);

  // Hazards list
  const [hazards, setHazards] = useState<Hazard[]>(MOCK_HAZARDS);

  // Sync routes when heavy rain changes
  useEffect(() => {
    toggleHeavyRain(heavyRain);
    findRoutes({
      origin: currentLocation,
      destination: collegeDestination,
      heavyRain,
    }).then((updatedRoutes) => {
      setRoutes(updatedRoutes);
    });

    if (heavyRain) {
      setRainAlertDismissed(false);
    }
  }, [heavyRain, currentLocation, collegeDestination]);

  const handleFindSafeRoute = async () => {
    setIsSearching(true);
    const results = await findRoutes({
      origin: currentLocation,
      destination: collegeDestination,
      heavyRain,
    });
    setRoutes(results);
    setIsSearching(false);
  };

  const handleUseGPS = () => {
    setCurrentLocation('Current GPS: South Quad Annex (Lat: 37.8655)');
  };

  const originPresets = MOCK_LOCATIONS.filter((l) => l.type === 'origin');
  const destinationPresets = MOCK_LOCATIONS.filter((l) => l.type === 'destination');

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[1];

  return (
    <div className="space-y-8 pb-12" id="home-page-container">
      {/* Heavy Rain Banner (Conditionally rendered when active) */}
      {heavyRain && !rainAlertDismissed && (
        <SafetyAlert
          id="heavy-rain-banner"
          type="rain"
          title="Heavy Rain Detected"
          message="Heavy rain detected. Route safety scores may change."
          actionText="View flood hazard zones on map"
          onAction={() => {
            const mapElem = document.getElementById('home-safety-map');
            mapElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          onDismiss={() => setRainAlertDismissed(true)}
        />
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
              onToggle={setHeavyRain}
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

          {/* Prominent Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-factor AI assessment: streetlights, flood zones & reported incidents</span>
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
            value={`${MOCK_QUICK_SAFETY.highRiskZones} Caution Areas`}
            subtitle={heavyRain ? "Increased risk due to active flooding" : "Oxford underpass & dark corridors"}
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
              {selectedRoute.name} ({selectedRoute.travelTime})
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
          height="460px"
        />
      </section>

      {/* Route Cards: Exactly 3 routes (Fastest, Safest, Balanced) */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              id={`route-card-${route.id}`}
              route={route}
              isSelected={route.id === selectedRouteId}
              onSelect={(r) => setSelectedRouteId(r.id)}
            />
          ))}
        </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hazards.slice(0, 3).map((hazard) => (
              <HazardMarker
                key={hazard.id}
                hazard={hazard}
                className="hover:border-slate-300"
              />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};
