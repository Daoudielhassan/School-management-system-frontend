export type ReportKind = 'attendance' | 'grades';
export type AttendanceScope = 'student' | 'class-group';
export type GradeScope = 'student' | 'subject';

/** Matches `AttendanceReportResponse` (§2.14) — read-only, computed on demand. */
export interface AttendanceReport {
  id: string;
  scope: string;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRatePercent: number;
}

/** Matches `GradeReportResponse` (§2.14) — read-only, computed on demand. */
export interface GradeReport {
  id: string;
  scope: string;
  count: number;
  averagePercent: number;
  minPercent: number;
  maxPercent: number;
  bySubject?: { subjectId: string; count: number; averagePercent: number }[];
}

export interface SubjectLite {
  id: string;
  name: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
