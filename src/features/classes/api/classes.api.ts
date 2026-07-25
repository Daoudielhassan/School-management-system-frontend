/**
 * Classes API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type {
  ClassGroup,
  ClassMutationPayload,
  ClassReferenceData,
  Department,
  Module,
  Subject,
  Enrollment,
  AttendanceRecord,
  UserStats,
  EnrolledStudent,
} from '../types';

/** Normalise both `T[]` and Spring `{ content: T[] }` responses to an array. */
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

export async function fetchClasses(token?: string): Promise<ClassGroup[]> {
  return asArray<ClassGroup>(await apiGet(API_ENDPOINTS.CLASSES.BASE, token));
}

export function createClass(payload: ClassMutationPayload, token?: string): Promise<ClassGroup> {
  return apiPost<ClassGroup>(API_ENDPOINTS.CLASSES.BASE, payload, token);
}

export function updateClass(
  id: string,
  payload: ClassMutationPayload,
  token?: string
): Promise<ClassGroup> {
  return apiPut<ClassGroup>(API_ENDPOINTS.CLASSES.BY_ID(String(id)), payload, token);
}

export function deleteClass(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.CLASSES.BY_ID(String(id)), token);
}

/**
 * Reference data for the dashboard + dialogs, fetched in parallel. Mirrors the
 * original page's single `Promise.all`.
 *
 * `GET /api/attendance` requires at least one of `studentId`/`sessionId`/`date`
 * — since the dashboard only needs today's count, we pass today's `date`
 * instead of fetching (and rejecting) an unfiltered list.
 */
export async function fetchClassReferenceData(token?: string): Promise<ClassReferenceData> {
  const today = new Date().toISOString().split('T')[0];
  const [departments, modules, subjects, enrollments, attendance, userStats] = await Promise.all([
    apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token),
    apiGet(API_ENDPOINTS.MODULES.BASE, token),
    apiGet(API_ENDPOINTS.SUBJECTS.BASE, token),
    apiGet(API_ENDPOINTS.ENROLLMENTS.BASE, token),
    apiGet(API_ENDPOINTS.ATTENDANCE.FILTER({ date: today }), token).catch(() => []),
    apiGet(API_ENDPOINTS.USERS.STATS, token),
  ]);

  return {
    departments: asArray<Department>(departments),
    modules: asArray<Module>(modules),
    subjects: asArray<Subject>(subjects),
    enrollments: asArray<Enrollment>(enrollments),
    attendanceRecords: asArray<AttendanceRecord>(attendance),
    userStats:
      userStats && typeof userStats === 'object'
        ? (userStats as UserStats)
        : { totalUsers: 0, admins: 0, managers: 0, instructors: 0, students: 0, enabled: 0, disabled: 0 },
  };
}

/**
 * Students enrolled in a class, resolved via the enrollment join (matching the
 * original behaviour: fetch all students + enrollments, then filter by class).
 */
export async function fetchClassStudents(
  classId: string,
  token?: string
): Promise<EnrolledStudent[]> {
  const [allStudents, allEnrollments] = await Promise.all([
    apiGet(API_ENDPOINTS.STUDENTS.BASE, token),
    apiGet(API_ENDPOINTS.ENROLLMENTS.BASE, token),
  ]);
  const students = asArray<EnrolledStudent>(allStudents);
  const enrollments = asArray<{ studentId: string; classGroupId: string }>(allEnrollments);
  const enrolledIds = new Set(
    enrollments.filter((e) => e.classGroupId === classId).map((e) => e.studentId)
  );
  return students.filter((s) => enrolledIds.has(s.id));
}
