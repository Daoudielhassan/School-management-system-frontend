'use client';

import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from './QueryErrorState';
import { gradePercent, performanceColorClass } from '../lib/format';
import type { GradeResponse } from '../types';

export interface GradesTableProps {
  grades: GradeResponse[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Resolves a subjectId to its display name — falls back to "Matière inconnue" if omitted. */
  subjectName?: (subjectId: string) => string;
}

export function GradesTable({ grades, isLoading, isError, onRetry, subjectName }: GradesTableProps) {
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
    return <QueryErrorState message="Impossible de charger vos notes." onRetry={onRetry} />;
  }

  if (grades.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucune note pour le moment</div>;
  }

  const sorted = [...grades].sort(
    (a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Commentaire</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((grade) => {
          const percent = gradePercent(grade.value, grade.maxValue);
          return (
            <TableRow key={grade.id}>
              <TableCell className="text-slate-600">{format(new Date(grade.gradedAt), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-slate-600">
                {subjectName?.(grade.subjectId) ?? 'Matière inconnue'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{grade.evaluationType}</Badge>
              </TableCell>
              <TableCell>
                <span className={`font-semibold ${performanceColorClass(percent)}`}>
                  {grade.value}/{grade.maxValue}
                </span>
                <span className="text-slate-400 text-xs ml-1">({percent}%)</span>
              </TableCell>
              <TableCell className="text-slate-500 max-w-xs truncate">{grade.comment || '—'}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
