'use client';

/**
 * Create-case form over the shared `EntityFormDialog` (now supports textarea).
 */
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { caseFormSchema, emptyCaseForm, type CaseFormValues } from '../validations';
import { VIOLATION_OPTIONS, SEVERITY_OPTIONS } from '../constants';
import type { StudentOption } from '../types';

export interface CaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name-based picker options — scoped by the caller (all students for admin, own department for a manager). */
  students: StudentOption[];
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: CaseFormValues) => void | Promise<void>;
}

export function CaseFormDialog({ students, ...props }: CaseFormDialogProps) {
  const fields: FieldConfig<CaseFormValues>[] = [
    {
      name: 'studentId',
      label: 'Étudiant',
      type: 'select',
      required: true,
      placeholder: 'Sélectionner un étudiant…',
      options: students.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })),
    },
    {
      name: 'violation',
      label: 'Type de violation',
      type: 'select',
      required: true,
      placeholder: 'Sélectionner…',
      options: VIOLATION_OPTIONS.map((v) => ({ value: v, label: v })),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'Détails de l’incident…',
    },
    {
      name: 'severity',
      label: 'Sévérité',
      type: 'select',
      colSpan: 1,
      options: SEVERITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    },
    { name: 'reportedBy', label: 'Signalé par', colSpan: 1, placeholder: 'Votre nom' },
  ];

  return (
    <EntityFormDialog<CaseFormValues>
      {...props}
      title="Nouveau dossier disciplinaire"
      description="Signaler manuellement une infraction"
      submitLabel="Créer le dossier"
      schema={caseFormSchema}
      fields={fields}
      defaultValues={emptyCaseForm}
    />
  );
}
