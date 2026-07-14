/**
 * Static configuration for the students feature: React Query keys, pagination,
 * and file-upload constraints. Centralised so query keys never drift between
 * queries and their invalidations.
 */

/** Root key for the students list cache. Kept as `['students']` so it stays
 *  cache-compatible with the legacy `@/lib/hooks/useStudents` during migration. */
export const STUDENTS_QUERY_KEY = ['students'] as const;

/** Key for the reference data (departments / class groups / enrollments) used
 *  by the students filters. */
export const STUDENT_REFERENCE_QUERY_KEY = ['students', 'reference'] as const;

/** Client-side page size for the students table. */
export const STUDENTS_PAGE_SIZE = 10;

/** Enrollment status applied when a class is chosen at student creation. */
export const ENROLLMENT_ACTIVE_STATUS = 'ACTIVE';

/** Accepted file extensions for bulk upload (used by the `accept` attribute). */
export const STUDENT_UPLOAD_ACCEPT = '.csv,.xlsx';

/** Allowed extensions, validated client-side before upload. */
export const STUDENT_UPLOAD_EXTENSIONS = ['csv', 'xlsx'] as const;
