/**
 * React Query hooks for audit logs (list + stats + clear-all).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchAuditLogs, fetchAuditLogStats, clearAuditLogs } from '../api/audit-logs.api';
import { AUDIT_LOGS_QUERY_KEY } from '../constants';
import type { AuditLogPage, AuditLogStats, AuditLogFilters } from '../types';

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { token } = useAuth();

  return useQuery<AuditLogPage>({
    queryKey: [...AUDIT_LOGS_QUERY_KEY, filters],
    queryFn: () => fetchAuditLogs(filters, token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useAuditLogStats(from?: string, to?: string) {
  const { token } = useAuth();

  return useQuery<AuditLogStats>({
    queryKey: [...AUDIT_LOGS_QUERY_KEY, 'stats', from, to],
    queryFn: () => fetchAuditLogStats(from, to, token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useClearAuditLogs() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => clearAuditLogs(token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY }),
  });
}
