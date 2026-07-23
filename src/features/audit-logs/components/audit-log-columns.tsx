'use client';

/**
 * Table column definitions for audit logs + the small badges they use.
 */
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ACTION_COLORS, ACTION_ICON } from '../constants';
import type { AuditLog } from '../types';

export function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? 'bg-gray-100 text-gray-700 border-gray-300';
  const icon = ACTION_ICON[action] ?? '•';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      {icon} {action}
    </span>
  );
}

export function StatusBadge({ status }: { status?: number }) {
  const s = status ?? 0;
  const color =
    s < 300 ? 'text-emerald-700' : s < 400 ? 'text-blue-700' : s < 500 ? 'text-amber-700' : 'text-red-700';
  return <span className={`text-xs font-mono font-bold ${color}`}>{status ?? '—'}</span>;
}

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date et heure',
    cell: ({ row }) => {
      const ts = row.getValue('timestamp') as string;
      try {
        return (
          <span className="text-xs whitespace-nowrap">
            {format(new Date(ts), 'dd MMM yyyy HH:mm:ss')}
          </span>
        );
      } catch {
        return <span className="text-xs">{ts}</span>;
      }
    },
  },
  {
    accessorKey: 'username',
    header: 'Utilisateur',
    cell: ({ row }) => (
      <div>
        <p className="text-xs font-semibold">{row.getValue('username') || '—'}</p>
        <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
          {row.original.userId}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => <ActionBadge action={row.getValue('action')} />,
  },
  {
    accessorKey: 'resource',
    header: 'Ressource',
    cell: ({ row }) => (
      <div>
        <code className="text-xs bg-muted px-1 rounded">{row.getValue('resource')}</code>
        {row.original.resourceId && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[140px]">
            {row.original.resourceId}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'httpMethod',
    header: 'Méthode',
    cell: ({ row }) => (
      <span className="text-xs font-mono font-bold">{row.getValue('httpMethod')}</span>
    ),
  },
  {
    accessorKey: 'httpStatus',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.getValue('httpStatus')} />,
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.getValue('ipAddress') || '—'}</span>
    ),
  },
  {
    accessorKey: 'details',
    header: 'Détails',
    cell: ({ row }) => (
      <span
        className="truncate max-w-[250px] block text-xs text-muted-foreground"
        title={row.getValue('details')}
      >
        {row.getValue('details')}
      </span>
    ),
  },
];
