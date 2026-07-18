'use client';

import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { moduleFormSchema, emptyModuleForm, type ModuleFormValues } from '../validations';
import type { Department } from '@/features/departments';

const LEVEL_OPTIONS = [1, 2, 3].map((level) => ({ label: `Niveau ${level}`, value: String(level) }));
const SEMESTER_OPTIONS = [1, 2].map((semester) => ({ label: `Semestre ${semester}`, value: String(semester) }));

export interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ModuleFormValues;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: ModuleFormValues) => void | Promise<void>;
  /** Provide the department list to show a Département select (Admin mode).
   * Omit for Manager mode — the department is always resolved server-side. */
  departments?: Department[];
}

export function ModuleFormDialog({ defaultValues, departments, ...props }: ModuleFormDialogProps) {
  const fields = useMemo<FieldConfig<ModuleFormValues>[]>(() => {
    const base: FieldConfig<ModuleFormValues>[] = [
      { name: 'code', label: 'Code', required: true, colSpan: 1, placeholder: 'Ex: MOD-INFO-101' },
      { name: 'name', label: 'Nom', required: true, colSpan: 1, placeholder: 'Ex: Algorithmique' },
    ];
    if (departments) {
      base.push({
        name: 'departmentId',
        label: 'Département',
        type: 'select',
        required: true,
        colSpan: 2,
        options: departments.map((d) => ({ label: d.name, value: d.id })),
        placeholder: 'Sélectionner un département',
      });
    }
    base.push(
      {
        name: 'level',
        label: 'Niveau',
        type: 'select',
        required: true,
        colSpan: 1,
        options: LEVEL_OPTIONS,
        valueAsNumber: true,
        placeholder: 'Niveau',
      },
      {
        name: 'semesterNumber',
        label: 'Semestre',
        type: 'select',
        required: true,
        colSpan: 1,
        options: SEMESTER_OPTIONS,
        valueAsNumber: true,
        placeholder: 'Semestre',
      }
    );
    return base;
  }, [departments]);

  return (
    <EntityFormDialog<ModuleFormValues>
      {...props}
      title={defaultValues ? 'Modifier le module' : 'Nouveau module'}
      description="Un module regroupe plusieurs matières enseignées, propre à un département/niveau/semestre"
      submitLabel={defaultValues ? 'Enregistrer' : 'Créer le module'}
      schema={moduleFormSchema}
      fields={fields}
      defaultValues={defaultValues ?? emptyModuleForm}
    />
  );
}
