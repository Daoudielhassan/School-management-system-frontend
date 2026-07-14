'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Gavel, Clock, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import type { DisciplineStats } from '../types';

export function DisciplineStatsBar({
  stats,
  loading,
}: {
  stats: DisciplineStats;
  loading: boolean;
}) {
  const cards = [
    { label: 'Total', value: stats.total, icon: Gavel, color: 'text-slate-600' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
    { label: 'En révision', value: stats.underReview, icon: AlertTriangle, color: 'text-blue-600' },
    { label: 'Résolus', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'En appel', value: stats.appealed, icon: Shield, color: 'text-pink-600' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card
          key={label}
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {loading ? '…' : value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
