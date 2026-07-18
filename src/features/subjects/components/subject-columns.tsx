'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Subject } from '../types';

export function buildSubjectColumns(
  moduleName: (id: string) => string,
  onEdit: (s: Subject) => void,
  onDelete: (s: Subject) => void
): ColumnDef<Subject>[] {
  return [
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
    {
      id: 'module',
      header: 'Module',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{moduleName(row.original.teachingModuleId)}</span>
      ),
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
    },
  ];
}
