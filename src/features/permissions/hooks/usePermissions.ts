import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchPermissions } from '../api/permissions.api';
import { PERMISSIONS_QUERY_KEY, ROLES } from '../constants';
import type { Permission } from '../types';

export function usePermissions() {
  const { token } = useAuth();

  return useQuery<Permission[]>({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: () => fetchPermissions(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Group permissions by role (every role present, even if empty). */
export function usePermissionsByRole() {
  const query = usePermissions();
  const permissions = query.data ?? [];

  const byRole = useMemo(() => {
    const acc: Record<string, Permission[]> = {};
    for (const role of ROLES) {
      acc[role] = permissions.filter((p) => p.role === role);
    }
    return acc;
  }, [permissions]);

  return { byRole, isLoading: query.isLoading };
}
