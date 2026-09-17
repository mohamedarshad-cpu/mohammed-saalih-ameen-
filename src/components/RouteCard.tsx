import React from 'react';
import { RouteOption } from '../types';
import { getRiskColor, getRiskLabel } from '../utils/riskUtils';
import { RiskBadge } from './RiskBadge';
import { RiskScore } from './RiskScore';
import { Clock, Navigation, CheckCircle2, Shield, Zap, Scale, Waves, Lightbulb, Car, AlertOctagon, Wrench } from 'lucide-react';

export interface RouteCardProps {
  route: RouteOption;
  isSelected?: boolean;
  onSelect?: (route: RouteOption) => void;
  className?: string;
  id?: string;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected = false,
  onSelect,
  className = '',
  id,
}) => {
  const riskColor = getRiskColor(route.riskScore);
  const riskLevel = getRiskLabel(route.riskScore);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fastest':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Safest':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'Balanced':
      default:
        return <Scale className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div
      id={id}
      onClick={() => onSelect?.(route)}
      className={`relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer bg-white text-left flex flex-col justify-between ${
        isSelected
          ? `border-slate-900 shadow-md ring-2 ring-slate-900/10`
          : `border-slate-200/80 hover:border-slate-300 hover:shadow-sm`
      } ${className}`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
              {getCategoryIcon(route.category)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {route.name}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {route.safetyStatus}
              </span>
            </div>
          </div>

          <RiskBadge score={route.riskScore} size="sm" />
        </div>

        {/* Metrics Row: Time & Distance */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Travel Time</div>
              <div className="text-sm font-bold text-slate-900">{route.travelTime}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Distance</div>
              <div className="text-sm font-bold text-slate-900">{route.distance}</div>
            </div>
          </div>
        </div>

        {/* Risk Score Progress Bar & Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Risk Level:</span>
            <span className={`font-extrabold ${riskColor.text}`}>{riskLevel} ({Math.round(route.riskScore)}/100)</span>
          </div>
          <RiskScore score={route.riskScore} size="sm" showValue={false} />
        </div>

        {/* Detailed Risk Factors Breakdown */}
        {route.riskFactors && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Risk Factors Breakdown
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div className="flex items-center justify-between" title="Accident frequency">
                <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                  <AlertOctagon className="w-3 h-3 text-rose-500" /> Accident:
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{Math.round(route.riskFactors.accident)}%</span>
              </div>

              <div className="flex items-center justify-between" title="Flood susceptibility">
                <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                  <Waves className="w-3 h-3 text-sky-500" /> Flood:
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{Math.round(route.riskFactors.flood)}%</span>
              </div>

              <div className="flex items-center justify-between" title="Traffic density">
                <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                  <Car className="w-3 h-3 text-amber-500" /> Traffic:
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{Math.round(route.riskFactors.traffic)}%</span>
              </div>

              <div className="flex items-center justify-between" title="Poor lighting deficiency">
                <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                  <Lightbulb className="w-3 h-3 text-indigo-500" /> Lighting:
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{Math.round(route.riskFactors.lighting)}%</span>
              </div>

              <div className="flex items-center justify-between col-span-2" title="Potholes and road damage">
                <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                  <Wrench className="w-3 h-3 text-slate-500" /> Road Surface:
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{Math.round(route.riskFactors.road_condition)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {route.description}
        </p>

        {/* Highlights / Features */}
        {route.highlights && route.highlights.length > 0 && (
          <div className="space-y-1.5 mb-4 pt-3 border-t border-slate-100">
            {route.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Indicator Button */}
      <div className="pt-2">
        <button
          type="button"
          className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
            isSelected
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(route);
          }}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Route Selected (Active on Map)</span>
            </>
          ) : (
            <span>Select Route</span>
          )}
        </button>
      </div>
    </div>
  );
};
