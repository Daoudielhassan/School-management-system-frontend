import type { AttendanceStatus, ClassGroupStatus, EnrollmentStatus, ManagerActionType, ResponsibilityType } from '../types';

const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT: { label: 'Présent', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ABSENT: { label: 'Absent', className: 'bg-red-100 text-red-700 border-red-200' },
  LATE: { label: 'Retard', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  EXCUSED: { label: 'Excusé', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function attendanceStatusStyle(status: AttendanceStatus) {
  return ATTENDANCE_STATUS_STYLES[status] ?? { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
}

const ENROLLMENT_STATUS_STYLES: Record<EnrollmentStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  INACTIVE: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  COMPLETED: { label: 'Terminée', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CANCELLED: { label: 'Annulée', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  FAILED: { label: 'Redouble', className: 'bg-red-100 text-red-700 border-red-200' },
  GRADUATED: { label: 'Diplômé(e)', className: 'bg-violet-100 text-violet-700 border-violet-200' },
};

export function enrollmentStatusStyle(status: EnrollmentStatus) {
  return ENROLLMENT_STATUS_STYLES[status] ?? { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
}

const CLASS_GROUP_STATUS_STYLES: Record<ClassGroupStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  GRADUATED: { label: 'Diplômée', className: 'bg-violet-100 text-violet-700 border-violet-200' },
  ARCHIVED: { label: 'Archivée', className: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export function classGroupStatusStyle(status: ClassGroupStatus) {
  return CLASS_GROUP_STATUS_STYLES[status] ?? { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
}

const ACTION_TYPE_LABELS: Record<ManagerActionType, string> = {
  APPROVE_ENROLLMENT: 'Inscription approuvée',
  REJECT_ENROLLMENT: 'Inscription rejetée',
  VALIDATE_GRADE: 'Note validée',
  APPROVE_ABSENCE_JUSTIFICATION: 'Justificatif approuvé',
  MODIFY_SCHEDULE: 'Emploi du temps modifié',
  APPROVE_BUDGET: 'Budget approuvé',
  EVALUATE_STAFF: 'Évaluation du personnel',
  GENERATE_REPORT: 'Rapport généré',
};

export function actionTypeLabel(type: ManagerActionType): string {
  return ACTION_TYPE_LABELS[type] ?? type;
}

const RESPONSIBILITY_LABELS: Record<ResponsibilityType, string> = {
  STUDENT_ENROLLMENT: 'Inscriptions étudiants',
  GRADE_VALIDATION: 'Validation des notes',
  ATTENDANCE_MONITORING: 'Suivi des présences',
  SCHEDULE_MANAGEMENT: 'Gestion de l’emploi du temps',
  BUDGET_APPROVAL: 'Approbation budgétaire',
  STAFF_EVALUATION: 'Évaluation du personnel',
  REPORT_GENERATION: 'Génération de rapports',
  EXAM_COORDINATION: 'Coordination des examens',
};

export function responsibilityLabel(type: ResponsibilityType): string {
  return RESPONSIBILITY_LABELS[type] ?? type;
}
