'use client';

/**
 * Container orchestrating the departments admin screen: stats, search, grid
 * (with per-department class expansion) and create/edit/delete.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { DepartmentStatsCards } from './DepartmentStatsCards';
import { DepartmentFilters } from './DepartmentFilters';
import { DepartmentGrid } from './DepartmentGrid';
import { DepartmentFormDialog } from './DepartmentFormDialog';
import { useDepartmentsScreen, useDepartmentClasses } from '../hooks/useDepartments';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../hooks/useDepartmentMutations';
import {
  emptyDepartmentForm,
  toDepartmentPayload,
  type DepartmentFormValues,
} from '../validations';
import type { Department, DepartmentFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '' };

interface FormDialogState {
  mode: 'create' | 'edit';
  department: Department | null;
}

export function DepartmentsManager() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { departments, filtered, isLoading } = useDepartmentsScreen(filters);
  const { data: selectedClasses = [] } = useDepartmentClasses(selectedId);

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const formDefaults = useMemo<DepartmentFormValues>(
    () =>
      formDialog?.department
        ? { code: formDialog.department.code, name: formDialog.department.name }
        : emptyDepartmentForm,
    [formDialog]
  );

  const handleToggle = (department: Department) => {
    setSelectedId((prev) => (prev === department.id ? null : department.id));
  };

  const handleSubmit = async (values: DepartmentFormValues) => {
    if (!formDialog) return;
    setFormError(null);
    try {
      if (formDialog.mode === 'create') {
        await createDept.mutateAsync(toDepartmentPayload(values));
        toast.success('Department created');
      } else if (formDialog.department) {
        await updateDept.mutateAsync({
          id: formDialog.department.id,
          payload: toDepartmentPayload(values),
        });
        toast.success('Department updated');
      }
      setFormDialog(null);
    } catch (error) {
      const message = extractErrorMessage(error, 'Operation failed');
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDept.mutateAsync(deleting.id);
      if (selectedId === deleting.id) setSelectedId(null);
      toast.success('Department deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete department'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Building2}
        title="Départements"
        description="Organisez les départements et leurs classes"
        actions={
          <Button
            className="shadow-sm shadow-blue-600/20"
            onClick={() => setFormDialog({ mode: 'create', department: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un département
          </Button>
        }
      />

      <DepartmentFilters filters={filters} onChange={setFilters} />

      <DepartmentStatsCards
        total={departments.length}
        selectedClassesCount={selectedId ? selectedClasses.length : 0}
        filteredCount={filtered.length}
        hasSelection={!!selectedId}
      />

      <DepartmentGrid
        departments={filtered}
        selectedId={selectedId}
        selectedClasses={selectedClasses}
        isLoading={isLoading}
        hasActiveSearch={!!filters.search}
        onCreate={() => setFormDialog({ mode: 'create', department: null })}
        onToggle={handleToggle}
        onEdit={(department) => setFormDialog({ mode: 'edit', department })}
        onDelete={setDeleting}
      />

      {formDialog && (
        <DepartmentFormDialog
          open={!!formDialog}
          onOpenChange={(open) => {
            if (!open) {
              setFormDialog(null);
              setFormError(null);
            }
          }}
          mode={formDialog.mode}
          defaultValues={formDefaults}
          serverError={formError}
          isSubmitting={createDept.isPending || updateDept.isPending}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete Department"
        description={deleting ? `Delete department "${deleting.name}"?` : undefined}
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteDept.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
