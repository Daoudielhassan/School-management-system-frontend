'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, TrendingUp, TrendingDown, Hash } from 'lucide-react';
import type { GradeSummary } from '../types';

export function GradesSummaryCards({ summary }: { summary: GradeSummary }) {
  const cards = [
    { icon: Hash, value: summary.count, label: 'Notes enregistrées' },
    { icon: Award, value: `${summary.averagePercent}%`, label: 'Moyenne' },
    { icon: TrendingUp, value: `${summary.maxPercent}%`, label: 'Meilleure note' },
    { icon: TrendingDown, value: `${summary.minPercent}%`, label: 'Note la plus basse' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ icon: Icon, value, label }) => (
        <Card key={label}>
          <CardContent className="p-6 text-center">
            <Icon className="h-7 w-7 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
