import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerId } from './useMyProfile';
import { fetchMyActiveAssignments, fetchMyResponsibilities, fetchMyRecentActions } from '../api/assignments.api';
import { MANAGER_ASSIGNMENTS_QUERY_KEY, MANAGER_RESPONSIBILITIES_QUERY_KEY, MANAGER_ACTIONS_QUERY_KEY } from '../constants';
import type { ManagerAssignment, ManagerResponsibility, ManagerAction } from '../types';

/** `GET /api/manager-assignments/manager/{managerId}/active`. */
export function useMyActiveAssignments() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ManagerAssignment[]>({
    queryKey: [...MANAGER_ASSIGNMENTS_QUERY_KEY, managerId],
    queryFn: () => fetchMyActiveAssignments(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/manager-responsibilities/manager/{managerId}`. */
export function useMyResponsibilities() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ManagerResponsibility[]>({
    queryKey: [...MANAGER_RESPONSIBILITIES_QUERY_KEY, managerId],
    queryFn: () => fetchMyResponsibilities(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/manager-actions/manager/{managerId}/recent`. */
export function useMyRecentActions(limit = 10) {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ManagerAction[]>({
    queryKey: [...MANAGER_ACTIONS_QUERY_KEY, managerId, limit],
    queryFn: () => fetchMyRecentActions(managerId as string, limit, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 60_000,
  });
}
