import { RiskLevel, RiskEvaluation } from '../types';

/**
 * Calculates risk level based on score (0–100)
 * 0–30 = LOW
 * 31–60 = MEDIUM
 * 61–100 = HIGH
 */
export function getRiskLevel(score: number): RiskLevel {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  if (normalized <= 30) return 'LOW';
  if (normalized <= 60) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Returns user-facing label for the risk score
 */
export function getRiskLabel(score: number): string {
  const level = getRiskLevel(score);
  switch (level) {
    case 'LOW':
      return 'LOW RISK';
    case 'MEDIUM':
      return 'MEDIUM RISK';
    case 'HIGH':
      return 'HIGH RISK';
  }
}

/**
 * Returns dynamic color tokens (Tailwind classes + Hex for Canvas/Leaflet)
 * GREEN: 0–30 (Low)
 * YELLOW/AMBER: 31–60 (Medium)
 * RED: 61–100 (High)
 */
export function getRiskColor(score: number) {
  const level = getRiskLevel(score);

  switch (level) {
    case 'LOW':
      return {
        level: 'LOW' as const,
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badgeFill: 'bg-emerald-500',
        progress: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20',
        hex: '#10b981', // emerald-500
        darkHex: '#047857',
        lightHex: '#ecfdf5',
      };
    case 'MEDIUM':
      return {
        level: 'MEDIUM' as const,
        text: 'text-amber-800',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeFill: 'bg-amber-500',
        progress: 'bg-amber-500',
        glow: 'shadow-amber-500/20',
        hex: '#f59e0b', // amber-500
        darkHex: '#b45309',
        lightHex: '#fffbeb',
      };
    case 'HIGH':
      return {
        level: 'HIGH' as const,
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        badgeFill: 'bg-rose-500',
        progress: 'bg-rose-500',
        glow: 'shadow-rose-500/20',
        hex: '#ef4444', // rose-500
        darkHex: '#b91c1c',
        lightHex: '#fff1f2',
      };
  }
}

/**
 * Returns full evaluation record
 */
export function evaluateRisk(score: number): RiskEvaluation {
  const level = getRiskLevel(score);
  const colors = getRiskColor(score);
  const label = getRiskLabel(score);

  return {
    level,
    label,
    colorClass: {
      bg: colors.bg,
      text: colors.text,
      border: colors.border,
      badgeBg: colors.badgeBg,
      progress: colors.progress,
      fillHex: colors.hex,
    },
  };
}
