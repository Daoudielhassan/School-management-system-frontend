'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Plus, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import type { AuditLogStats } from '../types';

export function AuditLogStatsBar({
  stats,
  loading,
}: {
  stats: AuditLogStats | null;
  loading: boolean;
}) {
  const cards = [
    { label: 'Total Events', value: stats?.total ?? 0, icon: Activity, color: 'text-blue-600' },
    { label: 'Creates', value: stats?.creates ?? 0, icon: Plus, color: 'text-emerald-600' },
    { label: 'Updates', value: stats?.updates ?? 0, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Deletes', value: stats?.deletes ?? 0, icon: Trash2, color: 'text-red-600' },
    { label: 'Errors', value: stats?.errors ?? 0, icon: AlertTriangle, color: 'text-orange-600' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="border-slate-200 shadow-sm shadow-slate-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {loading ? '…' : value.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
