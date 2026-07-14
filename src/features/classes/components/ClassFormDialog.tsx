'use client';

/**
 * Create / edit class form over the shared `EntityFormDialog`. Same dialog for
 * both modes — this is what makes the previously-dead "Edit" action work.
 */
import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { classFormSchema, type ClassFormValues } from '../validations';
import { CLASS_LEVELS } from '../constants';
import type { Department } from '../types';

export interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  defaultValues: ClassFormValues;
  departments: Department[];
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: ClassFormValues) => void | Promise<void>;
}

export function ClassFormDialog({ mode, departments, ...props }: ClassFormDialogProps) {
  const fields = useMemo<FieldConfig<ClassFormValues>[]>(
    () => [
      { name: 'code', label: 'Code', placeholder: 'e.g., CS1A' },
      { name: 'name', label: 'Class Name', placeholder: 'e.g., Computer Science 1A' },
      {
        name: 'departmentId',
        label: 'Department',
        type: 'select',
        placeholder: 'Select department',
        options: departments.map((d) => ({ value: d.id, label: d.name })),
      },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        placeholder: 'Select level',
        valueAsNumber: true,
        options: CLASS_LEVELS.map((l) => ({ value: String(l), label: `Level ${l}` })),
      },
    ],
    [departments]
  );

  return (
    <EntityFormDialog<ClassFormValues>
      {...props}
      title={mode === 'create' ? 'Create New Class' : 'Edit Class'}
      description={
        mode === 'create'
          ? 'Add a new class to the academic structure'
          : 'Update this class in the academic structure'
      }
      submitLabel={mode === 'create' ? 'Create Class' : 'Save'}
      schema={classFormSchema}
      fields={fields}
    />
  );
}
