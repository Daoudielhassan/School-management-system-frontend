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
      { name: 'firstName', label: 'Prénom', placeholder: 'Alice', colSpan: 1, required: true },
      { name: 'lastName', label: 'Nom', placeholder: 'Martin', colSpan: 1, required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'alice.martin@exemple.com', required: true },
    ];

    if (mode === 'create') {
      base.push(
        {
          name: 'departmentId',
          label: 'Département',
          type: 'select',
          placeholder: 'Sélectionner un département',
          required: true,
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
        { name: 'dateOfBirth', label: 'Date de naissance', type: 'date', colSpan: 1, required: true },
        { name: 'hireDate', label: "Date d'embauche", type: 'date', colSpan: 1, required: true }
      );
    }

    base.push(
      {
        name: 'level',
        label: 'Niveau',
        type: 'select',
        placeholder: 'Sélectionner un niveau',
        colSpan: 1,
        options: MANAGER_LEVEL_OPTIONS,
      },
      { name: 'phone', label: 'Téléphone', placeholder: '+212 6 12 34 56 78', colSpan: 1 },
      { name: 'specialization', label: 'Spécialisation', colSpan: 1 },
      { name: 'officeLocation', label: 'Bureau', colSpan: 1 },
      { name: 'officePhone', label: 'Téléphone bureau', colSpan: 1 },
      { name: 'bio', label: 'Bio', type: 'textarea' }
    );

    return base;
  }, [mode, departments]);

  return (
    <EntityFormDialog<ManagerFormValues> {...props} schema={managerFormSchema} fields={fields} />
  );
}
