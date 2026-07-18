/**
 * Zod schema + payload mapper for the subject create/edit form.
 */
import { z } from 'zod';
import type { SubjectMutationPayload } from './types';

export const subjectFormSchema = z.object({
  code: z.string().trim().min(1, 'Le code est obligatoire'),
  name: z.string().trim().min(1, 'Le nom est obligatoire'),
  teachingModuleId: z.string().trim().min(1, 'Sélectionnez un module'),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export const emptySubjectForm: SubjectFormValues = { code: '', name: '', teachingModuleId: '' };

export function toSubjectPayload(values: SubjectFormValues): SubjectMutationPayload {
  return { code: values.code, name: values.name, teachingModuleId: values.teachingModuleId };
}
