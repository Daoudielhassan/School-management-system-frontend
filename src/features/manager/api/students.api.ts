/**
 * Class roster API layer — `GET /api/class-groups/{id}/students` (own
 * department, enforced server-side) plus per-student detail lookups.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { EnrollmentLite, StudentLite } from '../types';

/** `GET /api/class-groups/{classGroupId}/students`. */
export function fetchClassGroupEnrollments(classGroupId: string, token?: string): Promise<EnrollmentLite[]> {
  return apiGet<EnrollmentLite[]>(API_ENDPOINTS.CLASSES.STUDENTS(classGroupId), token);
}

/** `GET /api/students/{id}`. */
export function fetchStudentById(studentId: string, token?: string): Promise<StudentLite> {
  return apiGet<StudentLite>(API_ENDPOINTS.STUDENTS.BY_ID(studentId), token);
}
