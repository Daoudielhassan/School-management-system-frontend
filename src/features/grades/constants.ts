import type { GradePerformance } from './types';

export const GRADES_QUERY_KEY = ['grades'] as const;

export const SUBJECT_FILTER_ALL = 'all';
export const PERFORMANCE_FILTER_ALL = 'all';

/** `EvaluationType` enum (§2.10). */
export const EVALUATION_TYPES = ['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER'] as const;

export const EVALUATION_TYPE_OPTIONS = EVALUATION_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase(),
}));

export const PERFORMANCE_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'weak', label: 'Weak' },
] as const;

/** Solid fill classes per performance band (progress bars etc.) — no gradients. */
export const PERFORMANCE_SOLID: Record<string, string> = {
  excellent: 'bg-green-500',
  good: 'bg-blue-500',
  average: 'bg-yellow-500',
  weak: 'bg-red-500',
};

export const PERFORMANCE_BG: Record<string, string> = {
  excellent: 'bg-green-500/20 border-green-400/30',
  good: 'bg-blue-500/20 border-blue-400/30',
  average: 'bg-yellow-500/20 border-yellow-400/30',
  weak: 'bg-red-500/20 border-red-400/30',
};

export function performanceSolid(p: string): string {
  return PERFORMANCE_SOLID[p] ?? 'bg-gray-500';
}

export function performanceBg(p: string): string {
  return PERFORMANCE_BG[p] ?? 'bg-gray-500/20 border-gray-400/30';
}

/** Bucket a 0-100 percentage into a performance band (no backend concept — client-derived). */
export function performanceFromPercentage(pct: number): GradePerformance {
  if (pct >= 85) return 'excellent';
  if (pct >= 70) return 'good';
  if (pct >= 50) return 'average';
  return 'weak';
}
