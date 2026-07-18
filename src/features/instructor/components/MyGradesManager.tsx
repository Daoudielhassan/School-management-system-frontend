'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { useMyInstructorId } from '../hooks/useMyProfile';
import { useMyGrades, useCreateGrade, useDeleteGrade } from '../hooks/useMyGrades';
import { useSubjects } from '../hooks/useMyTeachingAssignments';
import { useStudentNames } from '../hooks/useStudentNames';
import { GradeEntryFormDialog } from './GradeEntryFormDialog';
import { QueryErrorState } from './QueryErrorState';
import type { Grade, GradeMutationPayload } from '../types';

export function MyGradesManager() {
  const instructorId = useMyInstructorId();
  const { data: grades = [], isLoading, isError, refetch } = useMyGrades();
  const { data: subjects = [] } = useSubjects();
  const subjectNameById = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);
  const studentNameById = useStudentNames(useMemo(() => grades.map((g) => g.studentId), [grades]));

  const createGrade = useCreateGrade();
  const deleteGrade = useDeleteGrade();

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Grade | null>(null);

  const handleCreate = async (payload: GradeMutationPayload) => {
    setFormError(null);
    try {
      await createGrade.mutateAsync(payload);
      toast.success('Note enregistrée');
      setFormOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'enregistrement de la note");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteGrade.mutateAsync(deleting.id);
      toast.success('Note supprimée');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression de la note'));
    } finally {
      setDeleting(null);
    }
  };

  const sorted = [...grades].sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mes notes</h1>
            <p className="text-sm text-slate-500">Notes saisies pour vos matières</p>
          </div>
        </div>
        <Button onClick={() => { setFormError(null); setFormOpen(true); }} disabled={!instructorId}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes enregistrées</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState message="Impossible de charger vos notes." onRetry={refetch} />
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune note enregistrée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium text-slate-700">
                      {subjectNameById.get(g.subjectId) ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">{studentNameById[g.studentId] ?? '—'}</TableCell>
                    <TableCell className="text-slate-600">{g.evaluationType}</TableCell>
                    <TableCell className="text-slate-700">
                      {g.value} / {g.maxValue}
                    </TableCell>
                    <TableCell className="text-slate-500">{format(new Date(g.gradedAt), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleting(g)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {instructorId && (
        <GradeEntryFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          instructorId={instructorId}
          serverError={formError}
          isSubmitting={createGrade.isPending}
          onSubmit={handleCreate}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer la note"
        description="Supprimer cette note définitivement ?"
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteGrade.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
