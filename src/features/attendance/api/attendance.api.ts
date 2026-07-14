/**
 * Attendance API layer.
 */
import { apiGet, apiPatch, API_ENDPOINTS } from '@/config/api';
import { normalizeStatus } from '../constants';
import type {
  AttendanceBundle,
  AttendanceRecord,
  Student,
  Session,
  Subject,
  Instructor,
  AttendanceQuery,
} from '../types';

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toRecords(value: unknown): AttendanceRecord[] {
  return toArray<any>(value).map((r) => ({
    id: r.id,
    studentId: r.studentId,
    sessionId: r.sessionId,
    classGroupId: r.classGroupId,
    attendanceDate: r.attendanceDate ?? '-',
    status: normalizeStatus(r.status),
    updatedAt: r.updatedAt,
  }));
}

/**
 * Fetch attendance records plus the lookup lists needed to resolve names.
 *
 * `GET /api/attendance` requires at least one of `studentId`/`sessionId`/`date`
 * — there is no unfiltered "list everything" call. When the screen isn't
 * scoped to a student or session, we fetch the session list first, then fan
 * out one `GET /api/attendance/session/{id}` per session and merge the
 * results (the sessions list is needed for name-resolution anyway).
 *
 * Lookup calls swallow their own errors so one missing service doesn't blank
 * the whole screen (matching the original behaviour).
 */
export async function fetchAttendanceBundle(
  query: AttendanceQuery,
  token?: string
): Promise<AttendanceBundle> {
  const [students, sessionsRaw, subjects, instructors] = await Promise.all([
    apiGet(API_ENDPOINTS.STUDENTS.BASE, token).catch(() => []),
    apiGet(API_ENDPOINTS.SESSIONS.BASE, token).catch(() => []),
    apiGet(API_ENDPOINTS.SUBJECTS.BASE, token).catch(() => []),
    apiGet(API_ENDPOINTS.INSTRUCTORS.BASE, token).catch(() => []),
  ]);
  const sessions = toArray<Session>(sessionsRaw);

  let records: AttendanceRecord[];
  if (query.studentId) {
    records = toRecords(await apiGet(API_ENDPOINTS.ATTENDANCE.BY_STUDENT(query.studentId), token));
  } else if (query.sessionId) {
    records = toRecords(await apiGet(API_ENDPOINTS.ATTENDANCE.BY_SESSION(query.sessionId), token));
  } else {
    const perSession = await Promise.all(
      sessions.map((s) =>
        apiGet(API_ENDPOINTS.ATTENDANCE.BY_SESSION(s.id), token).catch(() => [])
      )
    );
    records = perSession.flatMap(toRecords);
  }

  return {
    records,
    students: toArray<Student>(students),
    sessions,
    subjects: toArray<Subject>(subjects),
    instructors: toArray<Instructor>(instructors),
  };
}

/** Update the status of a single attendance record. */
export function updateAttendanceStatus(
  id: string,
  status: string,
  token?: string
): Promise<unknown> {
  return apiPatch(`${API_ENDPOINTS.ATTENDANCE.BY_ID(id)}/status`, { status }, token);
}
