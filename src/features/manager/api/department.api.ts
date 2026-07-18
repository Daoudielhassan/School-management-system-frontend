/**
 * Department overview API layer — `/api/managers/{managerId}/department/**`.
 * Everything here is scoped server-side to the manager's own department
 * (`ManagerAccessGuard`) — no department id is ever passed from the client.
 */
import { apiGet, apiPatch, API_ENDPOINTS } from '@/config/api';
import type { ClassGroupLite, SessionData, AttendanceResponse, AttendanceStatus, DiplomaResponse } from '../types';

/** `GET /api/managers/{managerId}/department/class-groups`. */
export function fetchDepartmentClassGroups(managerId: string, token?: string): Promise<ClassGroupLite[]> {
  return apiGet<ClassGroupLite[]>(API_ENDPOINTS.MANAGERS.DEPARTMENTS(managerId), token);
}

/** `GET /api/managers/{managerId}/department/sessions`. */
export function fetchDepartmentSessions(managerId: string, token?: string): Promise<SessionData[]> {
  return apiGet<SessionData[]>(API_ENDPOINTS.MANAGERS.SESSIONS(managerId), token);
}

/** `GET /api/managers/{managerId}/department/attendance`. */
export function fetchDepartmentAttendance(managerId: string, token?: string): Promise<AttendanceResponse[]> {
  return apiGet<AttendanceResponse[]>(API_ENDPOINTS.MANAGERS.ATTENDANCE(managerId), token);
}

/** `GET /api/managers/{managerId}/department/diplomas`. */
export function fetchDepartmentDiplomas(managerId: string, token?: string): Promise<DiplomaResponse[]> {
  return apiGet<DiplomaResponse[]>(API_ENDPOINTS.MANAGERS.DIPLOMAS(managerId), token);
}

/** `PATCH /api/managers/{managerId}/attendance/{attendanceId}/status`. */
export function updateDepartmentAttendanceStatus(
  managerId: string,
  attendanceId: string,
  status: AttendanceStatus,
  token?: string
): Promise<AttendanceResponse> {
  return apiPatch<AttendanceResponse>(
    API_ENDPOINTS.MANAGERS.UPDATE_ATTENDANCE(managerId, attendanceId),
    { status },
    token
  );
}
