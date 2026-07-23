'use client';

import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/api-error';
import { QueryErrorState } from './QueryErrorState';
import { useManagerSubjects, useManagerInstructors, useCancelTeachingAssignment } from '../hooks/useTeachingAssignments';
import type { TeachingAssignment } from '../types';

export interface TeachingAssignmentsListProps {
  assignments: TeachingAssignment[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function TeachingAssignmentsList({
  assignments,
  isLoading,
  isError,
  onRetry,
}: TeachingAssignmentsListProps) {
  const { data: subjects = [] } = useManagerSubjects();
  const { data: instructors = [] } = useManagerInstructors();
  const cancelAssignment = useCancelTeachingAssignment();

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
    return <QueryErrorState message="Impossible de charger les affectations." onRetry={onRetry} />;
  }

  if (assignments.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucune affectation pour cette classe</div>;
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Matière inconnue';
  const instructorName = (id: string) => instructors.find((i) => i.id === id)?.name ?? 'Instructeur inconnu';

  const handleCancel = async (id: string) => {
    try {
      await cancelAssignment.mutateAsync(id);
      toast.success('Affectation annulée');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'annulation"));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matière</TableHead>
          <TableHead>Instructeur</TableHead>
          <TableHead>Créée le</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium text-slate-700">{subjectName(a.subjectId)}</TableCell>
            <TableCell className="text-slate-600">{instructorName(a.instructorId)}</TableCell>
            <TableCell className="text-slate-600">{format(new Date(a.createdAt), 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <Badge variant={a.status === 'ACTIVE' ? 'outline' : 'secondary'}>{a.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {a.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleCancel(a.id)}
                  disabled={cancelAssignment.isPending}
                >
                  Annuler
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
