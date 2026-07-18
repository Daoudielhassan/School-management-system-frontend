'use client';

import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';
import { QueryErrorState } from './QueryErrorState';
import type { PendingAttendanceDTO } from '../types';

export interface ValidationsTableProps {
  items: PendingAttendanceDTO[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  selected: Set<string>;
  onToggleSelect: (attendanceId: string) => void;
  onToggleSelectAll: () => void;
  onDecide: (attendanceId: string, decision: 'VALIDATED' | 'REJECTED') => void;
}

export function ValidationsTable({
  items,
  isLoading,
  isError,
  onRetry,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onDecide,
}: ValidationsTableProps) {
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
    return <QueryErrorState message="Impossible de charger les justificatifs en attente." onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucun justificatif en attente</div>;
  }

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.attendanceId));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              className="h-4 w-4 rounded border-slate-300"
              aria-label="Tout sélectionner"
            />
          </TableHead>
          <TableHead>Étudiant</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Justification</TableHead>
          <TableHead className="text-right">Décision</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.attendanceId}>
            <TableCell>
              <input
                type="checkbox"
                checked={selected.has(item.attendanceId)}
                onChange={() => onToggleSelect(item.attendanceId)}
                className="h-4 w-4 rounded border-slate-300"
                aria-label={`Sélectionner ${item.studentName}`}
              />
            </TableCell>
            <TableCell className="font-medium text-slate-700">{item.studentName}</TableCell>
            <TableCell className="text-slate-600">{item.classGroupName}</TableCell>
            <TableCell className="text-slate-600">{item.subjectName}</TableCell>
            <TableCell className="text-slate-600">{format(new Date(item.sessionDate), 'dd/MM/yyyy')}</TableCell>
            <TableCell className="max-w-xs">
              <p className="truncate text-slate-600">{item.justification || '—'}</p>
              <Badge variant="outline" className="mt-1">
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => onDecide(item.attendanceId, 'VALIDATED')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDecide(item.attendanceId, 'REJECTED')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
