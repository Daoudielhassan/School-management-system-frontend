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
      { name: 'code', label: 'Code', placeholder: 'ex : CS1A' },
      { name: 'name', label: 'Nom de la classe', placeholder: 'ex : Informatique 1A' },
      {
        name: 'departmentId',
        label: 'Département',
        type: 'select',
        placeholder: 'Sélectionner un département',
        options: departments.map((d) => ({ value: d.id, label: d.name })),
      },
      {
        name: 'level',
        label: 'Niveau',
        type: 'select',
        placeholder: 'Sélectionner un niveau',
        valueAsNumber: true,
        options: CLASS_LEVELS.map((l) => ({ value: String(l), label: `Niveau ${l}` })),
      },
    ],
    [departments]
  );

  return (
    <EntityFormDialog<ClassFormValues>
      {...props}
      title={mode === 'create' ? 'Créer une classe' : 'Modifier la classe'}
      description={
        mode === 'create'
          ? "Ajouter une nouvelle classe à la structure académique"
          : 'Mettre à jour cette classe dans la structure académique'
      }
      submitLabel={mode === 'create' ? 'Créer' : 'Enregistrer'}
      schema={classFormSchema}
      fields={fields}
    />
  );
}
