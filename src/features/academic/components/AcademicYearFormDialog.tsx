'use client';

/**
 * Create academic-year form over the shared `EntityFormDialog`.
 */
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import {
  academicYearFormSchema,
  emptyAcademicYearForm,
  type AcademicYearFormValues,
} from '../validations';

const FIELDS: FieldConfig<AcademicYearFormValues>[] = [
  { name: 'code', label: 'Code', required: true, placeholder: '2026-2027' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true, colSpan: 1 },
  { name: 'endDate', label: 'End Date', type: 'date', required: true, colSpan: 1 },
];

export interface AcademicYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: AcademicYearFormValues) => void | Promise<void>;
}

export function AcademicYearFormDialog(props: AcademicYearFormDialogProps) {
  return (
    <EntityFormDialog<AcademicYearFormValues>
      {...props}
      title="Create Academic Year"
      submitLabel="Create"
      schema={academicYearFormSchema}
      fields={FIELDS}
      defaultValues={emptyAcademicYearForm}
    />
  );
}
