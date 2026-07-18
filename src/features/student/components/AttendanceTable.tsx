'use client';

import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from './QueryErrorState';
import { attendanceStatusStyle, justificationStatusStyle } from '../lib/format';
import type { AttendanceResponse } from '../types';

export interface AttendanceTableProps {
  records: AttendanceResponse[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onJustify: (record: AttendanceResponse) => void;
}

export function AttendanceTable({ records, isLoading, isError, onRetry, onJustify }: AttendanceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <QueryErrorState message="Impossible de charger vos présences." onRetry={onRetry} />;
  }

  if (records.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucun enregistrement de présence</div>;
  }

  const sorted = [...records].sort(
    (a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Justification</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((record) => {
          const status = attendanceStatusStyle(record.status);
          const justification = justificationStatusStyle(record.justificationStatus);
          const canJustify =
            (record.status === 'ABSENT' || record.status === 'LATE') &&
            record.justificationStatus === 'NONE';

          return (
            <TableRow key={record.id}>
              <TableCell className="text-slate-600">
                {format(new Date(record.attendanceDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <Badge className={status.className} variant="outline">
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={justification.className} variant="outline">
                  {justification.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {canJustify && (
                  <Button variant="outline" size="sm" onClick={() => onJustify(record)}>
                    Justifier
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
