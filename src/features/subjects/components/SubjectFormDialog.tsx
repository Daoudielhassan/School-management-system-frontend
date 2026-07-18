'use client';

import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { subjectFormSchema, emptySubjectForm, type SubjectFormValues } from '../validations';
import type { TeachingModule } from '@/features/modules';

export interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: TeachingModule[];
  defaultValues?: SubjectFormValues;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: SubjectFormValues) => void | Promise<void>;
}

export function SubjectFormDialog({ modules, defaultValues, ...props }: SubjectFormDialogProps) {
  const fields: FieldConfig<SubjectFormValues>[] = [
    { name: 'code', label: 'Code', required: true, colSpan: 1, placeholder: 'Ex: SUB-ALGO-1' },
    { name: 'name', label: 'Nom', required: true, colSpan: 1, placeholder: 'Ex: Algorithmique 1' },
    {
      name: 'teachingModuleId',
      label: 'Module',
      type: 'select',
      required: true,
      placeholder: 'Sélectionner un module…',
      options: modules.map((m) => ({ value: m.id, label: m.name })),
    },
  ];

  return (
    <EntityFormDialog<SubjectFormValues>
      {...props}
      title={defaultValues ? 'Modifier la matière' : 'Nouvelle matière'}
      description="Une matière appartient à un module d'enseignement"
      submitLabel={defaultValues ? 'Enregistrer' : 'Créer la matière'}
      schema={subjectFormSchema}
      fields={fields}
      defaultValues={defaultValues ?? emptySubjectForm}
    />
  );
}
