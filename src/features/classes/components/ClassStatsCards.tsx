'use client';

/**
 * Dashboard stat cards shown above the classes grid.
 *
 * TODO(architecture): these figures aggregate attendance + user-stats data that
 * belong to the `attendance` / `users` domains. When those features are built,
 * move this widget out of `classes` and feed it from their hooks.
 */
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Layers, Calendar } from 'lucide-react';
import type { ClassDashboardStats } from '../types';

export interface ClassStatsCardsProps {
  stats: ClassDashboardStats;
}

export function ClassStatsCards({ stats }: ClassStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard icon={<BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />} value={stats.totalClasses} label="Total Classes" />
      <StatCard icon={<Users className="h-8 w-8 text-green-400 mx-auto mb-2" />} value={stats.totalStudents} label="Total Students" />
      <StatCard icon={<Layers className="h-8 w-8 text-purple-400 mx-auto mb-2" />} value={stats.totalModules} label="Total Modules" />
      <Card className="bg-white/70 backdrop-blur-md border-slate-200">
        <CardContent className="p-6 text-center">
          <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.todayAttendance}</div>
          <div className="text-sm text-gray-600">Today's Attendance</div>
          <div className="text-xs text-green-400 mt-1">
            Present: {stats.presentToday} | Absent: {stats.absentToday}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Card className="bg-white/70 backdrop-blur-md border-slate-200">
      <CardContent className="p-6 text-center">
        {icon}
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}
