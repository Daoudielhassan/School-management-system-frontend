/**
 * Students-in-class hook. Enabled only when a class id is provided (i.e. when
 * the students dialog is open), so we don't fetch the full student/enrollment
 * lists until needed.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchClassStudents } from '../api/classes.api';
import { CLASS_STUDENTS_QUERY_KEY } from '../constants';
import type { EnrolledStudent } from '../types';

export function useClassStudents(classId: string | null) {
  const { token } = useAuth();

  return useQuery<EnrolledStudent[]>({
    queryKey: [...CLASS_STUDENTS_QUERY_KEY, classId],
    queryFn: () => fetchClassStudents(classId as string, token ?? undefined),
    enabled: !!token && !!classId,
    staleTime: 30_000,
  });
}
