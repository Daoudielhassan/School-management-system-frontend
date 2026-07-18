'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from './QueryErrorState';
import { RepetitionDialog } from './RepetitionDialog';
import { useClassGroupStudents } from '../hooks/useClassStudents';
import { enrollmentStatusStyle } from '../lib/format';
import type { ClassGroupLite, StudentLite } from '../types';

export interface ClassStudentsDialogProps {
  classGroup: ClassGroupLite | null;
  onOpenChange: (open: boolean) => void;
}

export function ClassStudentsDialog({ classGroup, onOpenChange }: ClassStudentsDialogProps) {
  const { students, enrollmentByStudentId, isLoading, isError, refetch } = useClassGroupStudents(classGroup?.id);
  const [repeatingStudent, setRepeatingStudent] = useState<StudentLite | null>(null);
  const canProcessRepetition = classGroup?.status === 'ACTIVE';

  return (
    <Dialog open={!!classGroup} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Étudiants — {classGroup?.name}</DialogTitle>
          <DialogDescription>Liste des étudiants inscrits dans cette classe</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <QueryErrorState message="Impossible de charger les étudiants." onRetry={refetch} />
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Aucun étudiant inscrit</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                {canProcessRepetition && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => {
                const enrollment = enrollmentByStudentId.get(s.id);
                const style = enrollment ? enrollmentStatusStyle(enrollment.status) : null;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="text-slate-600">{s.studentNumber}</TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell className="text-slate-600">{s.email}</TableCell>
                    <TableCell className="text-slate-600">{s.phoneNumber ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={style?.className}>
                        {style?.label ?? enrollment?.status ?? '—'}
                      </Badge>
                    </TableCell>
                    {canProcessRepetition && (
                      <TableCell className="text-right">
                        {enrollment?.status === 'ACTIVE' && (
                          <Button variant="outline" size="sm" onClick={() => setRepeatingStudent(s)}>
                            Redoubler
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <RepetitionDialog
        student={repeatingStudent}
        currentClassGroup={repeatingStudent ? classGroup : null}
        onOpenChange={(open) => !open && setRepeatingStudent(null)}
      />
    </Dialog>
  );
}
