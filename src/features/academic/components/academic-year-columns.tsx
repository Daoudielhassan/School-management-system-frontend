'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle, Edit } from 'lucide-react';
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
      header: 'Start Date',
      cell: ({ row }) => format(new Date(row.getValue('startDate')), 'PP'),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => format(new Date(row.getValue('endDate')), 'PP'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {row.original.status !== 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetActive(row.original.id)}
              disabled={isSettingActive}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Set Active
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
