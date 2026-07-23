'use client';

/**
 * Admin CRUD screen for subjects — the global catalogue, each subject
 * belonging to a teaching module. Simple table + create/edit dialog +
 * delete confirm, no server pagination needed (the catalogue is small).
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { BookMarked, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { useModules } from '@/features/modules';
import { useSubjects } from '../hooks/useSubjects';
import { useCreateSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjectMutations';
import { toSubjectPayload, type SubjectFormValues } from '../validations';
import { buildSubjectColumns } from './subject-columns';
import { SubjectFormDialog } from './SubjectFormDialog';
import type { Subject } from '../types';

export function SubjectsManager() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { data: modules = [] } = useModules();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; subject: Subject | null } | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const moduleName = (id: string) => modules.find((m) => m.id === id)?.name ?? 'Module inconnu';

  const columns = useMemo(
    () =>
      buildSubjectColumns(
        moduleName,
        (s) => {
          setFormError(null);
          setFormState({ mode: 'edit', subject: s });
        },
        (s) => setDeleting(s)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modules]
  );

  const handleSubmit = async (values: SubjectFormValues) => {
    setFormError(null);
    try {
      if (formState?.mode === 'edit' && formState.subject) {
        await updateSubject.mutateAsync({ id: formState.subject.id, payload: toSubjectPayload(values) });
        toast.success('Matière mise à jour');
      } else {
        await createSubject.mutateAsync(toSubjectPayload(values));
        toast.success('Matière créée');
      }
      setFormState(null);
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'enregistrement de la matière");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteSubjectMutation.mutateAsync(deleting.id);
      toast.success('Matière supprimée');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression de la matière'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <BookMarked className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Matières</h1>
            <p className="text-sm text-slate-500">Catalogue global des matières enseignées</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormError(null);
            setFormState({ mode: 'create', subject: null });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle matière
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les matières</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={subjects}
            searchKey="name"
            searchPlaceholder="Rechercher par nom…"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <SubjectFormDialog
        open={!!formState}
        onOpenChange={(open) => !open && setFormState(null)}
        modules={modules}
        defaultValues={
          formState?.mode === 'edit' && formState.subject
            ? {
                code: formState.subject.code,
                name: formState.subject.name,
                teachingModuleId: formState.subject.teachingModuleId,
              }
            : undefined
        }
        serverError={formError}
        isSubmitting={createSubject.isPending || updateSubject.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer la matière"
        description="Supprimer cette matière définitivement ?"
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteSubjectMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
