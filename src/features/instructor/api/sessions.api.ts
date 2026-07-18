/**
 * Schedule API layer — the instructor-scoped session shortcuts. The backend
 * `InstructorAccessGuard` forces `instructorId` to the caller's own id when
 * the caller holds ROLE_INSTRUCTOR, so passing "self" here is always safe.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { SessionData } from '../types';

/** `GET /api/sessions/instructor/{instructorId}`. */
export function fetchMySessions(instructorId: string, token?: string): Promise<SessionData[]> {
  return apiGet<SessionData[]>(API_ENDPOINTS.SESSIONS.BY_INSTRUCTOR(instructorId), token);
}

/** `GET /api/sessions/instructor/{instructorId}/date/{date}`. */
export function fetchMySessionsByDate(instructorId: string, date: string, token?: string): Promise<SessionData[]> {
  return apiGet<SessionData[]>(API_ENDPOINTS.SESSIONS.BY_INSTRUCTOR_AND_DATE(instructorId, date), token);
}

/** `GET /api/sessions/upcoming?instructorId=&limit=`. */
export function fetchMyUpcomingSessions(instructorId: string, limit: number, token?: string): Promise<SessionData[]> {
  return apiGet<SessionData[]>(API_ENDPOINTS.SESSIONS.UPCOMING({ instructorId, limit }), token);
}
