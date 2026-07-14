import { z } from 'zod';
import { EVALUATION_TYPES } from './constants';
import type { GradeMutationPayload } from './types';

const evaluationTypes = EVALUATION_TYPES as unknown as [string, ...string[]];

export const gradeFormSchema = z.object({
  studentId: z.string().trim().min(1, 'Select a student'),
  subjectId: z.string().trim().min(1, 'Select a subject'),
  instructorId: z.string().trim().min(1, 'Select an instructor'),
  value: z.number().min(0, 'Must be 0 or more'),
  maxValue: z.number().min(1, 'Must be at least 1'),
  evaluationType: z.enum(evaluationTypes),
  comment: z.string().trim(),
});

export type GradeFormValues = z.infer<typeof gradeFormSchema>;

export const emptyGradeForm: GradeFormValues = {
  studentId: '',
  subjectId: '',
  instructorId: '',
  value: 0,
  maxValue: 20,
  evaluationType: 'EXAM',
  comment: '',
};

export function toGradeMutationPayload(values: GradeFormValues): GradeMutationPayload {
  return {
    studentId: values.studentId,
    subjectId: values.subjectId,
    instructorId: values.instructorId,
    value: values.value,
    maxValue: values.maxValue,
    evaluationType: values.evaluationType,
    comment: values.comment || undefined,
  };
}
