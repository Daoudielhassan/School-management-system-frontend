'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, Users, Clock } from 'lucide-react';
import type { AttendanceStats } from '../types';

export function AttendanceStatsCards({ stats }: { stats: AttendanceStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.totalSessions}</div>
          <div className="text-sm text-blue-600">Total Sessions</div>
        </CardContent>
      </Card>
      <Card className="bg-green-600/20 backdrop-blur-md border-green-400/30">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.overallAttendanceRate}%</div>
          <div className="text-sm text-green-700">Attendance Rate</div>
        </CardContent>
      </Card>
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
          <div className="text-sm text-blue-600">Total Students</div>
        </CardContent>
      </Card>
      <Card className="bg-amber-600/20 backdrop-blur-md border-amber-400/30">
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.pendingJustifications}</div>
          <div className="text-sm text-amber-700">Absent / Late</div>
        </CardContent>
      </Card>
    </div>
  );
}
