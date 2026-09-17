import React, { useState, useEffect } from 'react';
import { RouteCard } from '../components/RouteCard';
import { MapView } from '../components/MapView';
import { HeavyRainToggle } from '../components/HeavyRainToggle';
import { SafetyAlert } from '../components/SafetyAlert';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RiskBadge } from '../components/RiskBadge';
import { MOCK_ROUTES, MOCK_HAZARDS, MOCK_STUDENT_LOCATION, MOCK_COLLEGE_LOCATION } from '../data/mockData';
import { RouteOption, Hazard } from '../types';
import { findRoutes, toggleHeavyRain } from '../services/api';
import {
  Navigation,
  School,
  ArrowRight,
  ShieldCheck,
  Zap,
  Scale,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const Routes: React.FC = () => {
  const [heavyRain, setHeavyRain] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest');
  const [navigationStarted, setNavigationStarted] = useState(false);

  useEffect(() => {
    toggleHeavyRain(heavyRain);
    findRoutes({
      origin: 'South Campus Residence Halls',
      destination: 'State University — Main Gate & Quad',
      heavyRain,
    }).then((updatedRoutes) => {
      setRoutes(updatedRoutes);
    });
  }, [heavyRain]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[1];

  return (
    <div className="space-y-8 pb-12" id="safe-routes-page">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transit Planner
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              3 Routes Analyzed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Safe Route Alternatives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multi-modal risk routing balancing transit speed against campus safety beacons.
          </p>
        </div>

        <HeavyRainToggle
          id="routes-heavy-rain-toggle"
          enabled={heavyRain}
          onToggle={setHeavyRain}
        />
      </div>

      {/* Active Trip Banner */}
      <Card className="border border-slate-200/90 bg-slate-900 text-white" padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>South Campus Dorms</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <School className="w-4 h-4" />
              <span>State University Main Gate</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Selected Path:</span>
            <span className="px-3 py-1 rounded-lg bg-white/10 font-bold text-xs">
              {selectedRoute.name} ({selectedRoute.travelTime})
            </span>

            <Button
              variant="success"
              size="sm"
              onClick={() => setNavigationStarted(true)}
              className="text-xs font-bold shadow-md"
            >
              {navigationStarted ? 'Navigating Active' : 'Start Safe Navigation'}
            </Button>
          </div>
        </div>

        {navigationStarted && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Real-time student guidance active for <strong>{selectedRoute.name}</strong>. Emergency call pillars en route are highlighted.
            </span>
          </div>
        )}
      </Card>

      {/* Heavy Rain Alert Banner */}
      {heavyRain && (
        <SafetyAlert
          type="rain"
          title="Heavy Rain Advisory"
          message="Heavy rain detected. Route safety scores may change. Oxford underpass flooding adds 16 risk points to Fastest route."
        />
      )}

      {/* 3 Route Cards Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Select Route Option
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={route.id === selectedRouteId}
              onSelect={(r) => setSelectedRouteId(r.id)}
            />
          ))}
        </div>
      </section>

      {/* Map View */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Route Map Comparison
          </h2>
          <span className="text-xs text-slate-500">
            Selected route is rendered with thick solid polyline
          </span>
        </div>

        <MapView
          id="routes-map-view"
          hazards={MOCK_HAZARDS}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          height="450px"
        />
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Safety & Route Breakdown
        </h2>

        <Card padding="none" className="border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Route Name</th>
                  <th className="py-3 px-4">Est. Time</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Safety Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((route) => {
                  const isSelected = route.id === selectedRouteId;
                  return (
                    <tr
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                        <span>{route.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{route.travelTime}</td>
                      <td className="py-3.5 px-4 text-slate-700">{route.distance}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {route.riskScore} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge score={route.riskScore} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {route.safetyStatus}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};
