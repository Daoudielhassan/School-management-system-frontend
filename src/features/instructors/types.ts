/**
 * Domain types for the admin "Professeurs" directory (create/read/update/delete
 * instructor accounts + bulk upload). Deliberately self-contained — not shared
 * with `src/features/instructor` (the instructor's own self-service portal),
 * matching how `students`/`student` stay isolated bounded contexts.
 */

/** An instructor as returned by `GET /api/instructors`. */
export interface InstructorData {
  id: string;
  userId: string;
  code: string;
  name: string;
  email: string;
}

/** Response of `POST /api/instructors`. Includes a one-time `temporaryPassword`. */
export interface CreateInstructorResponse extends InstructorData {
  temporaryPassword: string;
}

/** Payload for `POST /api/instructors` — `code` is always generated server-side. */
export interface InstructorCreatePayload {
  name: string;
  email: string;
}

/** Payload for `PUT /api/instructors/{id}` — includes `code`, editable afterwards. */
export interface InstructorMutationPayload {
  code: string;
  name: string;
  email: string;
}

/** One row of a bulk CSV/XLSX upload result — success or failure. */
export interface BulkUploadRowResult {
  rowNumber: number;
  success: boolean;
  code?: string;
  name: string;
  email: string;
  temporaryPassword?: string;
  errorMessage?: string;
}

/** Result of a bulk CSV/XLSX upload — matches `BulkInstructorUploadResponse`. */
export interface BulkUploadResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: BulkUploadRowResult[];
}
