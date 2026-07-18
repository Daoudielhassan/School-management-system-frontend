'use client';

/**
 * Attendance record detail dialog with quick status actions.
 * (Fixes the original bug where the title referenced a non-existent
 *  `record.studentName` on the raw record — it now uses the resolved record.)
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { ResolvedAttendanceRecord } from '../types';

export interface AttendanceDetailDialogProps {
  record: ResolvedAttendanceRecord | null;
  onOpenChange: (open: boolean) => void;
  isUpdating?: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export function AttendanceDetailDialog({
  record,
  onOpenChange,
  isUpdating = false,
  onUpdateStatus,
}: AttendanceDetailDialogProps) {
  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détail de la présence</DialogTitle>
          <DialogDescription>Informations complètes pour {record?.studentName}</DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Étudiant" value={record.studentName} />
              <Field label="Matière" value={record.subjectName} />
              <Field label="Professeur" value={record.instructorName} />
              <Field label="Date" value={record.attendanceDate} />
              <Field label="Salle" value={record.room} />
              <div className="space-y-1">
                <label className="text-sm text-slate-500">Statut</label>
                <div>
                  <StatusBadge status={record.status} withIcon={false} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'PRESENT')}
              >
                Présent
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'EXCUSED')}
              >
                Excuser
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-700 border-red-200 hover:bg-red-50"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'ABSENT')}
              >
                Absent
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-500">{label}</label>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  );
}
