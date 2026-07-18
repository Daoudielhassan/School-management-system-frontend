/**
 * Per-session attendance sheet API layer — `/api/attendance/session/{id}`,
 * `/api/attendance/initialize/{id}` and `/api/attendance/bulk-update`. All
 * scoped server-side to the instructor's own teaching assignments (session
 * ownership check via `InstructorAccessGuard`) — no instructor id is ever
 * passed from the client on these calls.
 */
import { apiGet, apiPatch, apiPost, API_ENDPOINTS } from '@/config/api';
import type { AttendanceResponse, AttendanceStatus } from '../types';

/** `GET /api/attendance/session/{sessionId}`. */
export function fetchSessionAttendance(sessionId: string, token?: string): Promise<AttendanceResponse[]> {
  return apiGet<AttendanceResponse[]>(API_ENDPOINTS.ATTENDANCE.BY_SESSION(sessionId), token);
}

/** `POST /api/attendance/initialize/{sessionId}` — creates PRESENT records for every enrolled student. */
export function initializeSessionAttendance(
  sessionId: string,
  token?: string
): Promise<{ newlyCreated: number; alreadyExisting: number; attendances: AttendanceResponse[] }> {
  return apiPost(API_ENDPOINTS.ATTENDANCE.INITIALIZE(sessionId), {}, token);
}

/** `PATCH /api/attendance/bulk-update`. */
export function bulkUpdateAttendance(
  updates: { attendanceId: string; status: AttendanceStatus }[],
  token?: string
): Promise<AttendanceResponse[]> {
  return apiPatch<AttendanceResponse[]>(API_ENDPOINTS.ATTENDANCE.BULK_UPDATE, { updates }, token);
}
