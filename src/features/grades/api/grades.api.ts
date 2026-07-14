/**
 * Grades API layer — education-core-service `/api/grades` (§2.10).
 */
import { apiGet, apiPost, apiDelete, API_ENDPOINTS } from '@/config/api';
import type {
  GradeBundle,
  GradeResponse,
  GradeMutationPayload,
  StudentLite,
  SubjectLite,
  InstructorLite,
} from '../types';

/** Normalise both `T[]` and Spring `{ content: T[] }` responses to an array. */
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

/**
 * Fetch grades plus the lookup lists needed to resolve student/subject/
 * instructor names. Lookups swallow their own errors so one missing list
 * doesn't blank the whole screen.
 */
export async function fetchGradeBundle(token?: string): Promise<GradeBundle> {
  const [grades, students, subjects, instructors] = await Promise.all([
    apiGet(API_ENDPOINTS.GRADES.BASE, token),
    apiGet(API_ENDPOINTS.STUDENTS.BASE, token).catch(() => []),
    apiGet(API_ENDPOINTS.SUBJECTS.BASE, token).catch(() => []),
    apiGet(API_ENDPOINTS.INSTRUCTORS.BASE, token).catch(() => []),
  ]);

  return {
    grades: asArray<GradeResponse>(grades),
    students: asArray<StudentLite>(students),
    subjects: asArray<SubjectLite>(subjects),
    instructors: asArray<InstructorLite>(instructors),
  };
}

export function createGrade(payload: GradeMutationPayload, token?: string): Promise<GradeResponse> {
  return apiPost<GradeResponse>(API_ENDPOINTS.GRADES.BASE, payload, token);
}

export function deleteGrade(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.GRADES.BY_ID(id), token);
}
