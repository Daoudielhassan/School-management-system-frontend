'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, XCircle, CalendarCheck } from 'lucide-react';
import type { ValidationStatsDTO } from '../types';

export function ValidationStatsCards({ stats }: { stats: ValidationStatsDTO }) {
  const cards = [
    { icon: Clock, value: stats.pendingAttendances, label: 'En attente', color: 'text-amber-600' },
    { icon: CheckCircle2, value: stats.validatedAttendances, label: 'Validés', color: 'text-emerald-600' },
    { icon: XCircle, value: stats.rejectedAttendances, label: 'Rejetés', color: 'text-red-600' },
    { icon: CalendarCheck, value: stats.totalValidationsToday, label: "Traités aujourd'hui", color: 'text-blue-600' },
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
