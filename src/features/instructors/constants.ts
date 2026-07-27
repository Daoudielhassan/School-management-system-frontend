/**
 * Static configuration for the instructors feature: React Query keys and
 * file-upload constraints.
 */

export const INSTRUCTORS_QUERY_KEY = ['instructors'] as const;

export const INSTRUCTORS_PAGE_SIZE = 10;

/** Accepted file extensions for bulk upload (used by the `accept` attribute). */
export const INSTRUCTOR_UPLOAD_ACCEPT = '.csv,.xlsx';

/** Allowed extensions, validated client-side before upload. */
export const INSTRUCTOR_UPLOAD_EXTENSIONS = ['csv', 'xlsx'] as const;

/** Matches the server-side limit (`InstructorController.MAX_UPLOAD_SIZE_BYTES`). */
export const INSTRUCTOR_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Header names the bulk-upload file must contain (case/whitespace-insensitive). */
export const INSTRUCTOR_UPLOAD_REQUIRED_HEADERS = ['name', 'email'] as const;
