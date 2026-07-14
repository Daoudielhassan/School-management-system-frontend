import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyGrades, fetchMyGradeSummary } from '../api/grades.api';
import { STUDENT_GRADES_QUERY_KEY } from '../constants';
import type { GradeResponse, GradeSummary } from '../types';

/** `GET /api/grades/me`. */
export function useMyGrades() {
  const { token } = useAuth();

  return useQuery<GradeResponse[]>({
    queryKey: STUDENT_GRADES_QUERY_KEY,
    queryFn: () => fetchMyGrades(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/reports/grades/me`. */
export function useMyGradeSummary() {
  const { token } = useAuth();

  return useQuery<GradeSummary>({
    queryKey: [...STUDENT_GRADES_QUERY_KEY, 'summary'],
    queryFn: () => fetchMyGradeSummary(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}
