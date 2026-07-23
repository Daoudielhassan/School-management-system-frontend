/**
 * Pure selectors for the attendance feature: resolve foreign keys to display
 * names, compute stats, and filter. Extracted from the page's lookup helpers +
 * inline stats math.
 */
import { STATUS_FILTER_ALL } from '../constants';
import type {
  AttendanceBundle,
  ResolvedAttendanceRecord,
  AttendanceStats,
  AttendanceFilters,
  Session,
} from '../types';

/** Resolve every raw record to display strings using the bundle's lookups. */
export function resolveRecords(bundle: AttendanceBundle): ResolvedAttendanceRecord[] {
  const students = new Map(bundle.students.map((s) => [s.id, s]));
  const sessions = new Map(bundle.sessions.map((s) => [s.id, s]));
  const subjects = new Map(bundle.subjects.map((s) => [s.id, s]));
  const instructors = new Map(bundle.instructors.map((i) => [i.id, i]));
  const teachingAssignments = new Map(bundle.teachingAssignments.map((a) => [a.id, a]));

  const sessionTime = (session?: Session) =>
    session ? session.startsAt.split('T')[1]?.substring(0, 5) ?? '-' : '-';

  return bundle.records.map((r) => {
    const student = students.get(r.studentId);
    const session = sessions.get(r.sessionId);
    // Session no longer carries subjectId/instructorId directly — resolve
    // through its teachingAssignmentId (§2.15/§2.19).
    const assignment = session?.teachingAssignmentId
      ? teachingAssignments.get(session.teachingAssignmentId)
      : undefined;
    return {
      id: r.id,
      studentId: r.studentId,
      sessionId: r.sessionId,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu',
      subjectName: assignment
        ? subjects.get(assignment.subjectId)?.name ?? 'Matière inconnue'
        : '-',
      instructorName: assignment
        ? instructors.get(assignment.instructorId)?.name ?? 'Instructeur inconnu'
        : '-',
      attendanceDate: r.attendanceDate,
      time: sessionTime(session),
      room: session?.room ?? '-',
      status: r.status,
    };
  });
}

export function computeStats(records: ResolvedAttendanceRecord[]): AttendanceStats {
  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absentOrLate = records.filter((r) => r.status === 'ABSENT' || r.status === 'LATE').length;

  return {
    totalSessions: new Set(records.map((r) => r.sessionId)).size,
    totalStudents: new Set(records.map((r) => r.studentId)).size,
    overallAttendanceRate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    pendingJustifications: absentOrLate,
  };
}

export function filterRecords(
  records: ResolvedAttendanceRecord[],
  filters: AttendanceFilters
): ResolvedAttendanceRecord[] {
  const q = filters.search.toLowerCase();
  return records.filter((r) => {
    const matchesSearch =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.subjectName.toLowerCase().includes(q) ||
      r.instructorName.toLowerCase().includes(q);
    const matchesStatus = filters.status === STATUS_FILTER_ALL || r.status === filters.status;
    return matchesSearch && matchesStatus;
  });
}
