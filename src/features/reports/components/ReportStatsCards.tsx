'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Target, Calendar } from 'lucide-react';
import { StatsGridSkeleton } from '@/components/shared/Skeletons';

export interface ReportStatsCardsProps {
  totalUsers?: number;
  activeUsers?: number;
  auditEvents?: number;
  systemErrors?: number;
  isLoading?: boolean;
}

export function ReportStatsCards({
  totalUsers,
  activeUsers,
  auditEvents,
  systemErrors,
  isLoading = false,
}: ReportStatsCardsProps) {
  if (isLoading) return <StatsGridSkeleton count={4} />;

  const cards = [
    { icon: Users, value: totalUsers ?? '—', label: 'Total Users', border: 'hover:border-blue-400/50', color: 'text-blue-400', labelColor: 'text-blue-300' },
    { icon: TrendingUp, value: activeUsers ?? '—', label: 'Active Users', border: 'hover:border-green-400/50', color: 'text-green-400', labelColor: 'text-green-300' },
    { icon: Target, value: auditEvents ?? '—', label: 'Audit Events', border: 'hover:border-yellow-400/50', color: 'text-yellow-400', labelColor: 'text-yellow-300' },
    { icon: Calendar, value: systemErrors ?? '—', label: 'System Errors', border: 'hover:border-purple-400/50', color: 'text-purple-400', labelColor: 'text-purple-300' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map(({ icon: Icon, value, label, border, color, labelColor }) => (
        <Card
          key={label}
          className={`bg-gray-900/50 backdrop-blur-md border-gray-700/30 ${border} transition-all duration-300 group`}
        >
          <CardContent className="p-6 text-center">
            <Icon className={`h-8 w-8 ${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className={`text-sm ${labelColor}`}>{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
