/**
 * Aggregates every student across all of the instructor's own active
 * teaching assignments — used to populate name-based pickers (e.g.
 * composing a message), never a raw id input.
 */
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyTeachingAssignments } from './useMyTeachingAssignments';
import { fetchClassGroupEnrollments, fetchStudentById } from '../api/students.api';
import { INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY } from '../constants';
import type { StudentLite } from '../types';

export function useMyStudents() {
  const { token } = useAuth();
  const { data: assignments = [] } = useMyTeachingAssignments();

  const classGroupIds = Array.from(new Set(assignments.map((a) => a.classGroupId)));

  const enrollmentResults = useQueries({
    queries: classGroupIds.map((id) => ({
      queryKey: [...INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY, 'enrollments', id],
      queryFn: () => fetchClassGroupEnrollments(id, token ?? undefined),
      enabled: !!token,
      staleTime: 60_000,
    })),
  });

  const studentIds = Array.from(
    new Set(enrollmentResults.flatMap((r) => (r.data ?? []).map((e) => e.studentId)))
  );

  const studentResults = useQueries({
    queries: studentIds.map((id) => ({
      queryKey: [...INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY, 'student', id],
      queryFn: () => fetchStudentById(id, token ?? undefined),
      enabled: !!token,
      staleTime: 5 * 60_000,
    })),
  });

  const students: StudentLite[] = studentResults
    .map((r) => r.data)
    .filter((s): s is StudentLite => !!s)
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  return {
    students,
    isLoading: enrollmentResults.some((r) => r.isLoading) || studentResults.some((r) => r.isLoading),
  };
}
