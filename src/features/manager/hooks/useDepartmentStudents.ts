/**
 * Aggregates every student enrolled in any class group of the manager's own
 * department — used to populate name-based pickers (never a raw id input).
 */
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useDepartmentClassGroups } from './useDepartment';
import { fetchClassGroupEnrollments, fetchStudentById } from '../api/students.api';
import type { StudentLite } from '../types';

const DEPARTMENT_STUDENTS_QUERY_KEY = ['manager', 'department-students'] as const;

export function useDepartmentStudents() {
  const { token } = useAuth();
  const { data: classGroups = [] } = useDepartmentClassGroups();

  const enrollmentResults = useQueries({
    queries: classGroups.map((c) => ({
      queryKey: [...DEPARTMENT_STUDENTS_QUERY_KEY, 'enrollments', c.id],
      queryFn: () => fetchClassGroupEnrollments(c.id, token ?? undefined),
      enabled: !!token,
      staleTime: 60_000,
    })),
  });

  const studentIds = Array.from(
    new Set(enrollmentResults.flatMap((r) => (r.data ?? []).map((e) => e.studentId)))
  );

  const studentResults = useQueries({
    queries: studentIds.map((id) => ({
      queryKey: [...DEPARTMENT_STUDENTS_QUERY_KEY, 'student', id],
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
