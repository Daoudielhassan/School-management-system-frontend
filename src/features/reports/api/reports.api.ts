/**
 * Reports API layer — education-core-service read-only `/api/reports/**` (§2.14).
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { AttendanceReport, GradeReport, SubjectLite } from '../types';

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

export function fetchAttendanceReportForStudent(
  studentId: string,
  token?: string
): Promise<AttendanceReport> {
  return apiGet<AttendanceReport>(API_ENDPOINTS.REPORTS.ATTENDANCE_STUDENT(studentId), token);
}

export function fetchAttendanceReportForClass(
  classGroupId: string,
  token?: string
): Promise<AttendanceReport> {
  return apiGet<AttendanceReport>(API_ENDPOINTS.REPORTS.ATTENDANCE_CLASS_GROUP(classGroupId), token);
}

export function fetchGradeReportForStudent(studentId: string, token?: string): Promise<GradeReport> {
  return apiGet<GradeReport>(API_ENDPOINTS.REPORTS.GRADES_STUDENT(studentId), token);
}

export function fetchGradeReportForSubject(subjectId: string, token?: string): Promise<GradeReport> {
  return apiGet<GradeReport>(API_ENDPOINTS.REPORTS.GRADES_SUBJECT(subjectId), token);
}

export async function fetchSubjects(token?: string): Promise<SubjectLite[]> {
  return asArray<SubjectLite>(await apiGet(API_ENDPOINTS.SUBJECTS.BASE, token));
}
