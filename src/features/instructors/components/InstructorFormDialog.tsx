'use client';

/**
 * Create / edit instructor form. Thin declaration of fields over the shared
 * `EntityFormDialog`; validation lives in the Zod schema.
 */
import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { instructorFormSchema, type InstructorFormValues } from '../validations';

export interface InstructorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  defaultValues: InstructorFormValues;
  /** Edit mode only — the code is generated server-side on create. */
  isEdit?: boolean;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: InstructorFormValues) => void | Promise<void>;
}

export function InstructorFormDialog({ isEdit, ...props }: InstructorFormDialogProps) {
  const fields = useMemo<FieldConfig<InstructorFormValues>[]>(() => {
    const base: FieldConfig<InstructorFormValues>[] = [];
    if (isEdit) {
      base.push({ name: 'code', label: 'Code' });
    }
    base.push(
      { name: 'name', label: 'Nom complet', placeholder: 'Jean Dupont' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'jean.dupont@exemple.com' }
    );
    return base;
  }, [isEdit]);

  return (
    <EntityFormDialog<InstructorFormValues>
      {...props}
      schema={instructorFormSchema}
      fields={fields}
    />
  );
}
