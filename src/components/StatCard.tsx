import React from 'react';
import { Card } from './ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  tone = 'default',
  className = '',
  id,
}) => {
  const toneStyles = {
    default: {
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
      borderAccent: 'border-slate-200/80',
    },
    success: {
      iconBg: 'bg-emerald-100 text-emerald-700',
      valueColor: 'text-emerald-700',
      borderAccent: 'border-emerald-200/80 hover:border-emerald-300',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-800',
      valueColor: 'text-amber-800',
      borderAccent: 'border-amber-200/80 hover:border-amber-300',
    },
    danger: {
      iconBg: 'bg-rose-100 text-rose-700',
      valueColor: 'text-rose-700',
      borderAccent: 'border-rose-200/80 hover:border-rose-300',
    },
    info: {
      iconBg: 'bg-sky-100 text-sky-700',
      valueColor: 'text-sky-700',
      borderAccent: 'border-sky-200/80 hover:border-sky-300',
    },
  }[tone];

  return (
    <Card
      id={id}
      className={`border ${toneStyles.borderAccent} transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      padding="md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.valueColor}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${toneStyles.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
