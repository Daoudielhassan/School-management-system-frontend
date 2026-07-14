import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAttendanceReportForStudent,
  fetchAttendanceReportForClass,
  fetchGradeReportForStudent,
  fetchGradeReportForSubject,
  fetchSubjects,
} from '../api/reports.api';
import { REPORTS_QUERY_KEY } from '../constants';
import type { AttendanceReport, GradeReport, SubjectLite, AttendanceScope, GradeScope } from '../types';

export function useSubjectsList() {
  const { token } = useAuth();

  return useQuery<SubjectLite[]>({
    queryKey: [...REPORTS_QUERY_KEY, 'subjects'],
    queryFn: () => fetchSubjects(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useAttendanceReport(scope: AttendanceScope, entityId?: string) {
  const { token } = useAuth();

  return useQuery<AttendanceReport>({
    queryKey: [...REPORTS_QUERY_KEY, 'attendance', scope, entityId],
    queryFn: () =>
      scope === 'student'
        ? fetchAttendanceReportForStudent(entityId as string, token ?? undefined)
        : fetchAttendanceReportForClass(entityId as string, token ?? undefined),
    enabled: Boolean(entityId && token),
  });
}

export function useGradeReport(scope: GradeScope, entityId?: string) {
  const { token } = useAuth();

  return useQuery<GradeReport>({
    queryKey: [...REPORTS_QUERY_KEY, 'grades', scope, entityId],
    queryFn: () =>
      scope === 'student'
        ? fetchGradeReportForStudent(entityId as string, token ?? undefined)
        : fetchGradeReportForSubject(entityId as string, token ?? undefined),
    enabled: Boolean(entityId && token),
  });
}
