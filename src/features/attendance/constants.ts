/**
 * Static configuration for the attendance feature.
 */

export const ATTENDANCE_QUERY_KEY = ['attendance'] as const;

export const STATUS_FILTER_ALL = 'all';

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

/** Normalise the mixed FR/EN backend vocabulary to a canonical status. */
export function normalizeStatus(status?: string): string {
  const s = (status || '').toUpperCase();
  if (s === 'OUI') return 'PRESENT';
  if (s === 'NON') return 'ABSENT';
  return s || 'ABSENT';
}

interface StatusMeta {
  label: string;
  badgeClass: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  PRESENT: { label: 'Present', badgeClass: 'bg-green-500/20 text-green-300 border-green-400/30' },
  ABSENT: { label: 'Absent', badgeClass: 'bg-red-500/20 text-red-300 border-red-400/30' },
  LATE: { label: 'Late', badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' },
  EXCUSED: { label: 'Excused', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
};

const DEFAULT_META: StatusMeta = {
  label: 'Unknown',
  badgeClass: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
};

export function statusLabel(status: string): string {
  return STATUS_META[status]?.label ?? DEFAULT_META.label;
}

export function statusBadgeClass(status: string): string {
  return STATUS_META[status]?.badgeClass ?? DEFAULT_META.badgeClass;
}
