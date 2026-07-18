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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      <StatCard icon={BookOpen} value={stats.totalClasses} label="Classes" />
      <StatCard icon={Users} value={stats.totalStudents} label="Étudiants" />
      <StatCard icon={Layers} value={stats.totalModules} label="Modules" />
      <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{stats.todayAttendance}</div>
            <div className="text-xs text-slate-500">
              Présents {stats.presentToday} · Absents {stats.absentToday}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
