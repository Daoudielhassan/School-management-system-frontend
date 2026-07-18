'use client';

/**
 * Container orchestrating the attendance screen: dashboard, filters, the record
 * grid (overview / pending tabs) and the detail dialog. Server state comes from
 * React Query; only filters + the selected record are local view state.
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { extractErrorMessage } from '@/lib/api-error';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceFilters } from './AttendanceFilters';
import { AttendanceGrid } from './AttendanceGrid';
import { AttendanceDetailDialog } from './AttendanceDetailDialog';
import { useAttendanceScreen } from '../hooks/useAttendance';
import { useUpdateAttendanceStatus } from '../hooks/useAttendanceMutations';
import { STATUS_FILTER_ALL } from '../constants';
import type { AttendanceFilters as Filters, ResolvedAttendanceRecord } from '../types';

const EMPTY_FILTERS: Filters = { search: '', status: STATUS_FILTER_ALL };

export function AttendanceManager() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<ResolvedAttendanceRecord | null>(null);

  const { filteredRecords, stats, isLoading, isError } = useAttendanceScreen(filters);
  const updateStatus = useUpdateAttendanceStatus();

  const pendingRecords = filteredRecords.filter(
    (r) => r.status === 'ABSENT' || r.status === 'LATE'
  );

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      setSelected(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update attendance record'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title="Présences"
        description="Suivez et validez les présences des étudiants"
      />

      <AttendanceStatsCards stats={stats} />

      <AttendanceFilters filters={filters} onChange={setFilters} />

      {isError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Impossible de charger les présences</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="pending">Justifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AttendanceGrid
            records={filteredRecords}
            isLoading={isLoading}
            onView={setSelected}
            onExcuse={(r) => handleUpdateStatus(r.id, 'EXCUSED')}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <AttendanceGrid
            records={pendingRecords}
            onView={setSelected}
            onExcuse={(r) => handleUpdateStatus(r.id, 'EXCUSED')}
          />
        </TabsContent>
      </Tabs>

      <AttendanceDetailDialog
        record={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        isUpdating={updateStatus.isPending}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
