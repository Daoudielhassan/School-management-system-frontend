/**
 * Audit-logs API layer. Read endpoints go through the shared client; the CSV
 * export (blob) and the clear-all (DELETE) use `fetch` directly — the only
 * place raw fetch is allowed — because they need blob/no-JSON handling.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { AuditLogPage, AuditLogStats, AuditLogFilters } from '../types';

/** Build the query string shared by the list + export endpoints. */
function buildParams(filters: AuditLogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.action && filters.action !== 'ALL') params.set('action', filters.action);
  if (filters.resource) params.set('resource', filters.resource);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  return params;
}

export function fetchAuditLogs(
  filters: AuditLogFilters,
  token?: string
): Promise<AuditLogPage> {
  const params = buildParams(filters);
  params.set('page', String(filters.page ?? 0));
  params.set('size', String(filters.size ?? 50));
  return apiGet<AuditLogPage>(`${API_ENDPOINTS.AUDIT_LOGS.BASE}?${params.toString()}`, token);
}

export function fetchAuditLogStats(
  from?: string,
  to?: string,
  token?: string
): Promise<AuditLogStats> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return apiGet<AuditLogStats>(
    `${API_ENDPOINTS.AUDIT_LOGS.STATS}${qs ? `?${qs}` : ''}`,
    token
  );
}

/** Fetch the filtered logs as a CSV blob (auth header, not token in URL). */
export async function exportAuditLogsCsv(
  filters: AuditLogFilters,
  token?: string
): Promise<Blob> {
  const url = `${API_ENDPOINTS.AUDIT_LOGS.EXPORT}?${buildParams(filters).toString()}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

/** Permanently delete all audit logs. Requires the confirmation header the backend checks for. */
export async function clearAuditLogs(token?: string): Promise<void> {
  const res = await fetch(API_ENDPOINTS.AUDIT_LOGS.BASE, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Confirm-Purge': 'CONFIRM_PURGE_ALL_LOGS',
    },
  });
  if (!res.ok) throw new Error('Failed to clear audit logs');
}
