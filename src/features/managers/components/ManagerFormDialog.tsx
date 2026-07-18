'use client';

/**
 * Create / edit manager form. A thin declaration of fields over the shared
 * `EntityFormDialog`; validation lives in the Zod schema. The create-only
 * fields (department, dates) are hidden in edit mode since
 * `ManagerUpdateRequest` doesn't accept them (immutable after creation).
 * Employee number is never entered by the operator — it's generated
 * server-side on create (see `ManagerService.createManager`).
 */
import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { managerFormSchema, type ManagerFormValues } from '../validations';
import { MANAGER_LEVEL_OPTIONS } from '../constants';
import type { Department } from '../types';

export interface ManagerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  defaultValues: ManagerFormValues;
  mode: 'create' | 'edit';
  departments: Department[];
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: ManagerFormValues) => void | Promise<void>;
}

export function ManagerFormDialog({ mode, departments, ...props }: ManagerFormDialogProps) {
  const fields = useMemo<FieldConfig<ManagerFormValues>[]>(() => {
    const base: FieldConfig<ManagerFormValues>[] = [
      { name: 'firstName', label: 'First Name', placeholder: 'Alice', colSpan: 1, required: true },
      { name: 'lastName', label: 'Last Name', placeholder: 'Martin', colSpan: 1, required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'alice.martin@example.com', required: true },
    ];

    if (mode === 'create') {
      base.push(
        {
          name: 'departmentId',
          label: 'Department',
          type: 'select',
          placeholder: 'Select a department',
          required: true,
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', colSpan: 1, required: true },
        { name: 'hireDate', label: 'Hire Date', type: 'date', colSpan: 1, required: true }
      );
    }

    base.push(
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        placeholder: 'Select a level',
        colSpan: 1,
        options: MANAGER_LEVEL_OPTIONS,
      },
      { name: 'phone', label: 'Phone', placeholder: '+33612345678', colSpan: 1 },
      { name: 'specialization', label: 'Specialization', colSpan: 1 },
      { name: 'officeLocation', label: 'Office Location', colSpan: 1 },
      { name: 'officePhone', label: 'Office Phone', colSpan: 1 },
      { name: 'bio', label: 'Bio', type: 'textarea' }
    );

    return base;
  }, [mode, departments]);

  return (
    <EntityFormDialog<ManagerFormValues> {...props} schema={managerFormSchema} fields={fields} />
  );
}
