/**
 * Schedule API layer. Building the week view is a chain:
 *   1. enrollments for the current student → class group id
 *   2. sessions for that class group / week → room + teachingAssignmentId
 *   3. (optional) teaching assignment id → instructor id (§2.19)
 *   4. (optional) instructor id → display name
 * Each step is a plain function here; the chaining itself lives in the hooks
 * (`../hooks/useMySchedule.ts`) since it depends on cached query results.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { EnrollmentData, WeekSchedule, InstructorLite } from '../types';
import type { TeachingAssignment } from '@/types/education';

/** `GET /api/enrollments?studentId={monStudentId}` — `studentId` is the student's own id. */
export function fetchMyEnrollments(studentId: string, token?: string): Promise<EnrollmentData[]> {
  return apiGet<EnrollmentData[]>(API_ENDPOINTS.ENROLLMENTS.BY_STUDENT(studentId), token);
}

/** `GET /api/sessions/class-group/{classGroupId}/week/grouped?weekStart=...` — grouped by day. */
export function fetchWeekSchedule(
  classGroupId: string,
  weekStart: string,
  token?: string
): Promise<WeekSchedule> {
  return apiGet<WeekSchedule>(
    API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK_GROUPED(classGroupId, weekStart),
    token
  );
}

/** `GET /api/instructors/{instructorId}` — accessible to any authenticated user. */
export function fetchInstructor(instructorId: string, token?: string): Promise<InstructorLite> {
  return apiGet<InstructorLite>(API_ENDPOINTS.INSTRUCTORS.BY_ID(instructorId), token);
}

/** `GET /api/teaching-assignments/{id}` — resolves a session's class/subject/instructor. */
export function fetchTeachingAssignment(id: string, token?: string): Promise<TeachingAssignment> {
  return apiGet<TeachingAssignment>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.BY_ID(id), token);
}

/** `GET /api/teaching-assignments?classGroupId=...` — every assignment for the student's own class. */
export function fetchTeachingAssignmentsByClassGroup(
  classGroupId: string,
  token?: string
): Promise<TeachingAssignment[]> {
  return apiGet<TeachingAssignment[]>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER({ classGroupId }), token);
}
