'use client';

/**
 * Container for the audit-logs screen: stats, filters, activity table (with
 * server-side pagination), CSV export and clear-all. Server state lives in
 * React Query; only filters + pagination are local view state.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableSkeleton, StatsGridSkeleton } from '@/components/shared/Skeletons';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { extractErrorMessage } from '@/lib/api-error';
import { AuditLogStatsBar } from './AuditLogStatsBar';
import { AuditLogFilters, type AuditLogFilterValues } from './AuditLogFilters';
import { auditLogColumns } from './audit-log-columns';
import { useAuditLogs, useAuditLogStats, useClearAuditLogs } from '../hooks/useAuditLogs';
import { exportAuditLogsCsv } from '../api/audit-logs.api';
import { AUDIT_LOGS_QUERY_KEY, AUDIT_LOG_PAGE_SIZE } from '../constants';
import type { AuditLogFilters as ApiFilters } from '../types';

const EMPTY_FILTERS: AuditLogFilterValues = {
  action: 'ALL',
  resource: '',
  userId: '',
  from: '',
  to: '',
};

/** Map the UI filter values to the API filter shape. */
function toApiFilters(f: AuditLogFilterValues): ApiFilters {
  return {
    action: f.action !== 'ALL' ? f.action : undefined,
    resource: f.resource.trim() || undefined,
    userId: f.userId.trim() || undefined,
    from: f.from || undefined,
    to: f.to || undefined,
  };
}

export function AuditLogsManager() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AuditLogFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(AUDIT_LOG_PAGE_SIZE);
  const [confirmClear, setConfirmClear] = useState(false);

  const apiFilters = useMemo(() => toApiFilters(filters), [filters]);

  const { data: logsData, isLoading: loading } = useAuditLogs({ ...apiFilters, page, size: pageSize });
  const { data: stats, isLoading: statsLoad } = useAuditLogStats(
    filters.from || undefined,
    filters.to || undefined
  );
  const clearLogs = useClearAuditLogs();

  const logs = logsData?.content ?? [];
  const paged = logsData
    ? {
        totalElements: logsData.totalElements,
        totalPages: logsData.totalPages,
        number: logsData.number,
      }
    : null;

  const handleFiltersChange = (next: AuditLogFilterValues) => {
    setFilters(next);
    setPage(0);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });

  const handleExport = async () => {
    try {
      const blob = await exportAuditLogsCsv(apiFilters, token ?? undefined);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Export failed'));
    }
  };

  const handleClear = async () => {
    try {
      await clearLogs.mutateAsync();
      toast.success('Audit logs cleared');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to clear audit logs'));
    } finally {
      setConfirmClear(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Journaux d'audit"
        description="Surveillez l'activité système et les événements de sécurité"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" /> Exporter CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Tout effacer
            </Button>
          </>
        }
      />

      {statsLoad ? <StatsGridSkeleton count={5} /> : <AuditLogStatsBar stats={stats ?? null} loading={false} />}

      <AuditLogFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={() => handleFiltersChange(EMPTY_FILTERS)}
      />

      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Activité système</CardTitle>
              <CardDescription className="text-slate-500">
                {paged
                  ? `${paged.totalElements.toLocaleString()} événements · page ${paged.number + 1} sur ${paged.totalPages}`
                  : `${logs.length} événements`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={8} rows={10} />
          ) : (
            <DataTable
              columns={auditLogColumns}
              data={logs}
              searchKey="username"
              searchPlaceholder="Search by username…"
              isLoading={false}
            />
          )}

          {paged && paged.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={paged.totalPages}
              totalElements={paged.totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all audit logs"
        description="Delete ALL audit logs permanently? This cannot be undone."
        confirmLabel="Delete all"
        variant="destructive"
        isConfirming={clearLogs.isPending}
        onConfirm={handleClear}
      />
    </div>
  );
}
