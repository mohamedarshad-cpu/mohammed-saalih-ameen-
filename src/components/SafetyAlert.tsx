import React from 'react';
import { AlertTriangle, CloudRain, Info, ShieldAlert, X } from 'lucide-react';

export interface SafetyAlertProps {
  type?: 'warning' | 'rain' | 'danger' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  id?: string;
}

export const SafetyAlert: React.FC<SafetyAlertProps> = ({
  type = 'warning',
  title,
  message,
  onDismiss,
  actionText,
  onAction,
  className = '',
  id,
}) => {
  const styles = {
    rain: {
      container: 'bg-amber-500/10 border-amber-400/60 text-amber-950',
      iconBg: 'bg-amber-100 text-amber-800',
      Icon: CloudRain,
      badgeText: 'Weather Advisory',
    },
    warning: {
      container: 'bg-amber-50 border-amber-300 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-700',
      Icon: AlertTriangle,
      badgeText: 'Caution',
    },
    danger: {
      container: 'bg-rose-50 border-rose-300 text-rose-900',
      iconBg: 'bg-rose-100 text-rose-700',
      Icon: ShieldAlert,
      badgeText: 'High Hazard Alert',
    },
    info: {
      container: 'bg-sky-50 border-sky-300 text-sky-900',
      iconBg: 'bg-sky-100 text-sky-700',
      Icon: Info,
      badgeText: 'Campus Notice',
    },
  }[type];

  const IconComponent = styles.Icon;

  return (
    <div
      id={id}
      role="alert"
      className={`rounded-2xl border p-4 sm:p-4.5 flex items-start gap-3.5 transition-all shadow-sm ${styles.container} ${className}`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${styles.iconBg}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 shadow-2xs border border-current/10">
            {styles.badgeText}
          </span>
          {title && <h4 className="text-sm font-bold leading-tight">{title}</h4>}
        </div>
        <p className="text-sm leading-relaxed text-slate-800 font-normal">
          {message}
        </p>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {actionText}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
