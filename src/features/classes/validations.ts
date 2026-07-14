/**
 * Zod schema + payload mapper for the class create/edit form.
 */
import { z } from 'zod';
import { CLASS_LEVELS } from './constants';
import type { ClassMutationPayload } from './types';

export const classFormSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  name: z.string().trim().min(1, 'Class name is required'),
  departmentId: z.string().trim(),
  // The level select supplies a number (valueAsNumber), so no coercion needed —
  // keeping input === output keeps the schema compatible with EntityFormDialog.
  level: z.number().refine((n) => (CLASS_LEVELS as readonly number[]).includes(n), {
    message: 'Select a valid level',
  }),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;

export const emptyClassForm: ClassFormValues = {
  code: '',
  name: '',
  departmentId: '',
  level: 1,
};

export function toClassPayload(values: ClassFormValues): ClassMutationPayload {
  return {
    code: values.code,
    name: values.name,
    departmentId: values.departmentId || null,
    level: values.level,
  };
}
