import React from 'react';
import { getRiskColor, getRiskLevel } from '../utils/riskUtils';

export interface RiskScoreProps {
  score: number;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  showBar = true,
  size = 'md',
  className = '',
  id,
}) => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getRiskColor(normalized);
  const level = getRiskLevel(normalized);

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const numberSizes = {
    sm: 'text-sm font-bold',
    md: 'text-lg font-extrabold',
    lg: 'text-2xl font-black',
  };

  return (
    <div id={id} className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-slate-600 font-medium ${textSizes[size]}`}>
          Risk Score
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`${numberSizes[size]} ${colors.text}`}>
            {normalized}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      {showBar && (
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${colors.progress}`}
            style={{ width: `${normalized}%` }}
          />
        </div>
      )}
    </div>
  );
};
