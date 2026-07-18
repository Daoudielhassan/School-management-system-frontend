'use client';

import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useMySessions, useMySessionDetails } from '../hooks/useMySchedule';
import { QueryErrorState } from './QueryErrorState';

export function MySchedule() {
  const { data: sessions = [], isLoading, isError, refetch } = useMySessions();
  const details = useMySessionDetails(sessions);

  const sorted = [...sessions].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50">
          <CalendarDays className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mon emploi du temps</h1>
          <p className="text-sm text-slate-500">Toutes vos séances</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Séances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState message="Impossible de charger votre emploi du temps." onRetry={refetch} />
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune séance programmée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => {
                  const detail = details[s.teachingAssignmentId];
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-slate-700">
                        {format(new Date(s.startsAt), 'dd/MM/yyyy HH:mm')} – {format(new Date(s.endsAt), 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{detail?.subjectName ?? 'Séance'}</TableCell>
                      <TableCell className="text-slate-600">{s.room ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.status === 'SCHEDULED' ? 'default' : 'outline'}>{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
