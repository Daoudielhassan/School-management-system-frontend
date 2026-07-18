/**
 * Resolves a list of raw studentIds to display names — used wherever a list
 * (e.g. entered grades) references students across potentially different
 * classes, so a single class-group roster isn't enough to name them all.
 */
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchStudentById } from '../api/students.api';
import { INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY } from '../constants';

export function useStudentNames(studentIds: string[]): Record<string, string> {
  const { token } = useAuth();
  const uniqueIds = useMemo(() => Array.from(new Set(studentIds)), [studentIds]);

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: [...INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY, 'student', id],
      queryFn: () => fetchStudentById(id, token ?? undefined),
      enabled: !!token,
      staleTime: 5 * 60_000,
    })),
  });

  return useMemo(() => {
    const names: Record<string, string> = {};
    uniqueIds.forEach((id, i) => {
      const student = results[i]?.data;
      if (student) names[id] = `${student.firstName} ${student.lastName}`;
    });
    return names;
  }, [uniqueIds, results]);
}
