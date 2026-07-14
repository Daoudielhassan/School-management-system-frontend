'use client';

/**
 * Users table — a thin adapter over the shared `DataTable` primitive.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { formatRole, USERS_PAGE_SIZE } from '../constants';
import type { UserData } from '../types';

export interface UsersTableProps {
  users: UserData[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

function getUserColumns(
  onEdit: (u: UserData) => void,
  onDelete: (u: UserData) => void
): ColumnDef<UserData>[] {
  return [
    { header: 'Username', accessorKey: 'username' },
    {
      header: 'Name',
      cell: ({ row }) =>
        [row.original.firstname, row.original.lastname].filter(Boolean).join(' ') || '—',
    },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', cell: ({ row }) => formatRole(row.original.role) },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(row.original)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];
}

export function UsersTable({
  users,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const columns = useMemo(() => getUserColumns(onEdit, onDelete), [onEdit, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      error={error}
      emptyMessage="No users found"
      skeletonRows={USERS_PAGE_SIZE}
    />
  );
}
