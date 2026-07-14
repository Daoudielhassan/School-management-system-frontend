/**
 * React Query hooks for academic years.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAcademicYears,
  createAcademicYear,
  setActiveAcademicYear,
} from '../api/academic.api';
import { ACADEMIC_YEARS_QUERY_KEY } from '../constants';
import type { AcademicYear, CreateAcademicYearPayload } from '../types';

export function useAcademicYears() {
  const { token } = useAuth();

  return useQuery<AcademicYear[]>({
    queryKey: ACADEMIC_YEARS_QUERY_KEY,
    queryFn: () => fetchAcademicYears(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useCreateAcademicYear() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AcademicYear, Error, CreateAcademicYearPayload>({
    mutationFn: (payload) => createAcademicYear(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
}

export function useSetActiveAcademicYear() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (id) => setActiveAcademicYear(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY }),
  });
}
