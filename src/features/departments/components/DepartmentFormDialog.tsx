'use client';

/**
 * Create / edit department form over the shared `EntityFormDialog`.
 */
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { departmentFormSchema, type DepartmentFormValues } from '../validations';

const FIELDS: FieldConfig<DepartmentFormValues>[] = [
  { name: 'code', label: 'Code', placeholder: 'e.g., CS' },
  { name: 'name', label: 'Department Name', placeholder: 'e.g., Computer Science' },
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
      title={mode === 'create' ? 'Create New Department' : 'Edit Department'}
      description={
        mode === 'create'
          ? 'Add a new department to the academic structure'
          : 'Update department details'
      }
      submitLabel={mode === 'create' ? 'Create Department' : 'Save Changes'}
      schema={departmentFormSchema}
      fields={FIELDS}
    />
  );
}
