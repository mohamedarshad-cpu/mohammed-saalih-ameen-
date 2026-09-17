import React, { useState } from 'react';
import { MapPin, Navigation, School, Crosshair, ChevronDown } from 'lucide-react';
import { LocationPreset } from '../types';

export interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconType?: 'origin' | 'destination';
  presets?: LocationPreset[];
  onSelectPreset?: (preset: LocationPreset) => void;
  onUseCurrentLocation?: () => void;
  className?: string;
  id?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  iconType = 'origin',
  presets = [],
  onSelectPreset,
  onUseCurrentLocation,
  className = '',
  id,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const isOrigin = iconType === 'origin';

  return (
    <div className={`relative ${className}`} id={id}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={`${id}-input`}
          className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
        >
          {isOrigin ? (
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
          ) : (
            <School className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{label}</span>
        </label>

        {isOrigin && onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors hover:underline"
          >
            <Crosshair className="w-3 h-3" />
            <span>GPS Location</span>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {isOrigin ? (
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100" />
          ) : (
            <MapPin className="w-4 h-4 text-emerald-600" />
          )}
        </div>

        <input
          id={`${id}-input`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-2xs transition-all"
        />

        {presets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700"
            aria-label="Toggle location presets"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Preset Suggestions Dropdown */}
      {showDropdown && presets.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 overflow-hidden max-h-56 overflow-y-auto">
            <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isOrigin ? 'Suggested Origins' : 'Campus Destinations'}
            </div>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2 text-xs"
                onClick={() => {
                  onChange(preset.name);
                  onSelectPreset?.(preset);
                  setShowDropdown(false);
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{preset.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{preset.address}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
