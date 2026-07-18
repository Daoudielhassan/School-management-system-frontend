'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import { useMyResponsibilities } from '../hooks/useMyAssignments';
import { responsibilityLabel } from '../lib/format';

export function MyResponsibilitiesCard() {
  const { data: responsibilities = [], isLoading } = useMyResponsibilities();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Mes responsabilités
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : responsibilities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aucune responsabilité attribuée</p>
        ) : (
          <div className="space-y-2">
            {responsibilities
              .filter((r) => r.isActive)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{responsibilityLabel(r.responsibilityType)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {r.canApprove && (
                      <Badge variant="outline" className="text-[10px]">
                        Approuver
                      </Badge>
                    )}
                    {r.canReject && (
                      <Badge variant="outline" className="text-[10px]">
                        Rejeter
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
