'use client';

/**
 * Container orchestrating the users admin screen: list, filters, create/edit
 * and delete. Server state lives in React Query; the component keeps only
 * transient view state.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { UserFilters } from './UserFilters';
import { UsersTable } from './UsersTable';
import { UserFormDialog } from './UserFormDialog';
import { useUsersTable } from '../hooks/useUsers';
import { useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUserMutations';
import {
  emptyUserForm,
  toCreateUserPayload,
  toUpdateUserPayload,
  type UserFormValues,
} from '../validations';
import { USERS_PAGE_SIZE, ROLE_FILTER_ALL } from '../constants';
import type { UserData, UserFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '', role: ROLE_FILTER_ALL };

interface DialogState {
  mode: 'create' | 'edit';
  user: UserData | null;
}

function toFormValues(user: UserData): UserFormValues {
  return {
    username: user.username,
    email: user.email,
    firstname: user.firstname ?? '',
    lastname: user.lastname ?? '',
    role: (user.role as UserFormValues['role']) ?? 'STUDENT',
    password: '',
  };
}

export function UsersManager() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [deleting, setDeleting] = useState<UserData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { paged, isLoading, isError } = useUsersTable(filters, page);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const dialogDefaults = useMemo<UserFormValues>(
    () => (dialog?.user ? toFormValues(dialog.user) : emptyUserForm),
    [dialog]
  );

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(0);
  };

  const handleSubmit = async (values: UserFormValues) => {
    if (!dialog) return;
    setFormError(null);
    try {
      if (dialog.mode === 'create') {
        await createUser.mutateAsync(toCreateUserPayload(values));
        toast.success('Utilisateur créé');
      } else if (dialog.user) {
        await updateUser.mutateAsync({
          id: dialog.user.id,
          payload: toUpdateUserPayload(values),
        });
        toast.success('Utilisateur mis à jour');
      }
      setDialog(null);
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'opération");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteUser.mutateAsync(deleting.id);
      toast.success('Utilisateur supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de la suppression de l'utilisateur"));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Utilisateurs"
        description="Gérez les comptes utilisateurs du système"
        actions={
          <Button onClick={() => setDialog({ mode: 'create', user: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        }
      />

      <UserFilters filters={filters} onChange={handleFiltersChange} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50">
        <UsersTable
          users={paged.rows}
          isLoading={isLoading}
          error={isError ? 'Impossible de charger les utilisateurs.' : null}
          onEdit={(user) => setDialog({ mode: 'edit', user })}
          onDelete={setDeleting}
        />
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        totalElements={paged.totalItems}
        pageSize={USERS_PAGE_SIZE}
        onPageChange={setPage}
      />

      {dialog && (
        <UserFormDialog
          open={!!dialog}
          onOpenChange={(open) => {
            if (!open) {
              setDialog(null);
              setFormError(null);
            }
          }}
          mode={dialog.mode}
          defaultValues={dialogDefaults}
          serverError={formError}
          isSubmitting={createUser.isPending || updateUser.isPending}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Supprimer l'utilisateur"
        description={
          deleting
            ? `Supprimer définitivement « ${deleting.username} » ? Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteUser.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
