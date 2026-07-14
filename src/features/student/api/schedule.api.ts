/**
 * Schedule API layer. Building the week view is a 2–3 step chain:
 *   1. enrollments for the current student → class group id
 *   2. sessions for that class group / week → room + instructorId
 *   3. (optional) instructor id → display name
 * Each step is a plain function here; the chaining itself lives in the hooks
 * (`../hooks/useMySchedule.ts`) since it depends on cached query results.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { EnrollmentData, WeekSchedule, InstructorLite } from '../types';

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
