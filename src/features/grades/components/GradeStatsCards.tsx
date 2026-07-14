'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, AlertTriangle, TrendingDown } from 'lucide-react';
import type { GradeStats } from '../types';

export function GradeStatsCards({ stats }: { stats: GradeStats }) {
  const cards = [
    { icon: Users, value: stats.totalStudents, label: 'Total Students' },
    { icon: Target, value: `${stats.averagePercentage}%`, label: 'Average Score' },
    { icon: Award, value: stats.excellentCount, label: 'Excellent (≥85%)' },
    { icon: AlertTriangle, value: `${stats.passingRate}%`, label: 'Passing Rate' },
    { icon: TrendingDown, value: stats.weakCount, label: 'At Risk (<50%)' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {cards.map(({ icon: Icon, value, label }) => (
        <Card
          key={label}
          className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group"
        >
          <CardContent className="p-6 text-center">
            <Icon className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-[var(--text)]">{value}</div>
            <div className="text-sm text-[var(--primary)]">{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
