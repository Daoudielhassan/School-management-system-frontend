/**
 * Class roster hook: resolves a class group's enrollments then each
 * enrolled student's details, in the manager's own department only.
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchClassGroupEnrollments, fetchStudentById } from '../api/students.api';
import type { EnrollmentLite, StudentLite } from '../types';

const CLASS_STUDENTS_QUERY_KEY = ['manager', 'class-students'] as const;

export function useClassGroupStudents(classGroupId?: string) {
  const { token } = useAuth();

  const enrollmentsQuery = useQuery<EnrollmentLite[]>({
    queryKey: [...CLASS_STUDENTS_QUERY_KEY, 'enrollments', classGroupId],
    queryFn: () => fetchClassGroupEnrollments(classGroupId as string, token ?? undefined),
    enabled: !!classGroupId && !!token,
    staleTime: 60_000,
  });

  const studentIds = enrollmentsQuery.data?.map((e) => e.studentId) ?? [];

  const studentResults = useQueries({
    queries: studentIds.map((id) => ({
      queryKey: [...CLASS_STUDENTS_QUERY_KEY, 'student', id],
      queryFn: () => fetchStudentById(id, token ?? undefined),
      enabled: !!token,
      staleTime: 5 * 60_000,
    })),
  });

  const students = studentResults
    .map((r) => r.data)
    .filter((s): s is StudentLite => !!s);

  const enrollmentByStudentId = new Map((enrollmentsQuery.data ?? []).map((e) => [e.studentId, e]));

  return {
    students,
    enrollmentByStudentId,
    isLoading: enrollmentsQuery.isLoading || studentResults.some((r) => r.isLoading),
    isError: enrollmentsQuery.isError || studentResults.some((r) => r.isError),
    refetch: enrollmentsQuery.refetch,
  };
}
