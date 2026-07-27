/**
 * Read-side hooks for the instructors feature.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchInstructors } from '../api/instructors.api';
import { INSTRUCTORS_QUERY_KEY } from '../constants';
import type { InstructorData } from '../types';

/** `GET /api/instructors`. */
export function useInstructors() {
  const { token } = useAuth();

  return useQuery<InstructorData[]>({
    queryKey: INSTRUCTORS_QUERY_KEY,
    queryFn: () => fetchInstructors(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}
