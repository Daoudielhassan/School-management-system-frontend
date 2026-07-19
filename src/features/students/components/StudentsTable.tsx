'use client';

/**
 * Students table — now a thin adapter over the shared `DataTable` primitive.
 * It only declares the student-specific columns; loading/empty/error states are
 * handled generically by `DataTable`.
 */
import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { STUDENTS_PAGE_SIZE } from '../constants';
import type { StudentData } from '../types';

export interface StudentsTableProps {
  students: StudentData[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (student: StudentData) => void;
  onDelete: (student: StudentData) => void;
}

function getStudentColumns(
  onEdit: (s: StudentData) => void,
  onDelete: (s: StudentData) => void
): ColumnDef<StudentData>[] {
  return [
    { header: 'N° étudiant', accessorKey: 'studentNumber' },
    {
      header: 'Nom',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Créé le',
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString('fr-FR')
          : '—',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/students/${row.original.id}`}>
            <Button variant="outline" size="icon" title="Voir">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
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

export function StudentsTable({
  students,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const columns = useMemo(() => getStudentColumns(onEdit, onDelete), [onEdit, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={students}
      isLoading={isLoading}
      error={error}
      emptyMessage="Aucun étudiant trouvé"
      skeletonRows={STUDENTS_PAGE_SIZE}
    />
  );
}
