'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, FileWarning } from 'lucide-react';
import type { AttendanceSummary } from '../types';

export function AttendanceSummaryCards({ summary }: { summary: AttendanceSummary }) {
  const cards = [
    { icon: CheckCircle2, value: summary.present, label: 'Présences', color: 'text-emerald-600' },
    { icon: XCircle, value: summary.absent, label: 'Absences', color: 'text-red-600' },
    { icon: Clock, value: summary.late, label: 'Retards', color: 'text-amber-600' },
    { icon: FileWarning, value: `${summary.attendanceRatePercent}%`, label: 'Taux de présence', color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ icon: Icon, value, label, color }) => (
        <Card key={label}>
          <CardContent className="p-6 text-center">
            <Icon className={`h-7 w-7 mx-auto mb-2 ${color}`} />
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
