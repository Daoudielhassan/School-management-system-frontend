'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NotificationResponse } from '../types';

export function buildNotificationColumns(
  onMarkRead: (notification: NotificationResponse) => void,
  onDismiss: (notification: NotificationResponse) => void
): ColumnDef<NotificationResponse>[] {
  return [
    { accessorKey: 'title', header: 'Titre' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('type')}</Badge>,
    },
    { accessorKey: 'channel', header: 'Canal' },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'UNREAD' ? 'default' : status === 'DISMISSED' ? 'secondary' : 'outline'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'PP p'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className="flex justify-end gap-2">
            {notification.status === 'UNREAD' && (
              <Button size="sm" variant="outline" onClick={() => onMarkRead(notification)}>
                Marquer comme lu
              </Button>
            )}
            {notification.status !== 'DISMISSED' && (
              <Button size="sm" variant="outline" onClick={() => onDismiss(notification)}>
                Ignorer
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
