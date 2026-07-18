'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TeachingModule } from '../types';
import type { Department } from '@/features/departments';

export function buildModuleColumns(
  onEdit: (m: TeachingModule) => void,
  onDelete: (m: TeachingModule) => void,
  departments?: Department[]
): ColumnDef<TeachingModule>[] {
  const departmentNameById = new Map((departments ?? []).map((d) => [d.id, d.name]));

  const columns: ColumnDef<TeachingModule>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => <span className="text-sm font-medium">{row.getValue('name')}</span>,
    },
  ];

  if (departments) {
    columns.push({
      id: 'departmentId',
      header: 'Département',
      accessorFn: (row) => departmentNameById.get(row.departmentId) ?? row.departmentId,
      cell: ({ row }) => (
        <span className="text-sm">{departmentNameById.get(row.original.departmentId) ?? '—'}</span>
      ),
    });
  }

  columns.push(
    {
      accessorKey: 'level',
      header: 'Niveau',
      cell: ({ row }) => <Badge variant="outline">Niveau {row.getValue('level')}</Badge>,
    },
    {
      accessorKey: 'semesterNumber',
      header: 'Semestre',
      cell: ({ row }) => <Badge variant="outline">Semestre {row.getValue('semesterNumber')}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  );

  return columns;
}
