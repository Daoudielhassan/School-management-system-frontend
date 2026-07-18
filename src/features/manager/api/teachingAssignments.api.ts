/**
 * Teaching assignment API layer — `/api/teaching-assignments` (read) and
 * `/api/managers/{managerId}/teaching-assignments` (create, §2.19), plus the
 * lookup lists (`Subject`, `Instructor`, `AcademicYear`) needed to build the
 * create form.
 */
import { apiGet, apiPatch, apiPost, API_ENDPOINTS } from '@/config/api';
import type {
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  SubjectLite,
  InstructorLite,
  AcademicYearLite,
} from '../types';

/** `GET /api/teaching-assignments` — only one of departmentId/classGroupId/instructorId at a time. */
export function fetchTeachingAssignments(
  params: { departmentId?: string; classGroupId?: string; instructorId?: string },
  token?: string
): Promise<TeachingAssignment[]> {
  return apiGet<TeachingAssignment[]>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER(params), token);
}

/** `GET /api/teaching-assignments/{id}`. */
export function fetchTeachingAssignment(id: string, token?: string): Promise<TeachingAssignment> {
  return apiGet<TeachingAssignment>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.BY_ID(id), token);
}

/** `POST /api/managers/{managerId}/teaching-assignments`. */
export function createTeachingAssignment(
  managerId: string,
  payload: TeachingAssignmentCreatePayload,
  token?: string
): Promise<TeachingAssignment> {
  return apiPost<TeachingAssignment>(API_ENDPOINTS.MANAGERS.TEACHING_ASSIGNMENTS(managerId), payload, token);
}

/** `PATCH /api/teaching-assignments/{id}/cancel`. */
export function cancelTeachingAssignment(id: string, token?: string): Promise<TeachingAssignment> {
  return apiPatch<TeachingAssignment>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.CANCEL(id), {}, token);
}

/** `GET /api/subjects` — global catalogue, used to populate the create-assignment form. */
export function fetchSubjects(token?: string): Promise<SubjectLite[]> {
  return apiGet<SubjectLite[]>(API_ENDPOINTS.SUBJECTS.BASE, token);
}

/** `GET /api/instructors`. */
export function fetchInstructors(token?: string): Promise<InstructorLite[]> {
  return apiGet<InstructorLite[]>(API_ENDPOINTS.INSTRUCTORS.BASE, token);
}

/** `GET /api/academic-years`. */
export function fetchAcademicYears(token?: string): Promise<AcademicYearLite[]> {
  return apiGet<AcademicYearLite[]>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token);
}
