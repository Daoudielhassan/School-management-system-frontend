import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchGradeBundle, createGrade, deleteGrade } from '../api/grades.api';
import { resolveGrades, computeGradeStats, filterGrades } from '../lib/grade-selectors';
import { GRADES_QUERY_KEY } from '../constants';
import type {
  GradeBundle,
  GradeFilters,
  StudentGrade,
  GradeStats,
  GradeMutationPayload,
  GradeResponse,
} from '../types';

const EMPTY_BUNDLE: GradeBundle = { grades: [], students: [], subjects: [], instructors: [] };

/** Fetch the raw grades bundle (grades + lookups). */
export function useGradeBundle() {
  const { token } = useAuth();

  return useQuery<GradeBundle>({
    queryKey: GRADES_QUERY_KEY,
    queryFn: () => fetchGradeBundle(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export interface UseGradesScreenResult {
  grades: StudentGrade[];
  filtered: StudentGrade[];
  stats: GradeStats;
  isLoading: boolean;
}

/**
 * High-level hook for the grades screen: resolves grades to display names,
 * derives performance/trend + stats client-side, and applies filters.
 */
export function useGradesScreen(filters: GradeFilters): UseGradesScreenResult {
  const { data, isLoading } = useGradeBundle();
  const bundle = data ?? EMPTY_BUNDLE;

  const grades = useMemo(() => resolveGrades(bundle), [bundle]);
  const stats = useMemo(() => computeGradeStats(grades), [grades]);
  const filtered = useMemo(() => filterGrades(grades, filters), [grades, filters]);

  return { grades, filtered, stats, isLoading };
}

export function useCreateGrade() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GradeResponse, Error, GradeMutationPayload>({
    mutationFn: (payload) => createGrade(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEY }),
  });
}

export function useDeleteGrade() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteGrade(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEY }),
  });
}
