'use client';

/**
 * Attendance status badge (icon + coloured label). Single source of truth for
 * how a status looks, reused by the card and the detail dialog.
 */
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { statusLabel, statusBadgeClass } from '../constants';

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'PRESENT':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'ABSENT':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'LATE':
      return <Clock className="h-4 w-4 text-yellow-400" />;
    case 'EXCUSED':
      return <AlertTriangle className="h-4 w-4 text-blue-400" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-slate-500" />;
  }
}

export function StatusBadge({ status, withIcon = true }: { status: string; withIcon?: boolean }) {
  return (
    <Badge className={`border ${statusBadgeClass(status)} flex items-center gap-1 w-fit`}>
      {withIcon && <StatusIcon status={status} />}
      {statusLabel(status)}
    </Badge>
  );
}
