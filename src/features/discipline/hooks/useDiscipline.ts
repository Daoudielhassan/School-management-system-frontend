/**
 * Read-side hooks for the discipline feature.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchCases, fetchDisciplineStats } from '../api/discipline.api';
import { DISCIPLINE_QUERY_KEY } from '../constants';
import type { DisciplinePage, DisciplineStats, DisciplineFilters } from '../types';

export function useDisciplineCases(filters: DisciplineFilters, page: number) {
  const { token } = useAuth();

  return useQuery<DisciplinePage>({
    queryKey: [...DISCIPLINE_QUERY_KEY, 'cases', filters, page],
    queryFn: () => fetchCases(filters, page, token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useDisciplineStats() {
  const { token } = useAuth();

  return useQuery<DisciplineStats>({
    queryKey: [...DISCIPLINE_QUERY_KEY, 'stats'],
    queryFn: () => fetchDisciplineStats(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}
