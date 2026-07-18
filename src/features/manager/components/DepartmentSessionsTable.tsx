'use client';

import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/api-error';
import { useDeleteSession } from '@/features/sessions';
import { QueryErrorState } from './QueryErrorState';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY } from '../constants';
import type { SessionData } from '../types';

export interface DepartmentSessionsTableProps {
  sessions: SessionData[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function DepartmentSessionsTable({ sessions, isLoading, isError, onRetry }: DepartmentSessionsTableProps) {
  const details = useSessionDetails(sessions);
  const queryClient = useQueryClient();
  const deleteSession = useDeleteSession();

  const handleCancel = async (id: string) => {
    try {
      await deleteSession.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY });
      toast.success('Séance annulée');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'annulation de la séance"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <QueryErrorState message="Impossible de charger les sessions." onRetry={onRetry} />;
  }

  if (sessions.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucune session</div>;
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Horaire</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Instructeur</TableHead>
          <TableHead>Salle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((session) => {
          const detail = session.teachingAssignmentId ? details[session.teachingAssignmentId] : undefined;
          const isCancelled = session.status === 'CANCELLED';
          return (
            <TableRow key={session.id}>
              <TableCell className="text-slate-600">{format(new Date(session.startsAt), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-slate-600">
                {format(new Date(session.startsAt), 'HH:mm')}–{format(new Date(session.endsAt), 'HH:mm')}
              </TableCell>
              <TableCell className="text-slate-700 font-medium">{detail?.subjectName ?? '—'}</TableCell>
              <TableCell className="text-slate-600">{detail?.instructorName ?? '—'}</TableCell>
              <TableCell className="text-slate-600">{session.room ?? '—'}</TableCell>
              <TableCell>
                <Badge variant="outline">{session.status ?? 'SCHEDULED'}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {!isCancelled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleCancel(session.id)}
                    disabled={deleteSession.isPending}
                  >
                    Annuler
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
