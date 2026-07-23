'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileArchive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatSize } from '../lib/format-size';
import type { Backup } from '../types';

export function buildBackupColumns(onRestore: (backup: Backup) => void): ColumnDef<Backup>[] {
  return [
    {
      accessorKey: 'filename',
      header: 'Nom du fichier',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileArchive className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('filename')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'size',
      header: 'Taille',
      cell: ({ row }) => formatSize(row.getValue('size')),
    },
    {
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'PP p'),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="destructive" size="sm" onClick={() => onRestore(row.original)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
