import type { AttendanceStatus, JustificationStatus } from '../types';

export function gradePercent(value: number, maxValue: number): number {
  if (!maxValue) return 0;
  return Math.round((value / maxValue) * 1000) / 10;
}

const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT: { label: 'Présent', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ABSENT: { label: 'Absent', className: 'bg-red-100 text-red-700 border-red-200' },
  LATE: { label: 'Retard', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  EXCUSED: { label: 'Excusé', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function attendanceStatusStyle(status: AttendanceStatus) {
  return ATTENDANCE_STATUS_STYLES[status] ?? { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
}

const JUSTIFICATION_STATUS_STYLES: Record<JustificationStatus, { label: string; className: string }> = {
  NONE: { label: 'Aucune justification', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  PENDING: { label: 'En attente', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Approuvée', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejetée', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function justificationStatusStyle(status: JustificationStatus) {
  return (
    JUSTIFICATION_STATUS_STYLES[status] ?? {
      label: status,
      className: 'bg-slate-100 text-slate-500 border-slate-200',
    }
  );
}

export function performanceColorClass(percent: number): string {
  if (percent >= 85) return 'text-emerald-600';
  if (percent >= 60) return 'text-blue-600';
  if (percent >= 50) return 'text-amber-600';
  return 'text-red-600';
}
