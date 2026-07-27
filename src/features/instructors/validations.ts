/**
 * Zod schema + payload mapper for the instructor create/edit form.
 *
 * `code` is generated server-side on create (never shown in the create form)
 * and only editable afterwards, mirroring how `studentNumber` works in the
 * students feature.
 */
import { z } from 'zod';
import type { InstructorMutationPayload } from './types';

export const instructorFormSchema = z.object({
  code: z.string().trim(),
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export type InstructorFormValues = z.infer<typeof instructorFormSchema>;

export const emptyInstructorForm: InstructorFormValues = {
  code: '',
  name: '',
  email: '',
};

export function toInstructorPayload(values: InstructorFormValues): InstructorMutationPayload {
  return {
    code: values.code,
    name: values.name,
    email: values.email,
  };
}
