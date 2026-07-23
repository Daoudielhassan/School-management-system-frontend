'use client';

/**
 * Managers table — a thin adapter over the shared `DataTable` primitive,
 * mirroring `features/students/components/StudentsTable.tsx`. Adds an inline
 * status selector since managers have a lifecycle admin can act on directly.
 */
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
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
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour du statut'));
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
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? 'Département inconnu';
  const levelLabel = (level: string) => MANAGER_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;

  return [
    { header: 'Matricule', accessorKey: 'employeeNumber' },
    {
      header: 'Nom',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Département',
      cell: ({ row }) => departmentName(row.original.departmentId),
    },
    {
      header: 'Niveau',
      cell: ({ row }) => <Badge variant="outline">{levelLabel(row.original.level)}</Badge>,
    },
    {
      header: 'Statut',
      cell: ({ row }) => <StatusCell manager={row.original} />,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
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
      emptyMessage="Aucun manager trouvé"
      skeletonRows={MANAGERS_PAGE_SIZE}
    />
  );
}
