/**
 * Read-side hooks for the teaching modules feature.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchModules } from '../api/modules.api';
import { MODULES_QUERY_KEY } from '../constants';
import type { TeachingModule } from '../types';

/** Fetch all teaching modules. Read-only and role-open — usable by admin and manager alike. */
export function useModules() {
  const { token } = useAuth();

  return useQuery<TeachingModule[]>({
    queryKey: MODULES_QUERY_KEY,
    queryFn: () => fetchModules(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}
