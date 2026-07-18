'use client';

/**
 * Container orchestrating the classes admin screen: dashboard, filters, grid,
 * create/edit/delete and the students/schedule/modules dialogs. Server state
 * lives in React Query; only transient view state is held here.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { ClassStatsCards } from './ClassStatsCards';
import { ClassFilters } from './ClassFilters';
import { ClassGrid } from './ClassGrid';
import { ClassFormDialog } from './ClassFormDialog';
import { ClassStudentsDialog } from './ClassStudentsDialog';
import { ClassScheduleDialog } from './ClassScheduleDialog';
import { ClassModulesDialog } from './ClassModulesDialog';
import { useClassesScreen } from '../hooks/useClasses';
import { useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useClassMutations';
import { emptyClassForm, toClassPayload, type ClassFormValues } from '../validations';
import { DEPARTMENT_FILTER_ALL } from '../constants';
import type { ClassGroup, ClassFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '', departmentId: DEPARTMENT_FILTER_ALL };

interface FormDialogState {
  mode: 'create' | 'edit';
  classe: ClassGroup | null;
}

function toFormValues(classe: ClassGroup): ClassFormValues {
  return {
    code: classe.code,
    name: classe.name,
    departmentId: classe.departmentId ?? '',
    level: classe.level,
  };
}

export function ClassesManager() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null);
  const [deleting, setDeleting] = useState<ClassGroup | null>(null);
  const [studentsFor, setStudentsFor] = useState<ClassGroup | null>(null);
  const [scheduleFor, setScheduleFor] = useState<ClassGroup | null>(null);
  const [modulesFor, setModulesFor] = useState<ClassGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { filteredClasses, reference, stats, isLoading } = useClassesScreen(filters);

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const formDefaults = useMemo<ClassFormValues>(
    () => (formDialog?.classe ? toFormValues(formDialog.classe) : emptyClassForm),
    [formDialog]
  );

  const handleSubmit = async (values: ClassFormValues) => {
    if (!formDialog) return;
    setFormError(null);
    try {
      if (formDialog.mode === 'create') {
        await createClass.mutateAsync(toClassPayload(values));
        toast.success('Class created');
      } else if (formDialog.classe) {
        await updateClass.mutateAsync({
          id: formDialog.classe.id,
          payload: toClassPayload(values),
        });
        toast.success('Class updated');
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
      await deleteClass.mutateAsync(deleting.id);
      toast.success('Class deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete class'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Classes"
        description="Gérez les classes, groupes et emplois du temps"
        actions={
          <Button
            className="shadow-sm shadow-blue-600/20"
            onClick={() => setFormDialog({ mode: 'create', classe: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une classe
          </Button>
        }
      />

      <ClassStatsCards stats={stats} />

      <ClassFilters
        filters={filters}
        departments={reference.departments}
        onChange={setFilters}
      />

      <ClassGrid
        classes={filteredClasses}
        departments={reference.departments}
        modules={reference.modules}
        subjects={reference.subjects}
        isLoading={isLoading}
        hasActiveSearch={!!filters.search}
        onCreate={() => setFormDialog({ mode: 'create', classe: null })}
        onEdit={(classe) => setFormDialog({ mode: 'edit', classe })}
        onDelete={setDeleting}
        onOpenStudents={setStudentsFor}
        onOpenSchedule={setScheduleFor}
        onOpenModules={setModulesFor}
      />

      {/* Create / edit */}
      {formDialog && (
        <ClassFormDialog
          open={!!formDialog}
          onOpenChange={(open) => {
            if (!open) {
              setFormDialog(null);
              setFormError(null);
            }
          }}
          mode={formDialog.mode}
          defaultValues={formDefaults}
          departments={reference.departments}
          serverError={formError}
          isSubmitting={createClass.isPending || updateClass.isPending}
          onSubmit={handleSubmit}
        />
      )}

      {/* Delete */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete Class"
        description={
          deleting ? `Are you sure you want to delete "${deleting.name}"?` : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteClass.isPending}
        onConfirm={handleDelete}
      />

      {/* Students */}
      <ClassStudentsDialog
        open={!!studentsFor}
        onOpenChange={(open) => {
          if (!open) setStudentsFor(null);
        }}
        classe={studentsFor}
      />

      {/* Schedule (placeholders) */}
      <ClassScheduleDialog
        open={!!scheduleFor}
        onOpenChange={(open) => {
          if (!open) setScheduleFor(null);
        }}
        classe={scheduleFor}
      />

      {/* Modules & subjects */}
      <ClassModulesDialog
        open={!!modulesFor}
        onOpenChange={(open) => {
          if (!open) setModulesFor(null);
        }}
        classe={modulesFor}
        modules={reference.modules}
        subjects={reference.subjects}
      />
    </div>
  );
}
