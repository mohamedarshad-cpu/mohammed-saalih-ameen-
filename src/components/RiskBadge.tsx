import React from 'react';
import { getRiskColor, getRiskLabel, getRiskLevel } from '../utils/riskUtils';
import { RiskLevel } from '../types';

export interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
  id?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score = 25,
  level: overrideLevel,
  size = 'md',
  showDot = true,
  className = '',
  id,
}) => {
  const activeLevel = overrideLevel ?? getRiskLevel(score);
  // Representative score for color token if level provided directly
  const refScore = score !== undefined ? score : activeLevel === 'LOW' ? 20 : activeLevel === 'MEDIUM' ? 45 : 75;
  const colors = getRiskColor(refScore);
  const label = overrideLevel ? `${activeLevel} RISK` : getRiskLabel(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap uppercase ${colors.badgeBg} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span
          className={`rounded-full shrink-0 animate-pulse ${colors.badgeFill} ${dotSizes[size]}`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
};
