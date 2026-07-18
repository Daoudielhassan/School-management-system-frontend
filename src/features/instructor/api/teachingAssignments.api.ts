/**
 * Teaching assignment API layer — `/api/teaching-assignments`. The
 * `instructorId` filter is honored as-is here, but the backend
 * `InstructorAccessGuard` always forces it to the caller's own id when the
 * caller holds ROLE_INSTRUCTOR — never trust the client for isolation.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { TeachingAssignment, SubjectLite, ClassGroupLite, AcademicYearLite } from '../types';

/** `GET /api/teaching-assignments?instructorId=`. */
export function fetchMyTeachingAssignments(instructorId: string, token?: string): Promise<TeachingAssignment[]> {
  return apiGet<TeachingAssignment[]>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER({ instructorId }), token);
}

/** `GET /api/subjects` — lookup list used to resolve subject names for display. */
export function fetchSubjects(token?: string): Promise<SubjectLite[]> {
  return apiGet<SubjectLite[]>(API_ENDPOINTS.SUBJECTS.BASE, token);
}

/** `GET /api/class-groups` — lookup list used to resolve class group names for display. */
export function fetchClassGroups(token?: string): Promise<ClassGroupLite[]> {
  return apiGet<ClassGroupLite[]>(API_ENDPOINTS.CLASSES.BASE, token);
}

/** `GET /api/academic-years` — lookup list used to resolve academic year codes for display. */
export function fetchAcademicYears(token?: string): Promise<AcademicYearLite[]> {
  return apiGet<AcademicYearLite[]>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token);
}
