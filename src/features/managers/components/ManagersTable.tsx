'use client';

/**
 * Managers table — a thin adapter over the shared `DataTable` primitive,
 * mirroring `features/students/components/StudentsTable.tsx`. Adds an inline
 * status selector since managers have a lifecycle admin can act on directly.
 */
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { extractErrorMessage } from '@/lib/api-error';
import { useUpdateManagerStatus } from '../hooks/useManagerMutations';
import { MANAGERS_PAGE_SIZE, MANAGER_LEVEL_OPTIONS, MANAGER_STATUS_OPTIONS } from '../constants';
import type { ManagerData, Department, ManagerStatus } from '../types';

export interface ManagersTableProps {
  managers: ManagerData[];
  departments: Department[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (manager: ManagerData) => void;
  onDelete: (manager: ManagerData) => void;
}

function StatusCell({ manager }: { manager: ManagerData }) {
  const updateStatus = useUpdateManagerStatus();

  const handleChange = async (status: ManagerStatus) => {
    try {
      await updateStatus.mutateAsync({ id: manager.id, status });
      toast.success('Status updated');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update status'));
    }
  };

  return (
    <Select value={manager.status} onValueChange={(v) => handleChange(v as ManagerStatus)}>
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MANAGER_STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function getManagerColumns(
  departments: Department[],
  onEdit: (m: ManagerData) => void,
  onDelete: (m: ManagerData) => void
): ColumnDef<ManagerData>[] {
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? id.slice(0, 8);
  const levelLabel = (level: string) => MANAGER_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;

  return [
    { header: 'Employee #', accessorKey: 'employeeNumber' },
    {
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Department',
      cell: ({ row }) => departmentName(row.original.departmentId),
    },
    {
      header: 'Level',
      cell: ({ row }) => <Badge variant="outline">{levelLabel(row.original.level)}</Badge>,
    },
    {
      header: 'Status',
      cell: ({ row }) => <StatusCell manager={row.original} />,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <>
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

export function ManagersTable({
  managers,
  departments,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
}: ManagersTableProps) {
  const columns = useMemo(
    () => getManagerColumns(departments, onEdit, onDelete),
    [departments, onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={managers}
      isLoading={isLoading}
      error={error}
      emptyMessage="No managers found"
      skeletonRows={MANAGERS_PAGE_SIZE}
    />
  );
}
