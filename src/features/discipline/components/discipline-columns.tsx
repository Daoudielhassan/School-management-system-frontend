'use client';

/**
 * Table columns for disciplinary cases + the small badges they use.
 */
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Bot, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEVERITY_COLORS, STATUS_COLORS } from '../constants';
import type { DisciplinaryCase } from '../types';

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_COLORS[severity] ?? ''}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] ?? ''}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export function buildDisciplineColumns(
  onView: (c: DisciplinaryCase) => void
): ColumnDef<DisciplinaryCase>[] {
  return [
    {
      accessorKey: 'dateReported',
      header: 'Date',
      cell: ({ row }) => {
        try {
          return (
            <span className="text-xs whitespace-nowrap">
              {format(new Date(row.getValue('dateReported')), 'dd MMM yyyy HH:mm')}
            </span>
          );
        } catch {
          return <span className="text-xs">{row.getValue('dateReported')}</span>;
        }
      },
    },
    {
      accessorKey: 'studentName',
      header: 'Étudiant',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold">{row.getValue('studentName')}</p>
          <p className="text-xs text-muted-foreground font-mono truncate max-w-[130px]">
            {row.original.studentId}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'violation',
      header: 'Violation',
      cell: ({ row }) => <span className="text-sm">{row.getValue('violation')}</span>,
    },
    {
      accessorKey: 'severity',
      header: 'Sévérité',
      cell: ({ row }) => <SeverityBadge severity={row.getValue('severity')} />,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'source',
      header: 'Origine',
      cell: ({ row }) =>
        row.getValue('source') === 'AUTO' ? (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <Bot className="h-3 w-3" />
            AUTO
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Manuel</span>
        ),
    },
    {
      accessorKey: 'reportedBy',
      header: 'Signalé par',
      cell: ({ row }) => <span className="text-sm">{row.getValue('reportedBy')}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => onView(row.original)}>
          <Eye className="h-4 w-4 mr-1" /> Voir
        </Button>
      ),
    },
  ];
}
