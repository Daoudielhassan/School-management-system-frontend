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
      { name: 'firstName', label: 'First Name', placeholder: 'John', colSpan: 1 },
      { name: 'lastName', label: 'Last Name', placeholder: 'Doe', colSpan: 1 },
    ];
    if (!classGroups) {
      // Edit mode only — the student number is generated server-side on create.
      base.push({ name: 'studentNumber', label: 'Student Number' });
    }
    base.push(
      { name: 'email', label: 'Email', type: 'email', placeholder: 'john.doe@example.com' },
      { name: 'phoneNumber', label: 'Phone Number', placeholder: '+1 (555) 123-4567', colSpan: 1 },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', colSpan: 1 },
      { name: 'cine', label: 'CINE', placeholder: 'AB123456', colSpan: 1 }
    );
    if (classGroups) {
      base.push({
        name: 'classGroupId',
        label: 'Class (optional)',
        type: 'select',
        placeholder: 'Select a class',
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
