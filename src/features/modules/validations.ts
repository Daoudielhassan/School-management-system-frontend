/**
 * Zod schema + payload mapper for the teaching module create/edit form.
 */
import { z } from 'zod';
import type { ModuleMutationPayload } from './types';

export const moduleFormSchema = z.object({
  code: z.string().trim().min(1, 'Le code est obligatoire'),
  name: z.string().trim().min(1, 'Le nom est obligatoire'),
  departmentId: z.string().optional(),
  level: z.coerce.number({ invalid_type_error: 'Le niveau est obligatoire' }).int().min(1, 'Niveau invalide').max(3, 'Niveau invalide'),
  semesterNumber: z.coerce
    .number({ invalid_type_error: 'Le semestre est obligatoire' })
    .int()
    .min(1, 'Semestre invalide')
    .max(2, 'Semestre invalide'),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const emptyModuleForm: ModuleFormValues = {
  code: '',
  name: '',
  departmentId: '',
  level: 1,
  semesterNumber: 1,
};

export function toModulePayload(values: ModuleFormValues): ModuleMutationPayload {
  return {
    code: values.code,
    name: values.name,
    departmentId: values.departmentId || undefined,
    level: values.level,
    semesterNumber: values.semesterNumber,
  };
}
