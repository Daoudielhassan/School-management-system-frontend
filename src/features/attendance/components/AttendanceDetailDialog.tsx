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
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-blue-600">Attendance Record Details</DialogTitle>
          <DialogDescription className="text-slate-500">
            Complete information for {record?.studentName}
          </DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Student Name" value={record.studentName} />
              <Field label="Student ID" value={`${record.studentId.substring(0, 8)}…`} />
              <Field label="Subject" value={record.subjectName} />
              <Field label="Instructor" value={record.instructorName} />
              <Field label="Date" value={record.attendanceDate} />
              <div>
                <label className="text-sm text-slate-500">Status</label>
                <StatusBadge status={record.status} withIcon={false} />
              </div>
              <Field label="Room" value={record.room} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'PRESENT')}
              >
                Mark Present
              </Button>
              <Button
                className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/30"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'EXCUSED')}
              >
                Excuse
              </Button>
              <Button
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(record.id, 'ABSENT')}
              >
                Mark Absent
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
    <div>
      <label className="text-sm text-slate-500">{label}</label>
      <p className="text-slate-900 font-medium">{value}</p>
    </div>
  );
}
