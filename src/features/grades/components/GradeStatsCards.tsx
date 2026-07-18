'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, AlertTriangle, TrendingDown } from 'lucide-react';
import type { GradeStats } from '../types';

export function GradeStatsCards({ stats }: { stats: GradeStats }) {
  const cards = [
    { icon: Users, value: stats.totalStudents, label: 'Étudiants', color: 'text-blue-600', chip: 'bg-blue-50' },
    { icon: Target, value: `${stats.averagePercentage}%`, label: 'Moyenne', color: 'text-blue-600', chip: 'bg-blue-50' },
    { icon: Award, value: stats.excellentCount, label: 'Excellents (≥85%)', color: 'text-emerald-600', chip: 'bg-emerald-50' },
    { icon: AlertTriangle, value: `${stats.passingRate}%`, label: 'Taux de réussite', color: 'text-emerald-600', chip: 'bg-emerald-50' },
    { icon: TrendingDown, value: stats.weakCount, label: 'À risque (<50%)', color: 'text-red-600', chip: 'bg-red-50' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
      {cards.map(({ icon: Icon, value, label, color, chip }) => (
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
