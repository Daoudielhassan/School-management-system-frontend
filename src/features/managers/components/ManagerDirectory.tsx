'use client';

/**
 * Container for browsing, editing and deleting managers. Server state comes
 * entirely from React Query via `useManagersTable`; the component keeps only
 * transient view state (filters, current page, which row is being edited/deleted).
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { ManagerFilters } from './ManagerFilters';
import { ManagersTable } from './ManagersTable';
import { ManagerFormDialog } from './ManagerFormDialog';
import { useManagersTable } from '../hooks/useManagers';
import { useUpdateManager, useDeleteManager } from '../hooks/useManagerMutations';
import { toManagerUpdatePayload, type ManagerFormValues } from '../validations';
import { MANAGERS_PAGE_SIZE } from '../constants';
import type { ManagerData, ManagerFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '', departmentId: '' };

/** Map a manager entity to the form's value shape (create-only fields are pre-filled but hidden). */
function toFormValues(manager: ManagerData): ManagerFormValues {
  return {
    firstName: manager.firstName,
    lastName: manager.lastName,
    email: manager.email,
    departmentId: manager.departmentId,
    dateOfBirth: manager.dateOfBirth ?? '',
    hireDate: manager.hireDate ?? '',
    phone: manager.phone ?? '',
    level: manager.level,
    specialization: manager.specialization ?? '',
    officeLocation: manager.officeLocation ?? '',
    officePhone: manager.officePhone ?? '',
    bio: manager.bio ?? '',
  };
}

export function ManagerDirectory() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<ManagerData | null>(null);
  const [deleting, setDeleting] = useState<ManagerData | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { paged, departments, isLoading, isError } = useManagersTable(filters, page);

  const updateManager = useUpdateManager();
  const deleteManager = useDeleteManager();

  const editDefaults = useMemo(() => (editing ? toFormValues(editing) : null), [editing]);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(0);
  };

  const handleUpdate = async (values: ManagerFormValues) => {
    if (!editing) return;
    setEditError(null);
    try {
      await updateManager.mutateAsync({ id: editing.id, payload: toManagerUpdatePayload(values) });
      toast.success('Manager mis à jour');
      setEditing(null);
    } catch (error) {
      const message = extractErrorMessage(error, 'Échec de la mise à jour du manager');
      setEditError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteManager.mutateAsync(deleting.id);
      toast.success('Manager supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression du manager'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Liste des managers</CardTitle>
        <div className="mt-4">
          <ManagerFilters filters={filters} departments={departments} onChange={handleFiltersChange} />
        </div>
      </CardHeader>

      <CardContent>
        <ManagersTable
          managers={paged.rows}
          departments={departments}
          isLoading={isLoading}
          error={isError ? 'Impossible de charger les managers' : null}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </CardContent>

      <CardFooter>
        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          totalElements={paged.totalItems}
          pageSize={MANAGERS_PAGE_SIZE}
          onPageChange={setPage}
          className="w-full"
        />
      </CardFooter>

      {editing && editDefaults && (
        <ManagerFormDialog
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
              setEditError(null);
            }
          }}
          title="Modifier le manager"
          submitLabel="Enregistrer"
          mode="edit"
          defaultValues={editDefaults}
          departments={departments}
          serverError={editError}
          isSubmitting={updateManager.isPending}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Supprimer le manager"
        description="Supprimer définitivement ce manager ?"
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteManager.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
