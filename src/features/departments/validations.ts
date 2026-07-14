/**
 * Zod schema + payload mapper for the department create/edit form.
 */
import { z } from 'zod';
import type { DepartmentMutationPayload } from './types';

export const departmentFormSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  name: z.string().trim().min(1, 'Department name is required'),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export const emptyDepartmentForm: DepartmentFormValues = { code: '', name: '' };

export function toDepartmentPayload(values: DepartmentFormValues): DepartmentMutationPayload {
  return { code: values.code, name: values.name };
}
