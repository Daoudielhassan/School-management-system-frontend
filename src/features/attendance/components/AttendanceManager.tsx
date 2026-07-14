'use client';

/**
 * Container orchestrating the attendance screen: dashboard, filters, the record
 * grid (overview / pending tabs) and the detail dialog. Server state comes from
 * React Query; only filters + the selected record are local view state.
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-400">
            Attendance Management
          </h1>
          <p className="text-slate-500 mt-2">Monitor and validate student attendance records</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-blue-400/30 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Review
          </Button>
        </div>
      </div>

      <AttendanceStatsCards stats={stats} />

      <AttendanceFilters filters={filters} onChange={setFilters} />

      {isError && (
        <Card className="bg-red-500/20 backdrop-blur-md border-red-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to load attendance data</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/70 backdrop-blur-md border border-slate-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/30">
            Overview
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/30">
            Justifications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30">
            Analytics
          </TabsTrigger>
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

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white/70 backdrop-blur-md border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Attendance Analytics</CardTitle>
              <CardDescription className="text-slate-500">
                Detailed insights and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics Dashboard</h3>
                <p className="text-slate-500">Advanced attendance analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
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
