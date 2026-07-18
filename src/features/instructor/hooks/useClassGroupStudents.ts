/**
 * Class roster hook: resolves a class group's enrollments then each
 * enrolled student's details. Used by the attendance sheet and the grade
 * entry form's student picker, for a class group tied to one of the
 * instructor's own teaching assignments.
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchClassGroupEnrollments, fetchStudentById } from '../api/students.api';
import { INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY } from '../constants';
import type { EnrollmentLite, StudentLite } from '../types';

export function useClassGroupStudents(classGroupId?: string) {
  const { token } = useAuth();

  const enrollmentsQuery = useQuery<EnrollmentLite[]>({
    queryKey: [...INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY, 'enrollments', classGroupId],
    queryFn: () => fetchClassGroupEnrollments(classGroupId as string, token ?? undefined),
    enabled: !!classGroupId && !!token,
    staleTime: 60_000,
  });

  const studentIds = enrollmentsQuery.data?.map((e) => e.studentId) ?? [];

  const studentResults = useQueries({
    queries: studentIds.map((id) => ({
      queryKey: [...INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY, 'student', id],
      queryFn: () => fetchStudentById(id, token ?? undefined),
      enabled: !!token,
      staleTime: 5 * 60_000,
    })),
  });

  const students = studentResults
    .map((r) => r.data)
    .filter((s): s is StudentLite => !!s);

  return {
    students,
    isLoading: enrollmentsQuery.isLoading || studentResults.some((r) => r.isLoading),
    isError: enrollmentsQuery.isError || studentResults.some((r) => r.isError),
    refetch: enrollmentsQuery.refetch,
  };
}
