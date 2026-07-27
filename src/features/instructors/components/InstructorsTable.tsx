'use client';

/**
 * Instructors table — thin adapter over the shared `DataTable` primitive.
 * Search + pagination are handled client-side by `DataTable` itself (no
 * server-side filter endpoint exists for instructors).
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { INSTRUCTORS_PAGE_SIZE } from '../constants';
import type { InstructorData } from '../types';

export interface InstructorsTableProps {
  instructors: InstructorData[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (instructor: InstructorData) => void;
  onDelete: (instructor: InstructorData) => void;
}

function getInstructorColumns(
  onEdit: (i: InstructorData) => void,
  onDelete: (i: InstructorData) => void
): ColumnDef<InstructorData>[] {
  return [
    { header: 'Code', accessorKey: 'code' },
    { header: 'Nom', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(row.original)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      ),
    },
  ];
}

export function InstructorsTable({
  instructors,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
}: InstructorsTableProps) {
  const columns = useMemo(() => getInstructorColumns(onEdit, onDelete), [onEdit, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={instructors}
      isLoading={isLoading}
      error={error}
      emptyMessage="Aucun professeur trouvé"
      skeletonRows={INSTRUCTORS_PAGE_SIZE}
      searchKey="name"
      searchPlaceholder="Rechercher par nom…"
      paginated
      pageSize={INSTRUCTORS_PAGE_SIZE}
    />
  );
}
