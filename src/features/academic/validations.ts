/**
 * Zod schema + mapper for the academic-year create form.
 */
import { z } from 'zod';
import type { CreateAcademicYearPayload } from './types';

export const academicYearFormSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  startDate: z.string().trim().min(1, 'Start date is required'),
  endDate: z.string().trim().min(1, 'End date is required'),
});

export type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>;

export const emptyAcademicYearForm: AcademicYearFormValues = {
  code: '',
  startDate: '',
  endDate: '',
};

export function toAcademicYearPayload(
  values: AcademicYearFormValues
): CreateAcademicYearPayload {
  return { ...values };
}
