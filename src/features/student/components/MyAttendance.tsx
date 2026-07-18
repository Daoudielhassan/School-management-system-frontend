'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useMyAttendance, useMyAttendanceSummary } from '../hooks/useMyAttendance';
import { AttendanceSummaryCards } from './AttendanceSummaryCards';
import { AttendanceTable } from './AttendanceTable';
import { JustifyAttendanceDialog } from './JustifyAttendanceDialog';
import type { AttendanceResponse } from '../types';

export function MyAttendance() {
  const { data: records = [], isLoading, isError, refetch } = useMyAttendance();
  const { data: summary } = useMyAttendanceSummary();
  const [pendingJustify, setPendingJustify] = useState<AttendanceResponse | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Mes présences"
        description="Historique et justification de vos absences"
      />

      {summary && <AttendanceSummaryCards summary={summary} />}

      <Card>
        <CardContent className="p-6">
          <AttendanceTable
            records={records}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            onJustify={setPendingJustify}
          />
        </CardContent>
      </Card>

      <JustifyAttendanceDialog
        record={pendingJustify}
        onOpenChange={(open) => {
          if (!open) setPendingJustify(null);
        }}
      />
    </div>
  );
}
