import React from 'react';
import { CloudRain } from 'lucide-react';

export interface HeavyRainToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
  id?: string;
}

export const HeavyRainToggle: React.FC<HeavyRainToggleProps> = ({
  enabled,
  onToggle,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs transition-colors ${
        enabled ? 'border-amber-300 bg-amber-50/50' : 'hover:border-slate-300'
      } ${className}`}
    >
      <div
        className={`p-1.5 rounded-lg transition-colors ${
          enabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <CloudRain className={`w-4 h-4 ${enabled ? 'animate-bounce' : ''}`} />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-slate-900 leading-tight">
          Heavy Rain Mode
        </span>
        <span className="text-[11px] text-slate-500">
          {enabled ? 'Active • Recalculating' : 'Off • Standard weather'}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
          enabled ? 'bg-amber-500' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
