/**
 * Domain + view types for the attendance feature.
 */

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  classGroupId: string;
  attendanceDate: string;
  status: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
}

export interface Session {
  id: string;
  subjectId: string;
  instructorId: string;
  startsAt: string;
  room: string | null;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Instructor {
  id: string;
  name: string;
}

/** Raw bundle returned by the API layer (records + lookup lists). */
export interface AttendanceBundle {
  records: AttendanceRecord[];
  students: Student[];
  sessions: Session[];
  subjects: Subject[];
  instructors: Instructor[];
}

/** A record with all references resolved to display strings. */
export interface ResolvedAttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  studentName: string;
  subjectName: string;
  instructorName: string;
  attendanceDate: string;
  time: string;
  room: string;
  status: string;
}

export interface AttendanceStats {
  totalSessions: number;
  totalStudents: number;
  overallAttendanceRate: number;
  pendingJustifications: number;
}

export interface AttendanceFilters {
  search: string;
  status: string;
}

/** Optional server-side query params. */
export interface AttendanceQuery {
  sessionId?: string | null;
  studentId?: string | null;
}
