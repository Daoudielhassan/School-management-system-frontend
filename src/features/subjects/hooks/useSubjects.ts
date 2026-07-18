/**
 * Read-side hooks for the subjects feature.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchSubjects } from '../api/subjects.api';
import { SUBJECTS_QUERY_KEY } from '../constants';
import type { Subject } from '../types';

/** Fetch all subjects. Read-only and role-open — usable by admin and manager alike. */
export function useSubjects() {
  const { token } = useAuth();

  return useQuery<Subject[]>({
    queryKey: SUBJECTS_QUERY_KEY,
    queryFn: () => fetchSubjects(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}
