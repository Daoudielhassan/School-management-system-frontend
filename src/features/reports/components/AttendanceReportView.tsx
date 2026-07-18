'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CalendarCheck, CalendarX, Clock, FileCheck } from 'lucide-react';
import { ChartWidget } from './ChartWidget';
import { ATTENDANCE_CHART_COLORS } from '../constants';
import type { AttendanceReport, ChartData } from '../types';

export function AttendanceReportView({ report }: { report: AttendanceReport }) {
  const cards = [
    { icon: FileCheck, value: report.totalRecords, label: 'Total' },
    { icon: CalendarCheck, value: report.present, label: 'Présents' },
    { icon: CalendarX, value: report.absent, label: 'Absents' },
    { icon: Clock, value: report.late, label: 'En retard' },
  ];

  const chartData: ChartData[] = [
    { name: 'Présents', value: report.present, color: ATTENDANCE_CHART_COLORS.Present },
    { name: 'Absents', value: report.absent, color: ATTENDANCE_CHART_COLORS.Absent },
    { name: 'En retard', value: report.late, color: ATTENDANCE_CHART_COLORS.Late },
    { name: 'Excusés', value: report.excused, color: ATTENDANCE_CHART_COLORS.Excused },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, value, label }) => (
          <Card key={label} className="border-slate-200 shadow-sm shadow-slate-200/50">
            <CardContent className="p-4 text-center">
              <Icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ChartWidget title="Répartition des présences" data={chartData} icon={BarChart3} />
      <div className="text-center text-sm text-slate-500">
        Taux de présence : <span className="text-slate-900 font-semibold">{report.attendanceRatePercent}%</span>
      </div>
    </div>
  );
}
