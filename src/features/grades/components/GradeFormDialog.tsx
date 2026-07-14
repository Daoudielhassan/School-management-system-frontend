'use client';

import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { gradeFormSchema, emptyGradeForm, type GradeFormValues } from '../validations';
import { EVALUATION_TYPE_OPTIONS } from '../constants';
import type { StudentLite, SubjectLite, InstructorLite } from '../types';

export interface GradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentLite[];
  subjects: SubjectLite[];
  instructors: InstructorLite[];
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: GradeFormValues) => void | Promise<void>;
}

export function GradeFormDialog({
  open,
  onOpenChange,
  students,
  subjects,
  instructors,
  serverError,
  isSubmitting,
  onSubmit,
}: GradeFormDialogProps) {
  const fields: FieldConfig<GradeFormValues>[] = [
    {
      name: 'studentId',
      label: 'Student',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })),
    },
    {
      name: 'subjectId',
      label: 'Subject',
      type: 'select',
      required: true,
      options: subjects.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      name: 'instructorId',
      label: 'Instructor',
      type: 'select',
      required: true,
      options: instructors.map((i) => ({ value: i.id, label: i.name })),
    },
    {
      name: 'evaluationType',
      label: 'Evaluation Type',
      type: 'select',
      required: true,
      options: EVALUATION_TYPE_OPTIONS,
    },
    { name: 'value', label: 'Score', type: 'number', required: true, colSpan: 1 },
    { name: 'maxValue', label: 'Out of', type: 'number', required: true, colSpan: 1 },
    { name: 'comment', label: 'Comment', type: 'textarea', rows: 3 },
  ];

  return (
    <EntityFormDialog<GradeFormValues>
      open={open}
      onOpenChange={onOpenChange}
      title="Record a Grade"
      description="Add a new grade for a student"
      submitLabel="Save Grade"
      fields={fields}
      schema={gradeFormSchema}
      defaultValues={emptyGradeForm}
      serverError={serverError}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}
