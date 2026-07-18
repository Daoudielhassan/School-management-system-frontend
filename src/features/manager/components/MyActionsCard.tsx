'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { useMyRecentActions } from '../hooks/useMyAssignments';
import { actionTypeLabel } from '../lib/format';

const STATUS_CLASSNAME: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export function MyActionsCard() {
  const { data: actions = [], isLoading } = useMyRecentActions(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Activity className="h-5 w-5 text-blue-600" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : actions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aucune action récente</p>
        ) : (
          <div className="space-y-2">
            {actions.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{actionTypeLabel(a.actionType)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(a.actionTimestamp), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <Badge variant="outline" className={STATUS_CLASSNAME[a.status] ?? ''}>
                  {a.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
