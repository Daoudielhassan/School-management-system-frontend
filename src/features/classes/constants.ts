/**
 * Static configuration for the classes feature.
 */

export const CLASSES_QUERY_KEY = ['classes'] as const;
export const CLASS_REFERENCE_QUERY_KEY = ['classes', 'reference'] as const;
export const CLASS_STUDENTS_QUERY_KEY = ['classes', 'students'] as const;

/** Page size for the students-in-class dialog. */
export const CLASS_STUDENTS_PAGE_SIZE = 10;

/** Sentinel meaning "no department filter". */
export const DEPARTMENT_FILTER_ALL = 'all';

/** Selectable academic levels. */
export const CLASS_LEVELS = [1, 2, 3, 4, 5] as const;

/** Attendance status helpers (backend uses mixed FR/EN vocab). */
export function isPresentStatus(status?: string): boolean {
  const s = (status || '').toUpperCase();
  return s === 'PRESENT' || s === 'OUI';
}

export function isAbsentStatus(status?: string): boolean {
  const s = (status || '').toUpperCase();
  return s === 'ABSENT' || s === 'NON';
}
