/**
 * Zod schemas + mappers for the discipline create + update forms.
 */
import { z } from 'zod';
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from './constants';
import type { CreateCasePayload, UpdateCasePayload } from './types';

const severityValues = SEVERITY_OPTIONS.map((o) => o.value) as [string, ...string[]];
const statusValues = STATUS_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const caseFormSchema = z.object({
  // Derived from the selected student (see CaseFormDialog) — never typed by hand.
  studentName: z.string().trim(),
  studentId: z.string().trim().min(1, 'Sélectionnez un étudiant'),
  violation: z.string().trim().min(1, 'La violation est obligatoire'),
  description: z.string().trim(),
  severity: z.enum(severityValues),
  reportedBy: z.string().trim(),
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

export const emptyCaseForm: CaseFormValues = {
  studentName: '',
  studentId: '',
  violation: '',
  description: '',
  severity: 'moderate',
  reportedBy: '',
};

export function toCreateCasePayload(values: CaseFormValues): CreateCasePayload {
  return { ...values };
}

export const caseUpdateSchema = z.object({
  status: z.enum(statusValues),
  actionTaken: z.string().trim(),
  resolutionNotes: z.string().trim(),
});

export type CaseUpdateValues = z.infer<typeof caseUpdateSchema>;

export function toUpdateCasePayload(values: CaseUpdateValues): UpdateCasePayload {
  return { ...values };
}
