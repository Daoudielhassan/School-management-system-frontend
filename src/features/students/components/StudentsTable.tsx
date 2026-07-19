'use client';

/**
 * Students table — now a thin adapter over the shared `DataTable` primitive.
 * It only declares the student-specific columns; loading/empty/error states are
 * handled generically by `DataTable`.
 */
import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
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
    { header: 'Student #', accessorKey: 'studentNumber' },
    {
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Created',
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : '—',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <>
          <Link href={`/admin/students/${row.original.id}`}>
            <Button variant="outline" size="icon" className="mr-2" title="Voir">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" className="mr-2" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(row.original)}>
            Delete
          </Button>
        </>
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
      emptyMessage="No students found"
      skeletonRows={STUDENTS_PAGE_SIZE}
    />
  );
}
