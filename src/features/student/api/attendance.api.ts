/**
 * Attendance API layer — `/api/attendance/me`, `/api/reports/attendance/me`,
 * `/api/attendance/{id}/justify`.
 */
import { apiGet, apiPost, API_ENDPOINTS } from '@/config/api';
import type { AttendanceResponse, AttendanceSummary, JustifyAttendancePayload } from '../types';

/** `GET /api/attendance/me` — full history, justification status included per record. */
export function fetchMyAttendance(token?: string): Promise<AttendanceResponse[]> {
  return apiGet<AttendanceResponse[]>(API_ENDPOINTS.ATTENDANCE.ME, token);
}

/** `GET /api/reports/attendance/me` — the attendance rate, used by the dashboard. */
export function fetchMyAttendanceSummary(token?: string): Promise<AttendanceSummary> {
  return apiGet<AttendanceSummary>(API_ENDPOINTS.REPORTS.ATTENDANCE_ME, token);
}

/** `POST /api/attendance/{id}/justify` — `id` comes from a record in {@link fetchMyAttendance}. */
export function justifyAttendance(
  id: string,
  payload: JustifyAttendancePayload,
  token?: string
): Promise<AttendanceResponse> {
  return apiPost<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.JUSTIFY(id), payload, token);
}
