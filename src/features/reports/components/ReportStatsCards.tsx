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
    { icon: Users, value: totalUsers ?? '—', label: 'Utilisateurs', color: 'text-blue-600', chip: 'bg-blue-50' },
    { icon: TrendingUp, value: activeUsers ?? '—', label: 'Utilisateurs actifs', color: 'text-emerald-600', chip: 'bg-emerald-50' },
    { icon: Target, value: auditEvents ?? '—', label: "Événements d'audit", color: 'text-amber-600', chip: 'bg-amber-50' },
    { icon: Calendar, value: systemErrors ?? '—', label: 'Erreurs système', color: 'text-red-600', chip: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {cards.map(({ icon: Icon, value, label, color, chip }) => (
        <Card
          key={label}
          className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
        >
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
