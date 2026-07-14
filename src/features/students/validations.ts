/**
 * Zod schemas + payload mappers for student forms.
 *
 * `studentFormSchema`      → shared fields (used by the edit form).
 * `createStudentFormSchema`→ adds an optional class selection (create form only).
 *
 * The mappers convert validated form values into the API payload, normalising
 * empty optional strings to `null` as the backend expects.
 */
import { z } from 'zod';
import type { StudentMutationPayload } from './types';

/** Fields common to creating and editing a student. */
export const studentFormSchema = z.object({
  studentNumber: z.string().trim().min(1, 'Student number is required'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  // Optional fields: always present in the form (default ''), so kept as plain
  // strings — this keeps the Zod input and output types identical, which the
  // RHF resolver requires.
  phoneNumber: z.string().trim(),
  dateOfBirth: z.string().trim(),
});

/** Create form: same fields plus an optional class group to enroll into. */
export const createStudentFormSchema = studentFormSchema.extend({
  classGroupId: z.string().trim(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;

/** Blank defaults for a create form. */
export const emptyCreateStudentForm: CreateStudentFormValues = {
  studentNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  classGroupId: '',
};

/** Map validated form values to the create/update API payload. */
export function toStudentPayload(values: StudentFormValues): StudentMutationPayload {
  return {
    studentNumber: values.studentNumber,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phoneNumber: values.phoneNumber ? values.phoneNumber : null,
    dateOfBirth: values.dateOfBirth ? values.dateOfBirth : null,
  };
}
