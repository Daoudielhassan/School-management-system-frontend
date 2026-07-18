'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, Users, Clock } from 'lucide-react';
import type { AttendanceStats } from '../types';

export function AttendanceStatsCards({ stats }: { stats: AttendanceStats }) {
  const tiles = [
    { icon: Calendar, value: stats.totalSessions, label: 'Séances', color: 'text-blue-600', chip: 'bg-blue-50' },
    { icon: CheckCircle, value: `${stats.overallAttendanceRate}%`, label: 'Taux de présence', color: 'text-emerald-600', chip: 'bg-emerald-50' },
    { icon: Users, value: stats.totalStudents, label: 'Étudiants', color: 'text-blue-600', chip: 'bg-blue-50' },
    { icon: Clock, value: stats.pendingJustifications, label: 'Absents / retards', color: 'text-amber-600', chip: 'bg-amber-50' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {tiles.map(({ icon: Icon, value, label, color, chip }) => (
        <Card key={label} className="border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${chip} group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
