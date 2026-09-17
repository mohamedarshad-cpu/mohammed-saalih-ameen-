import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hazard, RouteOption, HotspotItem } from '../types';
import { getHazardIconMeta, getSeverityBadge } from './HazardMarker';
import { MOCK_STUDENT_LOCATION, MOCK_COLLEGE_LOCATION } from '../data/mockData';
import { getRiskColor } from '../utils/riskUtils';
import { Layers, ShieldCheck, MapPin } from 'lucide-react';

export interface MapViewProps {
  hazards?: Hazard[];
  routes?: RouteOption[];
  hotspots?: HotspotItem[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  studentLocation?: [number, number];
  collegeLocation?: [number, number];
  height?: string;
  className?: string;
  interactive?: boolean;
  showLegend?: boolean;
  id?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  hazards = [],
  routes = [],
  hotspots = [],
  selectedRouteId,
  onSelectRoute,
  studentLocation = MOCK_STUDENT_LOCATION,
  collegeLocation = MOCK_COLLEGE_LOCATION,
  height = '480px',
  className = '',
  interactive = true,
  showLegend = true,
  id = 'routesafe-leaflet-map',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<{ [id: string]: L.Polyline }>({});
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map is already initialized on this container
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Midpoint between student and college
    const centerLat = (studentLocation[0] + collegeLocation[0]) / 2;
    const centerLng = (studentLocation[1] + collegeLocation[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: false, // Prevent page scroll trapping
      doubleClickZoom: interactive,
    });

    mapInstanceRef.current = map;

    // High quality OpenStreetMap tiles (CartoDB Positron / OSM compatible)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Layer group for all markers & routes
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // 1. Student Location Marker
    const studentIcon = L.divIcon({
      className: 'student-marker-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(14, 165, 233, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; border-radius: 9999px; background: #0284c7; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🎓
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const studentMarker = L.marker(studentLocation, { icon: studentIcon });
    studentMarker.bindPopup(`
      <div style="padding: 12px; font-family: inherit;">
        <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Your Location</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Student Residence</div>
        <div style="font-size: 12px; color: #64748b;">Current origin point for safe transit navigation.</div>
      </div>
    `);
    studentMarker.addTo(markersLayer);

    // 2. College Destination Marker
    const collegeIcon = L.divIcon({
      className: 'college-marker-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: #10b981; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
            🏛️
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const collegeMarker = L.marker(collegeLocation, { icon: collegeIcon });
    collegeMarker.bindPopup(`
      <div style="padding: 12px; font-family: inherit;">
        <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Destination</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">State University — Main Quad</div>
        <div style="font-size: 12px; color: #64748b;">Verified safe campus arrival hub with security dispatch.</div>
      </div>
    `);
    collegeMarker.addTo(markersLayer);

    // Invalidate size after initial layout render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Hazard Markers whenever hazards change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous hazard markers and rebuild
    // (preserve student and college markers)
    markersLayer.clearLayers();

    // Re-add Student & College
    const studentIcon = L.divIcon({
      className: 'student-marker-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(14, 165, 233, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; border-radius: 9999px; background: #0284c7; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🎓
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    L.marker(studentLocation, { icon: studentIcon })
      .bindPopup(`
        <div style="padding: 12px; font-family: inherit;">
          <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Your Location</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Student Residence</div>
          <div style="font-size: 12px; color: #64748b;">Current origin point for safe transit navigation.</div>
        </div>
      `)
      .addTo(markersLayer);

    const collegeIcon = L.divIcon({
      className: 'college-marker-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: #10b981; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
            🏛️
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    L.marker(collegeLocation, { icon: collegeIcon })
      .bindPopup(`
        <div style="padding: 12px; font-family: inherit;">
          <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Destination</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">State University — Main Quad</div>
          <div style="font-size: 12px; color: #64748b;">Verified safe campus arrival hub with security dispatch.</div>
        </div>
      `)
      .addTo(markersLayer);

    // Hazard markers
    hazards.forEach((hazard) => {
      const meta = getHazardIconMeta(hazard.type);
      const severityMeta = getSeverityBadge(hazard.severity);

      // Icon emoji / symbol mapping
      const hazardSymbols: { [key: string]: string } = {
        Flooding: '🌊',
        Accident: '🚨',
        'Poor Lighting': '💡',
        Construction: '🚧',
        'High Traffic': '🚗',
        Pothole: '⚠️',
      };
      const symbol = hazardSymbols[hazard.type] || '⚠️';

      const hazardIcon = L.divIcon({
        className: `hazard-marker-${hazard.id}`,
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9999px; background: ${meta.pinBg}; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); color: white; font-size: 14px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            ${symbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(hazard.coordinates, { icon: hazardIcon });

      const severityBadgeHtml =
        hazard.severity === 'High'
          ? 'background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3;'
          : hazard.severity === 'Medium'
          ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;'
          : 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';

      marker.bindPopup(`
        <div style="padding: 14px; font-family: inherit; min-width: 200px; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${hazard.type}</div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 9999px; ${severityBadgeHtml}">
              ${hazard.severity} Severity
            </span>
          </div>
          <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.45;">${hazard.description}</p>
          <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <span>📍 ${hazard.locationName}</span>
            <span>⏱️ ${hazard.reportedAt}</span>
          </div>
        </div>
      `);

      marker.addTo(markersLayer);
    });

    // 2.5 Hotspot markers (for Admin Live Hotspot Map)
    hotspots.forEach((hotspot) => {
      const riskScore = hotspot.riskContribution;
      const riskColorHex =
        riskScore <= 30
          ? '#10b981' // LOW = green
          : riskScore <= 60
          ? '#f59e0b' // MEDIUM = yellow
          : '#ef4444'; // HIGH = red

      const riskTierLabel =
        riskScore <= 30 ? 'LOW RISK' : riskScore <= 60 ? 'MEDIUM RISK' : 'HIGH RISK';

      const hotspotIcon = L.divIcon({
        className: `hotspot-marker-${hotspot.id}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: ${riskColorHex}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: ${riskColorHex}; border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800;">
              ${Math.round(riskScore)}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const hMarker = L.marker(hotspot.coordinates, { icon: hotspotIcon });
      hMarker.bindPopup(`
        <div style="padding: 12px; font-family: inherit; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: white; background: ${riskColorHex}; padding: 2px 8px; border-radius: 9999px;">
              ${riskTierLabel} (${Math.round(riskScore)}/100)
            </span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${hotspot.type}</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            ${hotspot.locationName}
          </div>
          <p style="font-size: 12px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">
            ${hotspot.description}
          </p>
          <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            Severity Level: <b>${hotspot.severity}</b>
          </div>
        </div>
      `);
      hMarker.addTo(markersLayer);
    });

    // 3. Render Route Polylines
    // Clean up existing polylines
    Object.values(routeLayersRef.current).forEach((polyline) => {
      map.removeLayer(polyline);
    });
    routeLayersRef.current = {};

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const riskMeta = getRiskColor(route.riskScore);

      const polyline = L.polyline(route.coordinates, {
        color: riskMeta.hex,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.6,
        dashArray: isSelected ? undefined : '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.on('click', () => {
        onSelectRoute?.(route.id);
      });

      polyline.bindTooltip(
        `<b>${route.name}</b> • ${route.travelTime} (${route.riskLabel})`,
        { sticky: true, className: 'route-tooltip' }
      );

      polyline.addTo(map);
      routeLayersRef.current[route.id] = polyline;
    });

    // Fit bounds if selected route exists
    if (selectedRouteId && routeLayersRef.current[selectedRouteId]) {
      const selectedPolyline = routeLayersRef.current[selectedRouteId];
      map.fitBounds(selectedPolyline.getBounds(), { padding: [40, 40] });
    }
  }, [hazards, routes, hotspots, selectedRouteId, studentLocation, collegeLocation, onSelectRoute]);

  return (
    <div
      id={id}
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-slate-100 ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Control Overlay / Legend */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/90 shadow-md text-xs space-y-2 pointer-events-auto max-w-[210px]">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Map Layers</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200 shrink-0" />
              <span>Student Origin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
              <span>Campus Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Active Hazard Pin</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <div className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
              Risk Levels
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
              <span className="text-emerald-700">0–30 Low</span>
              <span className="text-amber-700">31–60 Med</span>
              <span className="text-rose-700">61+ High</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Badge */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 backdrop-blur-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium">OSM Live Navigation Feed</span>
      </div>
    </div>
  );
};
