'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMyAttendance, useMyAttendanceSummary } from '../hooks/useMyAttendance';
import { AttendanceSummaryCards } from './AttendanceSummaryCards';
import { AttendanceTable } from './AttendanceTable';
import { JustifyAttendanceDialog } from './JustifyAttendanceDialog';
import type { AttendanceResponse } from '../types';

export function MyAttendance() {
  const { data: records = [], isLoading } = useMyAttendance();
  const { data: summary } = useMyAttendanceSummary();
  const [pendingJustify, setPendingJustify] = useState<AttendanceResponse | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mes présences</h1>
        <p className="text-slate-500 mt-1">Historique et justification de vos absences</p>
      </div>

      {summary && <AttendanceSummaryCards summary={summary} />}

      <Card>
        <CardContent className="p-6">
          <AttendanceTable records={records} isLoading={isLoading} onJustify={setPendingJustify} />
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
