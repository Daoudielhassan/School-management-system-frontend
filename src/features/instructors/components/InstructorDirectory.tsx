'use client';

/**
 * Container for browsing, editing and deleting instructors. Server state
 * comes entirely from React Query via `useInstructors`; the component keeps
 * only transient view state (which row is being edited/deleted). Search and
 * pagination are handled client-side by `InstructorsTable`'s `DataTable`.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TemporaryPasswordDialog } from '@/components/shared/TemporaryPasswordDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { InstructorsTable } from './InstructorsTable';
import { InstructorFormDialog } from './InstructorFormDialog';
import { useInstructors } from '../hooks/useInstructors';
import {
  useUpdateInstructor,
  useDeleteInstructor,
  useResetInstructorPassword,
} from '../hooks/useInstructorMutations';
import type { InstructorFormValues } from '../validations';
import type { InstructorData } from '../types';

/** Map an instructor entity to the form's value shape. */
function toFormValues(instructor: InstructorData): InstructorFormValues {
  return {
    code: instructor.code,
    name: instructor.name,
    email: instructor.email,
  };
}

interface TempPasswordState {
  open: boolean;
  name: string;
  password: string;
}

const CLOSED_TEMP_PASSWORD: TempPasswordState = { open: false, name: '', password: '' };

export function InstructorDirectory() {
  const [editing, setEditing] = useState<InstructorData | null>(null);
  const [deleting, setDeleting] = useState<InstructorData | null>(null);
  const [resetting, setResetting] = useState<InstructorData | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordState>(CLOSED_TEMP_PASSWORD);

  const { data: instructors, isLoading, isError } = useInstructors();

  const updateInstructor = useUpdateInstructor();
  const deleteInstructor = useDeleteInstructor();
  const resetPassword = useResetInstructorPassword();

  const editDefaults = useMemo(() => (editing ? toFormValues(editing) : null), [editing]);

  const handleUpdate = async (values: InstructorFormValues) => {
    if (!editing) return;
    setEditError(null);
    try {
      await updateInstructor.mutateAsync({
        id: editing.id,
        payload: { code: values.code, name: values.name, email: values.email },
      });
      toast.success('Professeur mis à jour');
      setEditing(null);
    } catch (error) {
      const message = extractErrorMessage(error, 'Échec de la mise à jour du professeur');
      setEditError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteInstructor.mutateAsync(deleting.id);
      toast.success('Professeur supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression du professeur'));
    } finally {
      setDeleting(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetting) return;
    try {
      const { temporaryPassword } = await resetPassword.mutateAsync({ userId: resetting.userId });
      setTempPassword({ open: true, name: resetting.name, password: temporaryPassword });
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la réinitialisation du mot de passe'));
    } finally {
      setResetting(null);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Liste des professeurs</CardTitle>
      </CardHeader>

      <CardContent>
        <InstructorsTable
          instructors={instructors ?? []}
          isLoading={isLoading}
          error={isError ? 'Impossible de charger les professeurs' : null}
          onEdit={setEditing}
          onDelete={setDeleting}
          onResetPassword={setResetting}
        />
      </CardContent>

      {editing && editDefaults && (
        <InstructorFormDialog
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
              setEditError(null);
            }
          }}
          title="Modifier le professeur"
          submitLabel="Enregistrer"
          isEdit
          defaultValues={editDefaults}
          serverError={editError}
          isSubmitting={updateInstructor.isPending}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Supprimer le professeur"
        description="Supprimer définitivement ce professeur ?"
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteInstructor.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!resetting}
        onOpenChange={(open) => {
          if (!open) setResetting(null);
        }}
        title="Réinitialiser le mot de passe"
        description={
          resetting
            ? `Générer un nouveau mot de passe temporaire pour ${resetting.name} ? L'ancien cessera de fonctionner immédiatement.`
            : ''
        }
        confirmLabel="Réinitialiser"
        isConfirming={resetPassword.isPending}
        onConfirm={handleResetPassword}
      />

      <TemporaryPasswordDialog
        open={tempPassword.open}
        onClose={() => setTempPassword(CLOSED_TEMP_PASSWORD)}
        userName={tempPassword.name}
        temporaryPassword={tempPassword.password}
      />
    </Card>
  );
}
