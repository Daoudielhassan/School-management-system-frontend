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
  ModuleLite,
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

/**
 * `GET /api/modules?departmentId=&level=` — the modules of the selected class
 * group's filière, narrowed to its level, used to populate the create-assignment
 * form's module step. Returns [] until a class group is picked (no useless
 * unscoped fetch of every department's modules).
 */
export function fetchModulesByDepartmentAndLevel(
  params: { departmentId?: string; level?: number },
  token?: string
): Promise<ModuleLite[]> {
  if (!params.departmentId || params.level == null) {
    return Promise.resolve([]);
  }
  return apiGet<ModuleLite[]>(API_ENDPOINTS.MODULES.FILTER(params), token);
}

/**
 * `GET /api/subjects?moduleId=` — the subjects of the selected module, used to
 * populate the create-assignment form's subject step. Returns [] until a
 * module is picked. Distinct from {@link fetchSubjects}, which other callers
 * (session dialogs, reports, assignment lists) use for the full, unfiltered
 * catalogue to resolve display names.
 */
export function fetchSubjectsByModule(moduleId: string | undefined, token?: string): Promise<SubjectLite[]> {
  if (!moduleId) {
    return Promise.resolve([]);
  }
  return apiGet<SubjectLite[]>(API_ENDPOINTS.SUBJECTS.FILTER({ moduleId }), token);
}

/** `GET /api/instructors`. */
export function fetchInstructors(token?: string): Promise<InstructorLite[]> {
  return apiGet<InstructorLite[]>(API_ENDPOINTS.INSTRUCTORS.BASE, token);
}

/** `GET /api/academic-years`. */
export function fetchAcademicYears(token?: string): Promise<AcademicYearLite[]> {
  return apiGet<AcademicYearLite[]>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token);
}
