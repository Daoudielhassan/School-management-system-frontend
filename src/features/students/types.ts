/**
 * Domain types for the students feature.
 *
 * These describe the shapes returned by / sent to the education-core service.
 * UI-only view models (filters, table rows) live here too so components stay
 * "dumb" and only consume typed data.
 */

/** A student as returned by `GET /api/students`. */
export interface StudentData {
  id: string;
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
}

/** Response of `POST /api/students`. May include a one-time password to display. */
export interface CreateStudentResponse extends StudentData {
  temporaryPassword?: string;
}

/** Payload sent to create / update a student (empty optionals normalised to null). */
export interface StudentMutationPayload {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

/** Result of a bulk CSV/XLSX upload. */
export interface BulkUploadResult {
  count?: number;
  message?: string;
}

// --- Reference data (used to build the department / class filters) ----------

export interface Department {
  id: string;
  name: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  departmentId?: string;
  level: number;
}

export interface EnrollmentData {
  id: string;
  studentId: string;
  classGroupId: string;
  status: string;
}

export interface StudentReferenceData {
  departments: Department[];
  classGroups: ClassGroup[];
  enrollments: EnrollmentData[];
}

// --- View models ------------------------------------------------------------

/** Filter criteria applied client-side to the students list. */
export interface StudentFilters {
  search: string;
  departmentId: string;
  classId: string;
}

/** A page of filtered students plus the metadata a paginator needs. */
export interface PagedStudents {
  rows: StudentData[];
  totalItems: number;
  totalPages: number;
  page: number;
}
