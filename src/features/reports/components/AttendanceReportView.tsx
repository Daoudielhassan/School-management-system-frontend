'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CalendarCheck, CalendarX, Clock, FileCheck } from 'lucide-react';
import { ChartWidget } from './ChartWidget';
import { ATTENDANCE_CHART_COLORS } from '../constants';
import type { AttendanceReport, ChartData } from '../types';

export function AttendanceReportView({ report }: { report: AttendanceReport }) {
  const cards = [
    { icon: FileCheck, value: report.totalRecords, label: 'Total Records' },
    { icon: CalendarCheck, value: report.present, label: 'Present' },
    { icon: CalendarX, value: report.absent, label: 'Absent' },
    { icon: Clock, value: report.late, label: 'Late' },
  ];

  const chartData: ChartData[] = [
    { name: 'Present', value: report.present, color: ATTENDANCE_CHART_COLORS.Present },
    { name: 'Absent', value: report.absent, color: ATTENDANCE_CHART_COLORS.Absent },
    { name: 'Late', value: report.late, color: ATTENDANCE_CHART_COLORS.Late },
    { name: 'Excused', value: report.excused, color: ATTENDANCE_CHART_COLORS.Excused },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, value, label }) => (
          <Card key={label} className="bg-gray-900/50 backdrop-blur-md border-gray-700/30">
            <CardContent className="p-4 text-center">
              <Icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ChartWidget title="Attendance Breakdown" data={chartData} icon={BarChart3} />
      <div className="text-center text-sm text-gray-400">
        Attendance rate: <span className="text-white font-semibold">{report.attendanceRatePercent}%</span>
      </div>
    </div>
  );
}
