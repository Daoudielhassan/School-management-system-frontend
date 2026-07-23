'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AcademicYear } from '../types';

export function buildAcademicYearColumns(
  onSetActive: (id: string) => void,
  isSettingActive: boolean
): ColumnDef<AcademicYear>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-medium">{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'startDate',
      header: 'Date de début',
      cell: ({ row }) => format(new Date(row.getValue('startDate')), 'PP'),
    },
    {
      accessorKey: 'endDate',
      header: 'Date de fin',
      cell: ({ row }) => format(new Date(row.getValue('endDate')), 'PP'),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        row.original.status !== 'ACTIVE' && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetActive(row.original.id)}
              disabled={isSettingActive}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Activer
            </Button>
          </div>
        ),
    },
  ];
}
