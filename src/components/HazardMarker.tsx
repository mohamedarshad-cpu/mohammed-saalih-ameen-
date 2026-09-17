import React from 'react';
import { Hazard, HazardType, HazardSeverity } from '../types';
import {
  AlertTriangle,
  Waves,
  Car,
  LightbulbOff,
  Cone,
  TrafficCone,
  Clock,
  CheckCircle,
} from 'lucide-react';

export interface HazardMarkerProps {
  hazard: Hazard;
  onSelect?: (hazard: Hazard) => void;
  compact?: boolean;
  className?: string;
  id?: string;
}

export const getHazardIconMeta = (type: HazardType) => {
  switch (type) {
    case 'Flooding':
      return {
        label: 'Flooding',
        color: 'text-sky-600',
        bg: 'bg-sky-100',
        border: 'border-sky-300',
        pinBg: '#0284c7',
        svgPath: 'M3 15a4 4 0 004 4h10a4 4 0 004-4',
        Icon: Waves,
      };
    case 'Accident':
      return {
        label: 'Accident',
        color: 'text-rose-600',
        bg: 'bg-rose-100',
        border: 'border-rose-300',
        pinBg: '#e11d48',
        Icon: Car,
      };
    case 'Poor Lighting':
      return {
        label: 'Poor Lighting',
        color: 'text-indigo-600',
        bg: 'bg-indigo-100',
        border: 'border-indigo-300',
        pinBg: '#6366f1',
        Icon: LightbulbOff,
      };
    case 'Construction':
      return {
        label: 'Construction',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        pinBg: '#ea580c',
        Icon: Cone,
      };
    case 'High Traffic':
      return {
        label: 'High Traffic',
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        border: 'border-amber-300',
        pinBg: '#d97706',
        Icon: TrafficCone,
      };
    case 'Pothole':
    default:
      return {
        label: 'Pothole',
        color: 'text-amber-700',
        bg: 'bg-amber-100',
        border: 'border-amber-300',
        pinBg: '#b45309',
        Icon: AlertTriangle,
      };
  }
};

export const getSeverityBadge = (severity: HazardSeverity) => {
  switch (severity) {
    case 'High':
      return {
        text: 'High Severity',
        classes: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    case 'Medium':
      return {
        text: 'Medium Severity',
        classes: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'Low':
    default:
      return {
        text: 'Low Severity',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
  }
};

export const HazardMarker: React.FC<HazardMarkerProps> = ({
  hazard,
  onSelect,
  compact = false,
  className = '',
  id,
}) => {
  const meta = getHazardIconMeta(hazard.type);
  const severityBadge = getSeverityBadge(hazard.severity);
  const Icon = meta.Icon;

  return (
    <div
      id={id}
      onClick={() => onSelect?.(hazard)}
      className={`p-3.5 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all text-left ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${meta.bg} ${meta.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {hazard.type}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${severityBadge.classes}`}
            >
              {hazard.severity}
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-normal">
            {hazard.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{hazard.locationName}</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {hazard.reportedAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
