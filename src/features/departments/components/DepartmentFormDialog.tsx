'use client';

/**
 * Create / edit department form over the shared `EntityFormDialog`.
 */
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { departmentFormSchema, type DepartmentFormValues } from '../validations';

const FIELDS: FieldConfig<DepartmentFormValues>[] = [
  { name: 'code', label: 'Code', placeholder: 'ex : CS' },
  { name: 'name', label: 'Nom du département', placeholder: 'ex : Informatique' },
];

export interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  defaultValues: DepartmentFormValues;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: DepartmentFormValues) => void | Promise<void>;
}

export function DepartmentFormDialog({ mode, ...props }: DepartmentFormDialogProps) {
  return (
    <EntityFormDialog<DepartmentFormValues>
      {...props}
      title={mode === 'create' ? 'Créer un département' : 'Modifier le département'}
      description={
        mode === 'create'
          ? 'Ajouter un nouveau département à la structure académique'
          : 'Mettre à jour les informations du département'
      }
      submitLabel={mode === 'create' ? 'Créer' : 'Enregistrer'}
      schema={departmentFormSchema}
      fields={FIELDS}
    />
  );
}
