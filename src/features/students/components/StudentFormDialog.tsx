'use client';

/**
 * Create / edit student form. Now a thin declaration of fields over the shared
 * `EntityFormDialog`; validation lives in the Zod schema.
 */
import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { createStudentFormSchema, type CreateStudentFormValues } from '../validations';
import type { ClassGroup } from '../types';

export interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  defaultValues: CreateStudentFormValues;
  /** When provided, a class selector is shown (create flow only). */
  classGroups?: ClassGroup[];
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: CreateStudentFormValues) => void | Promise<void>;
}

export function StudentFormDialog({
  classGroups,
  ...props
}: StudentFormDialogProps) {
  const fields = useMemo<FieldConfig<CreateStudentFormValues>[]>(() => {
    const base: FieldConfig<CreateStudentFormValues>[] = [
      { name: 'firstName', label: 'Prénom', placeholder: 'Jean', colSpan: 1 },
      { name: 'lastName', label: 'Nom', placeholder: 'Dupont', colSpan: 1 },
    ];
    if (!classGroups) {
      // Edit mode only — the student number is generated server-side on create.
      base.push({ name: 'studentNumber', label: "Numéro d'étudiant" });
    }
    base.push(
      { name: 'email', label: 'Email', type: 'email', placeholder: 'jean.dupont@exemple.com' },
      { name: 'phoneNumber', label: 'Téléphone', placeholder: '+212 6 12 34 56 78', colSpan: 1 },
      { name: 'dateOfBirth', label: 'Date de naissance', type: 'date', colSpan: 1 },
      { name: 'cine', label: 'CINE', placeholder: 'AB123456', colSpan: 1 }
    );
    if (classGroups) {
      base.push({
        name: 'classGroupId',
        label: 'Classe (optionnel)',
        type: 'select',
        placeholder: 'Sélectionner une classe',
        options: classGroups.map((c) => ({ value: c.id, label: `${c.name} (L${c.level})` })),
      });
    }
    return base;
  }, [classGroups]);

  return (
    <EntityFormDialog<CreateStudentFormValues>
      {...props}
      schema={createStudentFormSchema}
      fields={fields}
    />
  );
}
